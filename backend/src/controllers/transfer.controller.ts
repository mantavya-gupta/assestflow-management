import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const transferRequestSchema = z.object({
  assetId: z.string().uuid(),
  toUserId: z.string().uuid(),
  // fromUserId is inferred from the current active allocation
});

export async function createTransferRequest(req: Request, res: Response) {
  try {
    const result = transferRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { assetId, toUserId } = result.data;

    // Find current active allocation
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { allocations: { where: { status: 'ACTIVE' } } }
    });

    if (!asset || asset.allocations.length === 0) {
      return res.status(404).json({ error: 'No active allocation found for this asset.' });
    }

    const activeAllocation = asset.allocations[0];

    // Create Transfer Request
    const transfer = await prisma.transfer.create({
      data: {
        assetId,
        fromUserId: activeAllocation.assigneeId,
        toUserId,
        status: 'PENDING'
      }
    });

    res.json({ success: true, data: transfer });
  } catch (error) {
    console.error('Error creating transfer request:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function approveTransfer(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({ where: { id } });
    if (!transfer || transfer.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending transfer request not found.' });
    }

    // Find the active allocation for this asset
    const activeAllocation = await prisma.assetAllocation.findFirst({
      where: { assetId: transfer.assetId, status: 'ACTIVE' }
    });

    if (!activeAllocation) {
      return res.status(400).json({ error: 'Cannot approve transfer: No active allocation found.' });
    }

    // 1. Mark transfer COMPLETED
    // 2. Mark old allocation RETURNED
    // 3. Create new allocation for `toUser`
    const [updatedTransfer, newAllocation] = await prisma.$transaction([
      prisma.transfer.update({
        where: { id },
        data: { status: 'COMPLETED' }
      }),
      prisma.assetAllocation.update({
        where: { id: activeAllocation.id },
        data: { status: 'RETURNED', actualReturnDate: new Date(), returnNotes: 'Transferred to another user' }
      }),
      prisma.assetAllocation.create({
        data: {
          assetId: transfer.assetId,
          assigneeId: transfer.toUserId,
          // Set an arbitrary expected return date, e.g. 1 year from now, or require it from the approval payload
          expectedReturnDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      })
    ]);

    res.json({ success: true, data: { updatedTransfer, newAllocation } });
  } catch (error) {
    console.error('Error approving transfer:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getTransfers(req: Request, res: Response) {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        asset: true,
        fromUser: { select: { name: true, email: true } },
        toUser: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: transfers });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
