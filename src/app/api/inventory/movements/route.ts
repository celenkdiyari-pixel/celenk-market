import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching stock movements from Firebase...');
    
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const limitCount = parseInt(searchParams.get('limit') || '100');
    
    const movementsQuery = query(
      collection(db, 'stockMovements'),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(movementsQuery);
    let movements: Array<{ id: string; itemId?: string; [key: string]: unknown }> = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{ id: string; itemId?: string; [key: string]: unknown }>;
    
    // Filter by itemId if provided
    if (itemId) {
      movements = movements.filter((movement) => movement.itemId === itemId);
    }
    
    console.log(`✅ Found ${movements.length} stock movements`);
    
    return NextResponse.json({
      success: true,
      movements,
      count: movements.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching stock movements:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch stock movements',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Creating new stock movement...');
    
    const movementData = await request.json();
    console.log('📝 Stock movement data:', movementData);
    
    // Validate required fields
    if (!movementData.itemId || !movementData.type || !movementData.quantity) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: itemId, type, quantity',
        received: movementData
      }, { status: 400 });
    }
    
    const movement = {
      ...movementData,
      date: movementData.date || new Date().toISOString(),
      user: movementData.user || 'Admin',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating stock movement');
    
    const docRef = await addDoc(collection(db, 'stockMovements'), movement);
    
    console.log('✅ Stock movement created successfully in Firebase with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      movement: { id: docRef.id, ...movement },
      message: 'Stock movement created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating stock movement:', error);
    
    return NextResponse.json({
      error: 'Failed to create stock movement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

