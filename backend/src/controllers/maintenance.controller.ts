import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const maintenanceSchema = z.object({
  assetId: z.string().uuid(),
  issue: z.string().min(5, 'Issue description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  photoUrl: z.string().optional()
});

export async function createMaintenance(req: Request, res: Response) {
  try {
    const result = maintenanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { assetId, issue, priority, photoUrl } = result.data;

    // Verify asset exists
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        issue,
        priority: priority || 'MEDIUM',
        photoUrl,
        status: 'PENDING'
      }
    });

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function listMaintenanceRequests(req: Request, res: Response) {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { name: true, assetTag: true, type: true } },
        technician: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS', 'RESOLVED']),
  technicianId: z.string().uuid().optional(),
});

export async function updateMaintenanceStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { status, technicianId } = result.data;

    const currentRequest = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!currentRequest) {
      return res.status(404).json({ error: 'Maintenance request not found.' });
    }

    const updates: any = { status };
    if (technicianId) updates.technicianId = technicianId;
    if (status === 'RESOLVED') updates.resolvedDate = new Date();

    const [updatedRequest] = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.update({
        where: { id },
        data: updates
      });

      // Auto-update Asset Status based on workflow rules
      if (status === 'APPROVED' || status === 'IN_PROGRESS') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'MAINTENANCE' }
        });
      } else if (status === 'RESOLVED') {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'AVAILABLE' }
        });
      }

      return [request];
    });

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
