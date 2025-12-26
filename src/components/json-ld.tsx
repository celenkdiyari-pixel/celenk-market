import React from 'react';

export default function JsonLd() {
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "FlowerShop",
        "name": "Çelenk Diyarı",
        "url": "https://celenkdiyari.com",
        "logo": "https://celenkdiyari.com/images/logo-removebg-preview.png",
        "description": "Türkiye genelinde 81 ilde profesyonel çelenk siparişi ve çiçek gönderimi hizmeti. Açılış, düğün ve cenaze çelenkleri.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Türkiye",
            "addressCountry": "TR"
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "09:00",
            "closes": "22:00"
        },
        "sameAs": [
            "https://www.instagram.com/celenkdiyari",
            "https://www.facebook.com/celenkdiyari"
        ],
        "priceRange": "$$"
    };

    const websiteData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Çelenk Diyarı",
        "url": "https://celenkdiyari.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://celenkdiyari.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
            />
        </>
    );
}
