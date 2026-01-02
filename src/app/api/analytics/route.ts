import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface OrderData {
  id: string;
  createdAt: string;
  total?: number;
  customer?: {
    email?: string;
  };
  items?: Array<{
    productId?: string;
    productName?: string;
    quantity?: number;
    price?: number;
    category?: string;
  }>;
}

interface CustomerData {
  id: string;
  registrationDate?: string;
  createdAt?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching analytics data from Firebase...');

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30';
    const days = parseInt(dateRange);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch orders for sales data
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const allOrders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter orders by date range
    const filteredOrders = allOrders.filter((order: OrderData) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Calculate sales data
    const salesDataMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>();

    filteredOrders.forEach((order: OrderData) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const existing = salesDataMap.get(date) || { revenue: 0, orders: 0, customers: new Set() };

      existing.revenue += Number(order.total || 0);
      existing.orders += 1;
      if (order.customer?.email) {
        existing.customers.add(order.customer.email);
      }

      salesDataMap.set(date, existing);
    });

    const salesData = Array.from(salesDataMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate product performance
    const productPerformanceMap = new Map<string, { name: string; category: string; sales: number; revenue: number; orders: number }>();

    filteredOrders.forEach((order: OrderData) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const productId = item.productId || item.productName || 'Unknown';
          const existing = productPerformanceMap.get(productId) || {
            name: item.productName || String(productId),
            category: 'Unknown',
            sales: 0,
            revenue: 0,
            orders: 0
          };

          // Try to get category from item
          if (item.category) {
            if (typeof item.category === 'string' && item.category.trim() !== '') {
              existing.category = item.category;
            } else if (Array.isArray(item.category) && item.category.length > 0) {
              existing.category = String(item.category[0]);
            }
          }

          if (item.productName) existing.name = item.productName;

          existing.sales += Number(item.quantity || 0);
          existing.revenue += Number(item.price || 0) * Number(item.quantity || 0);
          existing.orders += 1;

          productPerformanceMap.set(productId, existing);
        });
      }
    });

    const productPerformance = Array.from(productPerformanceMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      category: data.category,
      sales: data.sales,
      revenue: data.revenue,
      orders: data.orders,
      avgRating: 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Calculate customer analytics
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    const allCustomers = customersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const newCustomers = allCustomers.filter((customer: CustomerData) => {
      const regDate = new Date(customer.registrationDate || customer.createdAt || '');
      return regDate >= startDate;
    });

    const customerEmails = new Set(filteredOrders.map((order: OrderData) => order.customer?.email).filter(Boolean));
    const returningCustomers = Array.from(customerEmails).length;

    const totalRevenue = filteredOrders.reduce((sum: number, order: OrderData) => sum + Number(order.total || 0), 0);
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const customerAnalytics = {
      totalCustomers: allCustomers.length,
      newCustomers: newCustomers.length,
      returningCustomers,
      avgOrderValue,
      customerLifetimeValue: avgOrderValue * 4.4 // Estimated
    };

    // Calculate category analytics
    const categoryMap = new Map<string, { revenue: number; orders: number; products: Set<string> }>();

    filteredOrders.forEach((order: OrderData) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          // Normalize category from item or default to 'Unknown'
          let category = 'Unknown';
          const catRaw = item.category;

          if (typeof catRaw === 'string' && catRaw.trim() !== '') {
            category = catRaw;
          } else if (Array.isArray(catRaw) && catRaw.length > 0) {
            category = String(catRaw[0]);
          }

          const existing = categoryMap.get(category) || { revenue: 0, orders: 0, products: new Set() };

          existing.revenue += Number(item.price || 0) * Number(item.quantity || 0);
          existing.orders += 1;
          existing.products.add(item.productId || item.productName);

          categoryMap.set(category, existing);
        });
      }
    });

    const categoryAnalytics = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      orders: data.orders,
      products: data.products.size,
      growth: 0 // Would need historical data to calculate
    })).sort((a, b) => b.revenue - a.revenue);


    console.log(`✅ Analytics data calculated: ${salesData.length} days, ${productPerformance.length} products`);

    return NextResponse.json({
      success: true,
      salesData,
      productPerformance,
      customerAnalytics,
      categoryAnalytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);

    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

