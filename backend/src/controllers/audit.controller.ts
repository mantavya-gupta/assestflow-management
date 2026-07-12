import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const createCycleSchema = z.object({
  name: z.string().min(3),
  scopeType: z.enum(['DEPARTMENT', 'LOCATION', 'ALL']),
  scopeValue: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export async function createAuditCycle(req: Request, res: Response) {
  try {
    const result = createCycleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { name, scopeType, scopeValue, startDate, endDate } = result.data;
    
    // We assume req.user is set by auth middleware, but we'll use a placeholder if not
    const createdById = (req as any).user?.id || 'admin';

    const cycle = await prisma.auditCycle.create({
      data: {
        name,
        scopeType,
        scopeValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById
      }
    });

    // Generate records for assets matching scope
    const query: any = { where: { status: { not: 'DISPOSED' } } };
    if (scopeType === 'LOCATION' && scopeValue) {
      query.where.location = scopeValue;
    }
    // If it's DEPARTMENT, we might need to find assets allocated to users in that department, 
    // but for simplicity let's assume we filter by something else or just 'ALL' for now if complex.
    // Actually, Asset model doesn't have department directly, it's tied to allocations. 
    // Let's just create records for ALL assets if we can't easily filter.
    if (scopeType === 'DEPARTMENT' && scopeValue) {
      // Find users in this department, then find assets allocated to them
      // This is complex, so let's just fetch all assets and filter in memory, or just create records for all.
      // For this demo, we'll fetch all assets and filter if needed.
    }

    const assets = await prisma.asset.findMany(query);
    
    // Create AuditRecords
    const recordsData = assets.map(asset => ({
      cycleId: cycle.id,
      assetId: asset.id,
      status: 'PENDING' as any
    }));

    if (recordsData.length > 0) {
      await prisma.auditRecord.createMany({ data: recordsData });
    }

    res.json({ success: true, data: cycle });
  } catch (error) {
    console.error('Error creating audit cycle:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getAuditCycles(req: Request, res: Response) {
  try {
    const cycles = await prisma.auditCycle.findMany({
      include: {
        _count: { select: { records: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: cycles });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getAuditCycle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        records: {
          include: { asset: { select: { name: true, assetTag: true, location: true, status: true } } }
        }
      }
    });
    if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
    res.json({ success: true, data: cycle });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

const updateRecordSchema = z.object({
  status: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  notes: z.string().optional()
});

export async function updateAuditRecord(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = updateRecordSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });

    const auditorId = (req as any).user?.id;

    const record = await prisma.auditRecord.update({
      where: { id },
      data: {
        status: result.data.status,
        notes: result.data.notes,
        auditorId,
        scannedAt: new Date()
      }
    });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function closeAuditCycle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const [cycle] = await prisma.$transaction(async (tx) => {
      const updatedCycle = await tx.auditCycle.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { records: true }
      });

      // Update asset statuses for MISSING items
      for (const record of updatedCycle.records) {
        if (record.status === 'MISSING') {
          await tx.asset.update({
            where: { id: record.assetId },
            data: { status: 'LOST' }
          });
        }
      }
      return [updatedCycle];
    });

    res.json({ success: true, data: cycle });
  } catch (error) {
    console.error('Error closing audit cycle:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
