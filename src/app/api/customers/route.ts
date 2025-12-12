import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Fetching customers from Firebase...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let customersQuery = query(
      collection(db, 'customers'),
      orderBy('registrationDate', 'desc')
    );
    
    if (status && status !== 'all') {
      customersQuery = query(customersQuery, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(customersQuery);
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${customers.length} customers`);
    
    return NextResponse.json({
      success: true,
      customers,
      count: customers.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 Creating new customer...');
    
    const customerData = await request.json();
    console.log('📝 Customer data:', customerData);
    
    // Validate required fields
    if (!customerData.firstName || !customerData.lastName || !customerData.email) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: firstName, lastName, email',
        received: customerData
      }, { status: 400 });
    }
    
    const customer = {
      ...customerData,
      totalOrders: customerData.totalOrders || 0,
      totalSpent: customerData.totalSpent || 0,
      registrationDate: customerData.registrationDate || new Date().toISOString(),
      status: customerData.status || 'active',
      tags: customerData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating customer');
    
    const docRef = await addDoc(collection(db, 'customers'), customer);
    
    console.log('✅ Customer created successfully in Firebase with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      customer: { id: docRef.id, ...customer },
      message: 'Customer created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    
    return NextResponse.json({
      error: 'Failed to create customer',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

