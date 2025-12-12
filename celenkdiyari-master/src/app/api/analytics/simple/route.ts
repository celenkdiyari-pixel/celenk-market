import { NextRequest, NextResponse } from 'next/server';
import { generateSimpleAnalytics, trackVisitor } from '@/lib/simple-analytics';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching simple analytics data...');
    
    // Basit analitik verileri oluştur
    const analyticsData = generateSimpleAnalytics();
    
    console.log('✅ Simple analytics data generated');
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      message: 'Simple analytics data fetched successfully'
    });
    
  } catch (error) {
    console.error('❌ Simple Analytics Error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch simple analytics data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Tracking visitor...');
    
    const body = await request.json();
    const { page, userAgent, ip } = body;
    
    // Ziyaretçi verilerini işle
    const visitorData = trackVisitor(page, userAgent, ip);
    
    console.log('✅ Visitor tracked:', visitorData);
    
    return NextResponse.json({
      success: true,
      data: visitorData,
      message: 'Visitor tracked successfully'
    });
    
  } catch (error) {
    console.error('❌ Visitor tracking error:', error);
    
    return NextResponse.json({
      error: 'Failed to track visitor',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
