/**
 * Migration Script: Fix Payment Amounts
 * 
 * This script converts string paymentAmount values to numbers in all existing orders.
 * Run this once to fix legacy data.
 * 
 * Usage: node scripts/fix-payment-amounts.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function fixPaymentAmounts() {
    try {
        console.log('🔍 Fetching all orders...');

        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.get();

        if (snapshot.empty) {
            console.log('✅ No orders found.');
            return;
        }

        console.log(`📦 Found ${snapshot.size} orders. Checking payment amounts...`);

        let updatedCount = 0;
        let skippedCount = 0;
        const batch = db.batch();

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

                        batch.update(doc.ref, {
                            'paymentDetails.paymentAmount': numericAmount
                        });

                        updatedCount++;
                    } else {
                        console.warn(`⚠️  Order ${doc.id}: Invalid amount "${currentAmount}"`);
                        skippedCount++;
                    }
                } else if (typeof currentAmount === 'number') {
                    // Already a number, skip
                    skippedCount++;
                } else {
                    console.warn(`⚠️  Order ${doc.id}: Unknown type for paymentAmount:`, typeof currentAmount);
                    skippedCount++;
                }
            } else {
                // No payment details or amount
                skippedCount++;
            }
        });

        if (updatedCount > 0) {
            console.log(`\n💾 Committing ${updatedCount} updates...`);
            await batch.commit();
            console.log('✅ Batch update completed successfully!');
        } else {
            console.log('✅ No updates needed. All payment amounts are already numbers.');
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - Total orders: ${snapshot.size}`);
        console.log(`   - Updated: ${updatedCount}`);
        console.log(`   - Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('❌ Error fixing payment amounts:', error);
        throw error;
    }
}

// Run the migration
fixPaymentAmounts()
    .then(() => {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });
