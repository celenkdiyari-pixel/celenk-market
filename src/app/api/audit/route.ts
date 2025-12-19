import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
    try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);

        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        const audit = {
            totalOrders: orders.length,
            missingDeliveryTime: 0,
            missingCustomerFirstName: 0,
            missingCustomerLastName: 0,
            missingCustomerName: 0,
            emptyOrders: 0,
            ordersWithIssues: [] as any[]
        };

        orders.forEach(order => {
            let hasIssue = false;
            const issues = [];

            if (!order.delivery_time) {
                audit.missingDeliveryTime++;
                hasIssue = true;
                issues.push('missing_delivery_time');
            }

            const cust = order.customer || {};
            const firstName = cust.firstName;
            const lastName = cust.lastName;
            const fullName = cust.name;

            if (!firstName) {
                audit.missingCustomerFirstName++;
                hasIssue = true;
                issues.push('missing_customer_firstName');
            }

            if (!lastName) {
                audit.missingCustomerLastName++;
                hasIssue = true;
                issues.push('missing_customer_lastName');
            }

            if (!fullName) {
                audit.missingCustomerName++;
                if (firstName && lastName) {
                    issues.push('can_fix_name_by_join');
                }
            } else if (!firstName && !lastName) {
                issues.push('can_fix_names_by_split');
            }

            if (hasIssue) {
                audit.ordersWithIssues.push({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    issues,
                    customer: cust
                });
            }
        });

        // Check customers collection
        const customersRef = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersRef);
        const customersCount = customersSnapshot.size;

        // Check users collection (just in case)
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        return NextResponse.json({
            success: true,
            audit,
            customersCount,
            usersCount: usersSnapshot.size,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Optional: Implement a fix logic here if needed
    return NextResponse.json({ message: 'Audit fix endpoint ready' });
}
