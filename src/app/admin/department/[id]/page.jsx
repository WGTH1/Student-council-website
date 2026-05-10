'use client';

import { use } from 'react';
import DepartmentView from '@/components/DepartmentView';

export default function AdminDepartmentPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  return <DepartmentView id={id} isAdmin={true} />;
}
