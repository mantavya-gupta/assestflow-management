import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const bookingSchema = z.object({
  assetId: z.string().uuid(),
  userId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export async function createBooking(req: Request, res: Response) {
  try {
    const result = bookingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { assetId, userId, startTime, endTime } = result.data;
    
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    // Verify Asset is shared
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.shared) {
      return res.status(400).json({ error: 'Asset is not a bookable shared resource.' });
    }

    // Overlap validation
    // Find any booking where (newStart < existingEnd) AND (newEnd > existingStart)
    const overlappingBookings = await prisma.resourceBooking.findMany({
      where: {
        assetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      },
      include: { user: { select: { name: true } } }
    });

    if (overlappingBookings.length > 0) {
      const conflict = overlappingBookings[0];
      return res.status(409).json({ 
        error: `Time slot conflict: Resource is already booked by ${conflict.user.name} from ${conflict.startTime.toLocaleTimeString()} to ${conflict.endTime.toLocaleTimeString()}.` 
      });
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        assetId,
        userId,
        startTime: start,
        endTime: end,
        status: 'UPCOMING'
      }
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getBookings(req: Request, res: Response) {
  try {
    const { assetId, userId } = req.query;
    
    const query: any = { where: {} };
    if (assetId && typeof assetId === 'string') query.where.assetId = assetId;
    if (userId && typeof userId === 'string') query.where.userId = userId;

    const bookings = await prisma.resourceBooking.findMany({
      ...query,
      include: {
        asset: { select: { name: true, assetTag: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const booking = await prisma.resourceBooking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel this booking.' });
    }

    const updated = await prisma.resourceBooking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
