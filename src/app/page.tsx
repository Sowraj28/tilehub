import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default function Home() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  const subAdminToken = cookieStore.get('subadmin_token')?.value;

  if (adminToken && verifyToken(adminToken)) {
    redirect('/admin/dashboard');
  }
  if (subAdminToken && verifyToken(subAdminToken)) {
    redirect('/subadmin/dashboard');
  }
  redirect('/admin/login');
}
