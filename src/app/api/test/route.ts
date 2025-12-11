import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test basic connection
    const testRef = collection(db, 'test');
    console.log('✅ Collection reference created');
    
    // Try to add a test document
    const testDoc = await addDoc(testRef, {
      message: 'Firebase test successful',
      timestamp: new Date().toISOString(),
      testId: Math.random().toString(36).substring(7)
    });
    
    console.log('✅ Document added with ID:', testDoc.id);
    
    // Try to read documents
    const snapshot = await getDocs(testRef);
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Documents retrieved:', docs.length);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection test successful',
      testDocId: testDoc.id,
      totalDocs: docs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
