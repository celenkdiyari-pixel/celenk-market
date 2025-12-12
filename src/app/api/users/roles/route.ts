import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🎭 Fetching roles from Firebase...');
    
    const rolesSnapshot = await getDocs(collection(db, 'roles'));
    const roles = rolesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // If no roles in Firebase, return default roles
    if (roles.length === 0) {
      const defaultRoles = [
        {
          id: 'admin',
          name: 'Yönetici',
          description: 'Tam sistem erişimi',
          permissions: ['all'],
          color: 'bg-red-100 text-red-800'
        },
        {
          id: 'manager',
          name: 'Müdür',
          description: 'İşletme yönetimi',
          permissions: ['products', 'orders', 'customers', 'analytics'],
          color: 'bg-blue-100 text-blue-800'
        },
        {
          id: 'staff',
          name: 'Personel',
          description: 'Günlük işlemler',
          permissions: ['products', 'orders'],
          color: 'bg-green-100 text-green-800'
        },
        {
          id: 'viewer',
          name: 'Görüntüleyici',
          description: 'Sadece görüntüleme',
          permissions: ['view'],
          color: 'bg-gray-100 text-gray-800'
        }
      ];
      
      return NextResponse.json({
        success: true,
        roles: defaultRoles,
        count: defaultRoles.length,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Found ${roles.length} roles`);
    
    return NextResponse.json({
      success: true,
      roles,
      count: roles.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch roles',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

