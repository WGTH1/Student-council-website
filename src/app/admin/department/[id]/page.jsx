'use client';

import { use, useEffect } from 'react';
import { useAuth } from '@/libs/auth-context';
import { useRouter } from 'next/navigation';
import DepartmentView from '@/components/DepartmentView';

export default function AdminDepartmentPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;
  
  return <DepartmentView id={id} isAdmin={true} />;
}
