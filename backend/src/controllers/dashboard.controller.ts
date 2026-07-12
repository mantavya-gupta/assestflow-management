import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const assetsAvailable = await prisma.asset.count({
      where: { status: 'AVAILABLE' }
    });

    const assetsAllocated = await prisma.asset.count({
      where: { status: 'ALLOCATED' }
    });

    const maintenanceToday = await prisma.maintenanceRequest.count({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }
    });

    const activeBookings = await prisma.assetAllocation.count({
      where: { status: 'ACTIVE' }
    });

    const pendingTransfers = await prisma.transfer.count({
      where: { status: 'PENDING' }
    });

    const now = new Date();
    
    // Calculate date for 7 days from now
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get overdue returns
    const overdueReturnsData = await prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: now }
      },
      include: {
        asset: true,
        assignee: true
      },
      orderBy: {
        expectedReturnDate: 'asc'
      },
      take: 5
    });

    // Get upcoming returns (next 7 days)
    const upcomingReturnsData = await prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      },
      include: {
        asset: true,
        assignee: true
      },
      orderBy: {
        expectedReturnDate: 'asc'
      },
      take: 5
    });

    // Format for frontend
    const formatReturn = (allocation: any) => ({
      id: allocation.id,
      assetName: allocation.asset.name,
      assignee: allocation.assignee.name,
      dueDate: allocation.expectedReturnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysOverdue: allocation.expectedReturnDate < now ? 
        Math.floor((now.getTime() - allocation.expectedReturnDate.getTime()) / (1000 * 3600 * 24)) : undefined
    });

    res.json({
      success: true,
      data: {
        kpi: {
          assetsAvailable,
          assetsAllocated,
          maintenanceToday,
          activeBookings,
          pendingTransfers,
          upcomingReturns: upcomingReturnsData.length // just the count for the KPI card
        },
        overdueReturns: overdueReturnsData.map(formatReturn),
        upcomingReturns: upcomingReturnsData.map(formatReturn)
      }
    });

  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getEmployeeDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get allocations for this user
    const userAllocations = await prisma.assetAllocation.findMany({
      where: {
        assigneeId: userId,
        status: 'ACTIVE'
      },
      include: {
        asset: true
      }
    });

    // Extract asset IDs to find related maintenance requests
    const assetIds = userAllocations.map(a => a.assetId);

    const pendingRequests = await prisma.maintenanceRequest.count({
      where: {
        assetId: { in: assetIds },
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });

    const upcomingReturnsData = userAllocations.filter(
      a => a.expectedReturnDate >= now && a.expectedReturnDate <= sevenDaysFromNow
    ).sort((a, b) => a.expectedReturnDate.getTime() - b.expectedReturnDate.getTime());

    const formatReturn = (allocation: any) => ({
      id: allocation.id,
      assetName: allocation.asset.name,
      dueDate: allocation.expectedReturnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysOverdue: allocation.expectedReturnDate < now ? 
        Math.floor((now.getTime() - allocation.expectedReturnDate.getTime()) / (1000 * 3600 * 24)) : undefined
    });

    res.json({
      success: true,
      data: {
        kpi: {
          myAssets: userAllocations.length,
          pendingRequests,
          upcomingReturns: upcomingReturnsData.length
        },
        myAssetsList: userAllocations.map(a => ({
          id: a.id,
          assetName: a.asset.name,
          status: a.asset.status,
          dueDate: a.expectedReturnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        })),
        upcomingReturns: upcomingReturnsData.map(formatReturn)
      }
    });

  } catch (error) {
    console.error('Error in getEmployeeDashboardSummary:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
