import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// User Agent'dan cihaz ve tarayıcı bilgisi çıkar
function parseUserAgent(userAgent: string) {
  let device = 'desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Cihaz tespiti
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent)) {
      device = 'tablet';
    } else {
      device = 'mobile';
    }
  }

  // Tarayıcı tespiti
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Edge|Edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = 'Opera';
  }

  // İşletim sistemi tespiti
  if (/Windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Mac OS X/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'iOS';
  }

  return { device, browser, os };
}

// IP adresinden ülke bilgisi (basit)
function getCountryFromIP(ip: string) {
  // Gerçek uygulamada IP geolocation servisi kullanılmalı
  // Şimdilik basit bir mapping
  const localIPs = ['127.0.0.1', '::1', 'localhost'];
  if (localIPs.includes(ip) || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { country: 'Turkey', city: 'Istanbul' };
  }
  return { country: 'Unknown', city: 'Unknown' };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page,
      referrer,
      userAgent,
      sessionId,
      pageViews = 1,
      sessionDuration = 0
    } = body;

    // IP adresini al
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || '127.0.0.1';

    console.log(`📊 Tracking visitor: ${ip} on ${page}`);

    // User Agent'dan bilgileri çıkar
    const { device, browser, os } = parseUserAgent(userAgent || '');
    
    // IP'den konum bilgisi (basit)
    const { country, city } = getCountryFromIP(ip);

    // Analytics verisini Firestore'a kaydet
    const analyticsData = {
      ip,
      userAgent: userAgent || '',
      referrer: referrer || '',
      page: page || '/',
      timestamp: Timestamp.now(),
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pageViews,
      sessionDuration,
      device,
      browser,
      os,
      country,
      city
    };

    const docRef = await addDoc(collection(db, 'analytics'), analyticsData);
    
    console.log(`✅ Visitor tracked: ${docRef.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Visitor tracked successfully',
      sessionId: analyticsData.sessionId
    });
  } catch (error) {
    console.error('❌ Visitor tracking error:', error);
    return NextResponse.json(
      { error: 'Visitor tracking failed' },
      { status: 500 }
    );
  }
}
