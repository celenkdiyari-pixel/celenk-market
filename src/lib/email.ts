
interface EmailData {
    to: string;
    subject: string;
    role?: 'admin' | 'customer';
    templateParams: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function sendEmail({ to, subject, role = 'customer', templateParams }: EmailData) {
    // Config logic (EmailJS)
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const adminTemplateId = process.env.EMAILJS_TEMPLATE_ADMIN;
    const customerTemplateId = process.env.EMAILJS_TEMPLATE_CUSTOMER;

    if (!serviceId || !publicKey) {
        console.error('❌ EmailJS config missing');
        return { success: false, error: 'Config missing' };
    }

    const selectedTemplateId = role === 'admin' ? adminTemplateId : customerTemplateId;
    if (!selectedTemplateId) {
        console.error('❌ Template ID missing for role:', role);
        return { success: false, error: 'Template missing' };
    }

    const payload: any = {
        service_id: serviceId,
        template_id: selectedTemplateId,
        user_id: publicKey,
        template_params: {
            ...templateParams,
            to_email: to,
            subject,
            reply_to: to,
        }
    };

    if (privateKey) {
        payload.accessToken = privateKey;
    }

    try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await res.text();
        if (!res.ok) {
            console.error('❌ EmailJS API Error:', text);
            return { success: false, error: text };
        }
        return { success: true };
    } catch (error) {
        console.error('❌ Network Error (EmailJS):', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
