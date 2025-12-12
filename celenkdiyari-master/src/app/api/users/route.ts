import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  phone: string;
  notes: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    console.log('👤 Loading users...');

    let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    // Role filtresi
    if (role && role !== 'all') {
      q = query(q, where('role', '==', role));
    }

    // Status filtresi
    if (status && status !== 'all') {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    let users: User[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    // Search filtresi
    if (search) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json(users);
  } catch (error) {
    console.error('❌ Error loading users:', error);
    return NextResponse.json(
      { error: 'Kullanıcı verileri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, firstName, lastName, role, status, phone, notes, password } = body;

    console.log(`👤 Creating user: ${username}`);

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Role permissions'ları belirle
    const rolePermissions = {
      admin: ['all'],
      manager: ['products', 'orders', 'customers', 'analytics'],
      staff: ['products', 'orders'],
      viewer: ['view']
    };

    const userData = {
      username,
      email,
      firstName,
      lastName,
      role: role || 'staff',
      status: status || 'active',
      phone: phone || '',
      notes: notes || '',
      password: hashedPassword,
      permissions: rolePermissions[role as keyof typeof rolePermissions] || ['view'],
      lastLogin: '',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'users'), userData);
    
    console.log(`✅ User created: ${docRef.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı başarıyla oluşturuldu',
      userId: docRef.id
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, ...updateData } = body;

    console.log(`👤 Updating user: ${id}`);

    // Eğer şifre güncelleniyorsa hash'le
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await updateDoc(doc(db, 'users', id), updateData);
    
    console.log(`✅ User updated: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken hata oluştu' },
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
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    console.log(`👤 Deleting user: ${id}`);

    await deleteDoc(doc(db, 'users', id));
    
    console.log(`✅ User deleted: ${id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
