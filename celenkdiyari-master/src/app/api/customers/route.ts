import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  limit, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc 
} from 'firebase/firestore';

// Müşteri oluşturma
export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating new customer...');
    
    const customerData = await request.json();
    
    // Gerekli alanları kontrol et
    if (!customerData.name || !customerData.email) {
      return NextResponse.json({
        error: 'Name and email are required'
      }, { status: 400 });
    }
    
    // Müşteri verilerini hazırla
    const customer = {
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
      tags: customerData.tags || [],
      notes: customerData.notes || '',
      source: customerData.source || 'website',
      isVip: false,
      customerSince: new Date().toISOString()
    };
    
    // Firestore'a kaydet
    const docRef = await addDoc(collection(db, 'customers'), customer);
    
    console.log('✅ Customer created successfully:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      customer: { id: docRef.id, ...customer },
      message: 'Müşteri başarıyla oluşturuldu'
    });
    
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    return NextResponse.json(
      { error: 'Müşteri oluşturulamadı' },
      { status: 500 }
    );
  }
}

// Müşteri listesi
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching customers...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limitCount = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    let q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'), limit(limitCount));
    
    // Status filtresi
    if (status !== 'all') {
      q = query(collection(db, 'customers'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    let customers: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Arama filtresi
    if (search) {
      customers = customers.filter((customer: any) => 
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search)
      );
    }
    
    // İstatistikleri hesapla
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      vip: customers.filter(c => c.isVip).length,
      newThisMonth: customers.filter(c => {
        const createdAt = new Date(c.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length
    };
    
    console.log(`✅ Found ${customers.length} customers`);
    
    return NextResponse.json({
      success: true,
      customers,
      stats,
      count: customers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Müşteriler alınamadı' },
      { status: 500 }
    );
  }
}

// Müşteri güncelleme
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating customer...');
    
    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        error: 'Customer ID is required'
      }, { status: 400 });
    }
    
    const customerRef = doc(db, 'customers', id);
    const updateFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(customerRef, updateFields);
    
    console.log('✅ Customer updated successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla güncellendi'
    });
    
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    return NextResponse.json(
      { error: 'Müşteri güncellenemedi' },
      { status: 500 }
    );
  }
}

// Müşteri silme
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting customer...');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'Customer ID is required'
      }, { status: 400 });
    }
    
    const customerRef = doc(db, 'customers', id);
    await deleteDoc(customerRef);
    
    console.log('✅ Customer deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    });
    
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Müşteri silinemedi' },
      { status: 500 }
    );
  }
}