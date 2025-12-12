import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📝 Updating announcement:', id);
    
    const announcementData = await request.json();
    console.log('📝 Announcement data for update:', announcementData);
    
    if (!id) {
      console.log('❌ No announcement ID provided for update');
      return NextResponse.json({
        error: 'Announcement ID is required for update'
      }, { status: 400 });
    }
    
    const announcementRef = doc(db, 'announcements', id);
    
    // Check if the document exists before updating
    const docSnap = await getDoc(announcementRef);
    if (!docSnap.exists()) {
      console.log('❌ Announcement not found for update:', id);
      return NextResponse.json({
        error: 'Announcement not found'
      }, { status: 404 });
    }
    
    await updateDoc(announcementRef, {
      ...announcementData,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Announcement updated successfully in Firebase with ID:', id);
    
    return NextResponse.json({
      success: true,
      id: id,
      announcement: { id: id, ...announcementData },
      message: 'Announcement updated successfully in Firebase',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating announcement:', error);
    
    return NextResponse.json({
      error: 'Failed to update announcement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting announcement:', id);
    
    if (!id) {
      console.log('❌ No announcement ID provided for deletion');
      return NextResponse.json({
        error: 'Announcement ID is required for deletion'
      }, { status: 400 });
    }
    
    const announcementRef = doc(db, 'announcements', id);
    
    // Check if the document exists before deleting
    const docSnap = await getDoc(announcementRef);
    if (!docSnap.exists()) {
      console.log('❌ Announcement not found for deletion:', id);
      return NextResponse.json({
        error: 'Announcement not found'
      }, { status: 404 });
    }
    
    await deleteDoc(announcementRef);
    
    console.log('✅ Announcement deleted successfully:', id);
    
    return NextResponse.json({
      success: true,
      id: id,
      message: 'Announcement deleted successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting announcement:', error);
    
    return NextResponse.json({
      error: 'Failed to delete announcement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('📢 Fetching announcement:', id);
    
    const announcementRef = doc(db, 'announcements', id);
    const docSnap = await getDoc(announcementRef);
    
    if (!docSnap.exists()) {
      console.log('❌ Announcement not found:', id);
      return NextResponse.json({
        error: 'Announcement not found'
      }, { status: 404 });
    }
    
    const announcement = {
      id: docSnap.id,
      ...docSnap.data()
    };
    
    console.log('✅ Announcement found:', id);
    
    return NextResponse.json({
      success: true,
      announcement,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching announcement:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch announcement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
