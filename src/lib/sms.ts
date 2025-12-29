
export interface SmsData {
    to: string;
    message: string;
}

/**
 * Sends an SMS using Netgsm API.
 * Requires environment variables:
 * - NETGSM_USER
 * - NETGSM_PASS
 * - NETGSM_HEADER
 */
export async function sendSms({ to, message }: SmsData) {
    const user = process.env.NETGSM_USER;
    const pass = process.env.NETGSM_PASS;
    const header = process.env.NETGSM_HEADER;

    if (!user || !pass || !header) {
        console.warn('⚠️ SMS configuration missing (NETGSM_USER, NETGSM_PASS, NETGSM_HEADER). SMS not sent.');
        return { success: false, error: 'Config missing' };
    }

    try {
        // Netgsm API endpoint for GET/POST
        // We'll use the XML/POST method for better encoding support if needed, 
        // but for a simple message, GET is also common.
        // Let's use the standard POST XML approach for reliability.

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
    <header>
        <company dil="tr">Netgsm</company>
        <usercode>${user}</usercode>
        <password>${pass}</password>
        <type>1:n</type>
        <msgheader>${header}</msgheader>
    </header>
    <body>
        <msg>
            <![CDATA[${message}]]>
        </msg>
        <no>${to}</no>
    </body>
</mainbody>`;

        const response = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: body
        });

        const result = await response.text();

        // Netgsm returns a code like "00" for success or an error code.
        // Success starts with "00 " followed by a message ID.
        if (result.startsWith('00')) {
            console.log('✅ SMS sent successfully to', to);
            return { success: true, messageId: result };
        } else {
            console.error('❌ Netgsm Error:', result);
            return { success: false, error: result };
        }
    } catch (error) {
        console.error('❌ SMS Sending error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
