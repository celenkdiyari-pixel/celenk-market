import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎭 Loading roles...');
    
    // Firebase'den roles verilerini çek
    const rolesRef = collection(db, 'roles');
    const snapshot = await getDocs(rolesRef);
    
    let roles: Role[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Role[];

    // Eğer hiç role yoksa default role'leri oluştur
    if (roles.length === 0) {
      const defaultRoles: Role[] = [
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

      // Default role'leri Firebase'e ekle
      for (const role of defaultRoles) {
        await addDoc(collection(db, 'roles'), role);
      }

      roles = defaultRoles;
    }

    console.log(`✅ Found ${roles.length} roles`);

    return NextResponse.json(roles);
  } catch (error) {
    console.error('❌ Error loading roles:', error);
    return NextResponse.json(
      { error: 'Role verileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, color } = body;

    console.log(`🎭 Creating role: ${name}`);

    const roleData = {
      name,
      description,
      permissions: permissions || [],
      color: color || 'bg-gray-100 text-gray-800'
    };

    const docRef = await addDoc(collection(db, 'roles'), roleData);
    
    console.log(`✅ Role created: ${docRef.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Role başarıyla oluşturuldu',
      roleId: docRef.id
    });
  } catch (error) {
    console.error('❌ Error creating role:', error);
    return NextResponse.json(
      { error: 'Role oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    console.log(`🎭 Updating role: ${id}`);

    await updateDoc(doc(db, 'roles', id), updateData);
    
    console.log(`✅ Role updated: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Role başarıyla güncellendi'
    });
  } catch (error) {
    console.error('❌ Error updating role:', error);
    return NextResponse.json(
      { error: 'Role güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID gerekli' },
        { status: 400 }
      );
    }

    console.log(`🎭 Deleting role: ${id}`);

    await deleteDoc(doc(db, 'roles', id));
    
    console.log(`✅ Role deleted: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Role başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Error deleting role:', error);
    return NextResponse.json(
      { error: 'Role silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
