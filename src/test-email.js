
// Native fetch in Node 18+

async function sendTestEmail() {
    const url = 'https://www.celenkdiyari.com/api/email';

    const payload = {
        to: 'yasinnabialtun@gmail.com',
        subject: 'Antigravity Test Maili',
        role: 'admin',
        templateParams: {
            order_number: 'TEST-001',
            order_date: new Date().toLocaleDateString('tr-TR'),
            customer_name: 'Yasin Nabi Altun (Test)',
            customer_email: 'yasinnabialtun@gmail.com',
            customer_phone: '555 123 45 67',
            items: 'Test Ürünü x1 - 100 ₺',
            subtotal: '100.00 ₺',
            shipping_cost: '0.00 ₺',
            total: '100.00 ₺',
            payment_method: 'Test Ödemesi',
            order_status: 'Test',
            admin_panel_url: 'https://www.celenkdiyari.com/admin'
        }
    };

    console.log('Sending request to:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendTestEmail();
