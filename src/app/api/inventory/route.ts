import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('📦 Fetching inventory from Firebase...');
    
    const inventoryQuery = query(
      collection(db, 'inventory'),
      orderBy('productName', 'asc')
    );
    
    const querySnapshot = await getDocs(inventoryQuery);
    const inventory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Found ${inventory.length} inventory items`);
    
    return NextResponse.json({
      success: true,
      items: inventory,
      count: inventory.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch inventory',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Creating new inventory item...');
    
    const itemData = await request.json();
    console.log('📝 Inventory item data:', itemData);
    
    // Validate required fields
    if (!itemData.productId || !itemData.productName) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: productId, productName',
        received: itemData
      }, { status: 400 });
    }
    
    const item = {
      ...itemData,
      currentStock: itemData.currentStock || 0,
      minStockLevel: itemData.minStockLevel || 0,
      maxStockLevel: itemData.maxStockLevel || 0,
      unitCost: itemData.unitCost || 0,
      totalValue: (itemData.currentStock || 0) * (itemData.unitCost || 0),
      status: itemData.status || 'in_stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Validation passed, creating inventory item');
    
    const docRef = await addDoc(collection(db, 'inventory'), item);
    
    console.log('✅ Inventory item created successfully in Firebase with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      item: { id: docRef.id, ...item },
      message: 'Inventory item created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating inventory item:', error);
    
    return NextResponse.json({
      error: 'Failed to create inventory item',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

