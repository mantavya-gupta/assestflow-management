import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { logActivity, sendNotification } from '../services/activity.service';

const allocationSchema = z.object({
  assetId: z.string().uuid(),
  assigneeId: z.string().uuid(),
  expectedReturnDate: z.string().datetime(),
});

export async function createAllocation(req: Request, res: Response) {
  try {
    const result = allocationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { assetId, assigneeId, expectedReturnDate } = result.data;
    
    // Check if asset is available. If it's ALLOCATED or RESERVED, block it.
    const asset = await prisma.asset.findUnique({ 
      where: { id: assetId },
      include: { allocations: { where: { status: 'ACTIVE' }, include: { assignee: true } } }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    if (asset.status === 'ALLOCATED' || asset.status === 'RESERVED') {
      const currentAssignee = asset.allocations[0]?.assignee?.name || 'someone';
      return res.status(409).json({ 
        error: `Conflict: This asset is currently held by ${currentAssignee}.`,
        conflict: true,
        currentAssigneeId: asset.allocations[0]?.assigneeId
      });
    }

    if (asset.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Asset cannot be booked. Current status: ${asset.status}` });
    }

    // Create allocation and update asset status in a transaction
    const [allocation] = await prisma.$transaction([
      prisma.assetAllocation.create({
        data: {
          assetId,
          assigneeId,
          expectedReturnDate: new Date(expectedReturnDate),
          status: 'ACTIVE'
        }
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' }
      })
    ]);

    const actorId = (req as any).user?.id || 'admin';
    await logActivity(actorId, 'ASSET_ALLOCATED', `Assigned to user ${assigneeId}`, assetId);
    await sendNotification(assigneeId, `An asset has been assigned to you.`, 'INFO');

    res.json({ success: true, data: allocation });
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

const returnSchema = z.object({
  returnNotes: z.string().optional(),
});

export async function returnAllocation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = returnSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { returnNotes } = result.data;

    const allocation = await prisma.assetAllocation.findUnique({ where: { id } });
    if (!allocation || allocation.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Active allocation not found.' });
    }

    // Update allocation to RETURNED and asset to AVAILABLE
    const [updatedAllocation] = await prisma.$transaction([
      prisma.assetAllocation.update({
        where: { id },
        data: {
          status: 'RETURNED',
          actualReturnDate: new Date(),
          returnNotes
        }
      }),
      prisma.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' }
      })
    ]);

    const actorId = (req as any).user?.id || 'admin';
    await logActivity(actorId, 'ASSET_RETURNED', `Asset returned`, allocation.assetId);

    res.json({ success: true, data: updatedAllocation });
  } catch (error) {
    console.error('Error returning allocation:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getAllocations(req: Request, res: Response) {
  try {
    const allocations = await prisma.assetAllocation.findMany({
      include: {
        asset: true,
        assignee: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: allocations });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
