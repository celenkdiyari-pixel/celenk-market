import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { cookies } from 'next/headers';

// Check admin authentication
async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');
    
    if (!adminSession?.value) {
      return false;
    }
    
    // Verify session token format
    try {
      const decoded = Buffer.from(adminSession.value, 'base64').toString('utf-8');
      const [username, timestamp] = decoded.split(':');
      
      // Check if session is not older than 24 hours
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return now - sessionTime < maxAge;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authentication required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only image files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `products/${timestamp}_${randomString}.${fileExtension}`;

    // Upload to Vercel Blob Storage
    try {
      console.log('📤 Uploading to Vercel Blob Storage...', { fileName, size: file.size, type: file.type });
      
      // Convert File to ArrayBuffer for Vercel Blob
      const arrayBuffer = await file.arrayBuffer();
      
      const blob = await put(fileName, arrayBuffer, {
        access: 'public',
        contentType: file.type,
      });

      console.log('✅ File uploaded successfully:', blob.url);

      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: fileName,
        size: file.size,
        type: file.type
      });
    } catch (uploadError) {
      console.error('❌ Upload error:', uploadError);
      console.error('❌ Upload error details:', {
        message: uploadError instanceof Error ? uploadError.message : 'Unknown',
        stack: uploadError instanceof Error ? uploadError.stack : 'No stack'
      });
      
      // Check if it's a token error
      if (uploadError instanceof Error && (uploadError.message.includes('token') || uploadError.message.includes('BLOB_READ_WRITE_TOKEN'))) {
        return NextResponse.json(
          { 
            error: 'Vercel Blob Storage token is missing or invalid',
            details: 'The BLOB_READ_WRITE_TOKEN should be automatically added when you connect the project to Blob Store. Please check Vercel Dashboard > Settings > Environment Variables',
            hint: 'If token is missing, go to Vercel Dashboard > Storage > Blob > Settings > Create Token and add it manually'
          },
          { status: 500 }
        );
      }
      
      throw uploadError;
    }

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
