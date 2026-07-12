import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getDashboardReports(req: Request, res: Response) {
  try {
    // 1. Status Distribution
    const statusCountsRaw = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const statusDistribution = statusCountsRaw.map(s => ({
      name: s.status,
      value: s._count.status
    }));

    // 2. Department Allocation Summary
    // We fetch all active allocations and group them by user's department
    const activeAllocations = await prisma.assetAllocation.findMany({
      where: { status: 'ACTIVE' },
      include: {
        assignee: {
          include: { department: true }
        }
      }
    });

    const deptMap: Record<string, number> = {};
    activeAllocations.forEach(alloc => {
      const deptName = alloc.assignee.department?.name || 'Unassigned';
      deptMap[deptName] = (deptMap[deptName] || 0) + 1;
    });

    const departmentAllocations = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

    // 3. Maintenance Frequency by Asset Category
    const maintenanceCounts = await prisma.maintenanceRequest.findMany({
      include: { asset: { select: { type: true } } }
    });

    const maintMap: Record<string, number> = {};
    maintenanceCounts.forEach(m => {
      const type = m.asset.type;
      maintMap[type] = (maintMap[type] || 0) + 1;
    });
    
    const maintenanceFrequency = Object.entries(maintMap).map(([name, value]) => ({ name, value }));

    res.json({
      success: true,
      data: {
        statusDistribution,
        departmentAllocations,
        maintenanceFrequency
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
