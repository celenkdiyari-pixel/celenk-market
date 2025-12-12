import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Sistem sağlık kontrolü endpoint'i
export async function GET() {
  try {
    console.log('🔍 System health check starting...');
    
    const healthChecks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {} as Record<string, { status: string; count?: number; message: string; [key: string]: unknown }>,
      errors: [] as string[]
    };

    // Firebase bağlantı kontrolü
    try {
      console.log('🔧 Checking Firebase connection...');
      const testRef = collection(db, 'products');
      const testQuery = query(testRef, limit(1));
      const testSnapshot = await getDocs(testQuery);
      
      healthChecks.services.firebase = {
        status: 'connected',
        message: 'Firebase connection successful',
        productsCount: testSnapshot.docs.length
      };
      console.log('✅ Firebase connection OK');
    } catch (error) {
      const errorMsg = `Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMsg);
      healthChecks.services.firebase = {
        status: 'error',
        message: errorMsg
      };
      console.error('❌ Firebase connection failed:', error);
    }

    // Ürünler koleksiyonu kontrolü
    try {
      console.log('📦 Checking products collection...');
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      
      healthChecks.services.products = {
        status: 'ok',
        count: productsSnapshot.docs.length,
        message: `Found ${productsSnapshot.docs.length} products`
      };
      console.log('✅ Products collection OK');
    } catch (error) {
      const errorMsg = `Products collection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMsg);
      healthChecks.services.products = {
        status: 'error',
        message: errorMsg
      };
      console.error('❌ Products collection failed:', error);
    }

    // Siparişler koleksiyonu kontrolü
    try {
      console.log('🛒 Checking orders collection...');
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      
      healthChecks.services.orders = {
        status: 'ok',
        count: ordersSnapshot.docs.length,
        message: `Found ${ordersSnapshot.docs.length} orders`
      };
      console.log('✅ Orders collection OK');
    } catch (error) {
      const errorMsg = `Orders collection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMsg);
      healthChecks.services.orders = {
        status: 'error',
        message: errorMsg
      };
      console.error('❌ Orders collection failed:', error);
    }

    // Analytics koleksiyonu kontrolü
    try {
      console.log('📊 Checking analytics collection...');
      const analyticsRef = collection(db, 'analytics');
      const analyticsSnapshot = await getDocs(analyticsRef);
      
      healthChecks.services.analytics = {
        status: 'ok',
        count: analyticsSnapshot.docs.length,
        message: `Found ${analyticsSnapshot.docs.length} analytics records`
      };
      console.log('✅ Analytics collection OK');
    } catch (error) {
      const errorMsg = `Analytics collection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMsg);
      healthChecks.services.analytics = {
        status: 'error',
        message: errorMsg
      };
      console.error('❌ Analytics collection failed:', error);
    }

    // Genel sistem durumu
    if (healthChecks.errors.length > 0) {
      healthChecks.status = 'degraded';
    }

    console.log('🔍 System health check completed:', {
      status: healthChecks.status,
      errors: healthChecks.errors.length,
      services: Object.keys(healthChecks.services).length
    });

    return NextResponse.json(healthChecks);

  } catch (error) {
    console.error('❌ System health check failed:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: 'System health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}
