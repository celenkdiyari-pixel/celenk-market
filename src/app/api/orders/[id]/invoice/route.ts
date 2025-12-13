import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get order from Firebase
    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = {
      id: orderSnap.id,
      ...orderSnap.data()
    };
    
    // Generate PDF invoice
    // Using a simple HTML to PDF approach
    const invoiceHTML = generateInvoiceHTML(order);
    
    // For production, you might want to use a library like puppeteer or @react-pdf/renderer
    // For now, we'll return HTML that can be printed
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="Fatura-${order.orderNumber}.html"`,
      },
    });
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({
      error: 'Failed to generate invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateInvoiceHTML(order: any): string {
  const customerName = order.customer?.firstName && order.customer?.lastName
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : order.customer?.name || 'Müşteri';
  
  const address = typeof order.customer?.address === 'string'
    ? order.customer.address
    : order.customer?.address
      ? `${order.customer.address.street || ''}, ${order.customer.address.district || ''}, ${order.customer.address.city || ''}`
      : '';
  
  const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura - ${order.orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      color: #333;
      background: white;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border: 1px solid #ddd;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #059669;
    }
    .company-info h1 {
      color: #059669;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      color: #059669;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #059669;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    .customer-info, .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 14px;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .text-right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      font-size: 16px;
      background: #f9fafb;
    }
    .total-amount {
      font-size: 20px;
      color: #059669;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      .invoice-container {
        border: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-info">
        <h1>Çelenk Diyarı</h1>
        <p>Doğanın En Güzel Hali</p>
        <p style="margin-top: 10px; color: #666;">
          www.celenkdiyari.com<br>
          celenkdiyari@gmail.com
        </p>
      </div>
      <div class="invoice-info">
        <h2>FATURA</h2>
        <p style="margin-top: 10px;">
          <strong>Sipariş No:</strong> ${order.orderNumber}<br>
          <strong>Tarih:</strong> ${orderDate}
        </p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Müşteri Bilgileri</div>
      <div class="customer-info">
        <div>
          <div class="info-item">
            <div class="info-label">Ad Soyad</div>
            <div class="info-value">${customerName}</div>
          </div>
          ${order.customer?.email ? `
          <div class="info-item">
            <div class="info-label">E-posta</div>
            <div class="info-value">${order.customer.email}</div>
          </div>
          ` : ''}
        </div>
        <div>
          ${order.customer?.phone ? `
          <div class="info-item">
            <div class="info-label">Telefon</div>
            <div class="info-value">${order.customer.phone}</div>
          </div>
          ` : ''}
          ${address ? `
          <div class="info-item">
            <div class="info-label">Adres</div>
            <div class="info-value">${address}</div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Sipariş Detayları</div>
      <table>
        <thead>
          <tr>
            <th>Ürün</th>
            <th class="text-right">Adet</th>
            <th class="text-right">Birim Fiyat</th>
            <th class="text-right">Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${order.items?.map((item: any) => `
            <tr>
              <td>${item.productName || 'Ürün'}</td>
              <td class="text-right">${item.quantity || 1}</td>
              <td class="text-right">${(item.price || 0).toFixed(2)} ₺</td>
              <td class="text-right">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₺</td>
            </tr>
          `).join('') || ''}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="text-right total-row">Ara Toplam:</td>
            <td class="text-right total-row">${(order.subtotal || 0).toFixed(2)} ₺</td>
          </tr>
          <tr>
            <td colspan="3" class="text-right total-row">Kargo:</td>
            <td class="text-right total-row">${(order.shippingCost || 0).toFixed(2)} ₺</td>
          </tr>
          <tr>
            <td colspan="3" class="text-right total-row total-amount">TOPLAM:</td>
            <td class="text-right total-row total-amount">${(order.total || 0).toFixed(2)} ₺</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Ödeme Bilgileri</div>
      <div class="order-info">
        <div class="info-item">
          <div class="info-label">Ödeme Yöntemi</div>
          <div class="info-value">
            ${order.paymentMethod === 'cash' ? 'Kapıda Ödeme' :
              order.paymentMethod === 'credit_card' ? 'Kredi Kartı' :
              order.paymentMethod === 'bank_transfer' ? 'Havale/EFT' :
              order.paymentMethod || '-'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Ödeme Durumu</div>
          <div class="info-value">
            ${order.paymentStatus === 'paid' ? 'Ödendi' :
              order.paymentStatus === 'pending' ? 'Beklemede' :
              order.paymentStatus === 'failed' ? 'Başarısız' :
              order.paymentStatus || '-'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Teslimat Yöntemi</div>
          <div class="info-value">
            ${order.shippingMethod === 'standard' ? 'Standart Teslimat' :
              order.shippingMethod === 'express' ? 'Hızlı Teslimat' :
              order.shippingMethod === 'pickup' ? 'Mağazadan Teslim' :
              order.shippingMethod || '-'}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Sipariş Durumu</div>
          <div class="info-value">
            ${order.status === 'pending' ? 'Beklemede' :
              order.status === 'confirmed' ? 'Onaylandı' :
              order.status === 'processing' ? 'Hazırlanıyor' :
              order.status === 'shipped' ? 'Kargoya Verildi' :
              order.status === 'delivered' ? 'Teslim Edildi' :
              order.status === 'cancelled' ? 'İptal Edildi' :
              order.status || '-'}
          </div>
        </div>
      </div>
    </div>

    ${order.notes ? `
    <div class="section">
      <div class="section-title">Notlar</div>
      <p>${order.notes}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Teşekkür ederiz! Çelenk Diyarı ile alışveriş yaptığınız için memnuniyet duyuyoruz.</p>
      <p style="margin-top: 10px;">www.celenkdiyari.com | celenkdiyari@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

