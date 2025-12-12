import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json();
    
    const { orderNumber, message, type } = messageData;
    
    if (!orderNumber || !message) {
      return NextResponse.json(
        { error: 'Order number and message are required' },
        { status: 400 }
      );
    }

    const whatsappMessage = {
      orderNumber,
      message,
      type: type || 'support_request',
      createdAt: new Date().toISOString(),
      status: 'new',
      read: false
    };

    const docRef = await addDoc(collection(db, 'whatsapp-messages'), whatsappMessage);
    
    console.log('✅ WhatsApp message saved:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'WhatsApp message saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving WhatsApp message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save WhatsApp message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messagesQuery = query(
      collection(db, 'whatsapp-messages'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({
      success: true,
      messages,
      count: messages.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching WhatsApp messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch WhatsApp messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

