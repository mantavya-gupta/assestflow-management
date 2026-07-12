import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const maintenanceSchema = z.object({
  assetId: z.string().uuid(),
  issue: z.string().min(5, 'Issue description must be at least 5 characters'),
});

export async function createMaintenance(req: Request, res: Response) {
  try {
    const result = maintenanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { assetId, issue } = result.data;
    
    // Check if asset exists
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Create maintenance request and update asset status in a transaction
    const [maintenance] = await prisma.$transaction([
      prisma.maintenanceRequest.create({
        data: {
          assetId,
          issue,
          status: 'PENDING'
        }
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: { status: 'MAINTENANCE' }
      })
    ]);

    res.json({ success: true, data: maintenance });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
