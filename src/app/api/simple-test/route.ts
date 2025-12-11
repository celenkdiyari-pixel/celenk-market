import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Simple API test...');
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      test: 'Simple test successful'
    });
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
