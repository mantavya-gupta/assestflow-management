import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const updateEmployeeSchema = z.object({
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  departmentId: z.string().uuid().optional().nullable(),
});

export async function getEmployees(req: Request, res: Response) {
  try {
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}

export async function updateEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = updateEmployeeSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues[0].message });
    }

    const { role, status, departmentId } = result.data;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        status,
        departmentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: { select: { name: true } }
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
