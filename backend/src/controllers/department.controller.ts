import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  headId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function createDepartment(req: Request, res: Response) {
  try {
    const result = departmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { name, status, headId, parentId } = result.data;
    
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: 'A department with this name already exists.' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        status: status || 'ACTIVE',
        headId,
        parentId,
      }
    });

    res.json({ success: true, data: department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getDepartments(req: Request, res: Response) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        head: {
          select: { id: true, name: true, email: true }
        },
        parent: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function updateDepartment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = departmentSchema.partial().safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { name, status, headId, parentId } = result.data;

    // Optional: prevent setting parent to self
    if (parentId === id) {
      return res.status(400).json({ error: 'Department cannot be its own parent.' });
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        status,
        headId,
        parentId,
      }
    });

    res.json({ success: true, data: department });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function getEligibleHeads(req: Request, res: Response) {
  try {
    // For now, return all ACTIVE users, or just everyone (could restrict to certain roles)
    const users = await prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching eligible heads:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
