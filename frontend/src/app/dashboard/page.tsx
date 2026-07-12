import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { AdminDashboard } from './components/admin-dashboard';
import { EmployeeDashboard } from './components/employee-dashboard';
import { Header } from './components/header';
import { API_URL } from '@/lib/api';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  return new TextEncoder().encode(secret || 'dev-only-insecure-secret');
}

interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
}


interface ReturnItem {
  id: string;
  assetName: string;
  assignee: string;
  dueDate: string;
  daysOverdue?: number;
}



async function getDashboardData(role: string, sessionCookie: any) {
  const endpoint = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(role) 
    ? `${API_URL}/api/dashboard/summary`
    : `${API_URL}/api/dashboard/employee-summary`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }

  if (res.status === 401) {
    redirect('/login');
  }

  if (!res.ok) {
    console.error('Failed to fetch dashboard data:', res.status);
    return null;
  }

  const json = await res.json();
  return json.data;
}

export default async function DashboardPage() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    redirect('/login');
  }

  let userRole = 'EMPLOYEE';
  let userObject: any = null;
  try {
    const { payload } = await jwtVerify(sessionCookie.value, getSecretKey(), { algorithms: ['HS256'] });
    const user = payload.user as SessionUser;
    userRole = user.role;
    userObject = user;
  } catch (e) {
    redirect('/login');
  }

  const data = await getDashboardData(userRole, sessionCookie);
  const isAdmin = ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'].includes(userRole);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pb-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10">
        
        {userObject && <Header user={userObject} />}

        {isAdmin ? (
          <AdminDashboard data={data} />
        ) : (
          <EmployeeDashboard data={data} />
        )}
      </div>
    </div>
  );
}
