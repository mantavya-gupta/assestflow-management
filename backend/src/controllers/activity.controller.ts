import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
        asset: { select: { name: true, assetTag: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // limit to recent 100 for performance
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
