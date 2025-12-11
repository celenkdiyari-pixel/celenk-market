import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Announcement } from '@/types/announcement';

export async function POST(request: NextRequest) {
  try {
    console.log('📢 Creating new announcement...');
    
    const announcementData = await request.json();
    console.log('📝 Raw announcement data:', JSON.stringify(announcementData, null, 2));
    
    // Validate required fields
    if (!announcementData.title || !announcementData.content || !announcementData.type) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json({
        error: 'Missing required fields: title, content, type',
        received: announcementData
      }, { status: 400 });
    }
    
    const announcement = {
      ...announcementData,
      isActive: announcementData.isActive ?? true,
      priority: announcementData.priority ?? 5,
      showCloseButton: announcementData.showCloseButton ?? true,
      autoHide: announcementData.autoHide ?? false,
      targetPages: announcementData.targetPages ?? ['home'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };
    
    console.log('📝 Processed announcement:', JSON.stringify(announcement, null, 2));
    console.log('🔥 Firebase DB object:', db);
    
    const docRef = await addDoc(collection(db, 'announcements'), announcement);
    console.log('✅ Announcement created with ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      announcement: {
        id: docRef.id,
        ...announcement
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      error: 'Failed to create announcement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📢 Fetching announcements...');
    
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const activeOnly = searchParams.get('active') === 'true';
    
    console.log('📝 Request params:', { page, activeOnly });
    console.log('🔥 Firebase DB object:', db);
    
    // Try to fetch announcements, but handle empty collection gracefully
    let announcements: Announcement[] = [];
    
    try {
      let announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );
      
      if (activeOnly) {
        announcementsQuery = query(
          announcementsQuery,
          where('isActive', '==', true),
          where('targetPages', 'array-contains', page)
        );
      }
      
      console.log('📝 Executing Firestore query...');
      const querySnapshot = await getDocs(announcementsQuery);
      console.log('📝 Query snapshot size:', querySnapshot.size);
      
      announcements = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📝 Document data:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as Announcement[];
      
      // Filter by date range
      const now = new Date().toISOString();
      announcements = announcements.filter(announcement => {
        if (announcement.startDate && announcement.startDate > now) return false;
        if (announcement.endDate && announcement.endDate < now) return false;
        return true;
      });
      
    } catch (firestoreError) {
      console.log('⚠️ Firestore query failed:', firestoreError);
      console.log('⚠️ Error details:', firestoreError instanceof Error ? firestoreError.message : 'Unknown error');
      announcements = [];
    }
    
    console.log(`✅ Found ${announcements.length} announcements for page: ${page}`);
    
    return NextResponse.json({
      success: true,
      announcements: announcements,
      count: announcements.length,
      page: page,
      activeOnly: activeOnly
    });
    
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Return empty array instead of error for better UX
    return NextResponse.json({
      success: true,
      announcements: [],
      count: 0,
      page: 'home',
      activeOnly: true,
      error: 'No announcements found'
    });
  }
}