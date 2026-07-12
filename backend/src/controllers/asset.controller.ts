import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const assetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.string().min(2, 'Type must be at least 2 characters'),
  serialNumber: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.number().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  shared: z.boolean().optional(),
});

export async function createAsset(req: Request, res: Response) {
  try {
    const result = assetSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { name, type, serialNumber, acquisitionDate, acquisitionCost, condition, location, shared } = result.data;
    
    // Auto-generate Asset Tag (e.g. AF-0001)
    const count = await prisma.asset.count();
    const assetTag = `AF-${String(count + 1).padStart(4, '0')}`;

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        type,
        status: 'AVAILABLE',
        serialNumber,
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
        acquisitionCost,
        condition,
        location,
        shared,
      }
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getAssets(req: Request, res: Response) {
  try {
    const { status, type, location, condition, search } = req.query;
    
    const query: any = { where: {} };
    
    if (status && typeof status === 'string') {
      query.where.status = status.toUpperCase() as any;
    }
    if (type && typeof type === 'string') {
      query.where.type = type;
    }
    if (location && typeof location === 'string') {
      query.where.location = location;
    }
    if (condition && typeof condition === 'string') {
      query.where.condition = condition;
    }
    if (search && typeof search === 'string') {
      query.where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const assets = await prisma.asset.findMany(query);
    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getAssetById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: {
          include: { assignee: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' }
        },
        transfers: {
          include: { 
            fromUser: { select: { name: true } }, 
            toUser: { select: { name: true } } 
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
