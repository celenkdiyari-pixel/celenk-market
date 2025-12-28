import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

/**
 * Migration API: Fix Payment Amounts
 * 
 * This endpoint converts string paymentAmount values to numbers in all existing orders.
 * 
 * Usage: POST /api/admin/fix-payment-amounts
 * Security: Add authentication in production!
 */
export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Starting payment amount migration...');

        const adminDb = getAdminDb();
        const ordersRef = adminDb.collection('orders');
        const snapshot = await ordersRef.get();

        if (snapshot.empty) {
            return NextResponse.json({
                success: true,
                message: 'No orders found.',
                stats: { total: 0, updated: 0, skipped: 0 }
            });
        }

        console.log(`📦 Found ${snapshot.size} orders. Checking payment amounts...`);

        let updatedCount = 0;
        let skippedCount = 0;
        const updates: Promise<any>[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();

            // Check if order has paymentDetails with paymentAmount
            if (data.paymentDetails && data.paymentDetails.paymentAmount) {
                const currentAmount = data.paymentDetails.paymentAmount;

                // If it's a string, convert to number
                if (typeof currentAmount === 'string') {
                    const numericAmount = parseFloat(currentAmount);

                    if (!isNaN(numericAmount)) {
                        console.log(`🔧 Fixing order ${doc.id}: "${currentAmount}" -> ${numericAmount}`);

                        updates.push(
                            doc.ref.update({
                                'paymentDetails.paymentAmount': numericAmount
                            })
                        );

                        updatedCount++;
                    } else {
                        console.warn(`⚠️  Order ${doc.id}: Invalid amount "${currentAmount}"`);
                        skippedCount++;
                    }
                } else {
                    // Already a number or other type, skip
                    skippedCount++;
                }
            } else {
                // No payment details or amount
                skippedCount++;
            }
        });

        if (updates.length > 0) {
            console.log(`\n💾 Applying ${updates.length} updates...`);
            await Promise.all(updates);
            console.log('✅ Updates completed successfully!');
        } else {
            console.log('✅ No updates needed. All payment amounts are already numbers.');
        }

        const stats = {
            total: snapshot.size,
            updated: updatedCount,
            skipped: skippedCount
        };

        console.log(`\n📊 Summary:`, stats);

        return NextResponse.json({
            success: true,
            message: `Migration completed. Updated ${updatedCount} orders.`,
            stats
        });

    } catch (error) {
        console.error('❌ Error fixing payment amounts:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
