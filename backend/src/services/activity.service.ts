import { prisma } from '../lib/prisma';

export async function logActivity(
  userId: string,
  action: string,
  details?: string,
  assetId?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
        assetId
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function sendNotification(
  userId: string,
  message: string,
  type: string = 'INFO'
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        type
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
