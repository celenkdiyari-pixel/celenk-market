import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { DistrictPricing, CityPricing, PricingConfig } from '@/types/pricing';

const PRICING_COLLECTION = 'pricing';
const CONFIG_DOC_ID = 'config';

// GET - Tüm fiyatlandırmaları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const district = searchParams.get('district');

    // Şehir ve ilçe belirtilmişse spesifik fiyatı getir
    if (city && district) {
      const pricingRef = collection(db, PRICING_COLLECTION, 'districts', 'list');
      const q = query(
        pricingRef,
        where('city', '==', city),
        where('district', '==', district),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const pricing = snapshot.docs[0];
        return NextResponse.json({
          success: true,
          pricing: { id: pricing.id, ...pricing.data() }
        });
      }

      // İlçe fiyatı yoksa şehir fiyatını kontrol et
      const cityQ = query(
        collection(db, PRICING_COLLECTION, 'cities', 'list'),
        where('city', '==', city),
        where('isActive', '==', true)
      );
      const citySnapshot = await getDocs(cityQ);
      
      if (!citySnapshot.empty) {
        const cityPricing = citySnapshot.docs[0];
        return NextResponse.json({
          success: true,
          pricing: { id: cityPricing.id, ...cityPricing.data() }
        });
      }
    }

    // Tüm fiyatlandırmaları getir
    const configRef = doc(db, PRICING_COLLECTION, CONFIG_DOC_ID);
    const configDoc = await getDoc(configRef);

    const districtsRef = collection(db, PRICING_COLLECTION, 'districts', 'list');
    const citiesRef = collection(db, PRICING_COLLECTION, 'cities', 'list');

    const [districtsSnapshot, citiesSnapshot] = await Promise.all([
      getDocs(districtsRef),
      getDocs(citiesRef)
    ]);

    const districts = districtsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DistrictPricing[];

    const cities = citiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CityPricing[];

    const config = configDoc.exists() ? configDoc.data() : null;

    return NextResponse.json({
      success: true,
      config: {
        defaultPrice: config?.defaultPrice || 25,
        defaultExpressPrice: config?.defaultExpressPrice || 50,
      },
      districts,
      cities
    });

  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({
      error: 'Failed to fetch pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Yeni fiyatlandırma ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, pricing } = data; // type: 'district' | 'city'

    if (!type || !pricing) {
      return NextResponse.json({
        error: 'Type and pricing are required'
      }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    if (type === 'district') {
      const districtPricing: DistrictPricing = {
        ...pricing,
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: pricing.isActive !== undefined ? pricing.isActive : true
      };

      const docRef = doc(db, PRICING_COLLECTION, 'districts', 'list', `${pricing.city}_${pricing.district}`);
      await setDoc(docRef, districtPricing);

      return NextResponse.json({
        success: true,
        message: 'District pricing added successfully',
        id: docRef.id
      });
    } else if (type === 'city') {
      const cityPricing: CityPricing = {
        ...pricing,
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: pricing.isActive !== undefined ? pricing.isActive : true
      };

      const docRef = doc(db, PRICING_COLLECTION, 'cities', 'list', pricing.city);
      await setDoc(docRef, cityPricing);

      return NextResponse.json({
        success: true,
        message: 'City pricing added successfully',
        id: docRef.id
      });
    } else if (type === 'config') {
      // Varsayılan fiyatları güncelle
      const configRef = doc(db, PRICING_COLLECTION, CONFIG_DOC_ID);
      await setDoc(configRef, {
        ...pricing,
        updatedAt: timestamp
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Default pricing config updated successfully'
      });
    }

    return NextResponse.json({
      error: 'Invalid type'
    }, { status: 400 });

  } catch (error) {
    console.error('Error adding pricing:', error);
    return NextResponse.json({
      error: 'Failed to add pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Fiyatlandırmayı güncelle
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, id, pricing } = data;

    if (!type || !id || !pricing) {
      return NextResponse.json({
        error: 'Type, id and pricing are required'
      }, { status: 400 });
    }

    const updateData = {
      ...pricing,
      updatedAt: new Date().toISOString()
    };

    if (type === 'district') {
      const docRef = doc(db, PRICING_COLLECTION, 'districts', 'list', id);
      await updateDoc(docRef, updateData);
    } else if (type === 'city') {
      const docRef = doc(db, PRICING_COLLECTION, 'cities', 'list', id);
      await updateDoc(docRef, updateData);
    } else {
      return NextResponse.json({
        error: 'Invalid type'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing updated successfully'
    });

  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json({
      error: 'Failed to update pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Fiyatlandırmayı sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({
        error: 'Type and id are required'
      }, { status: 400 });
    }

    if (type === 'district') {
      const docRef = doc(db, PRICING_COLLECTION, 'districts', 'list', id);
      await deleteDoc(docRef);
    } else if (type === 'city') {
      const docRef = doc(db, PRICING_COLLECTION, 'cities', 'list', id);
      await deleteDoc(docRef);
    } else {
      return NextResponse.json({
        error: 'Invalid type'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json({
      error: 'Failed to delete pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

