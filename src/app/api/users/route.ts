import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('👤 Fetching users from Firebase...');
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    
    let usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    
    if (role && role !== 'all') {
      usersQuery = query(usersQuery, where('role', '==', role));
    }
    
    if (status && status !== 'all') {
      usersQuery = query(usersQuery, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(usersQuery);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${users.length} users`);
    
    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating new user...');
    
    const userData = await request.json();
    console.log('📝 User data:', userData);
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.firstName || !userData.lastName) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: username, email, firstName, lastName',
        received: userData
      }, { status: 400 });
    }
    
    const user = {
      ...userData,
      role: userData.role || 'staff',
      status: userData.status || 'active',
      permissions: userData.permissions || [],
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating user');
    
    const docRef = await addDoc(collection(db, 'users'), user);
    
    console.log('✅ User created successfully in Firebase with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      user: { id: docRef.id, ...user },
      message: 'User created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    return NextResponse.json({
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

