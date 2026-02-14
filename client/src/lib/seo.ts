import type { Metadata } from 'next';

interface SEOProps {
    title: string;
    description: string;
    path?: string;
    image?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scholarassist.com';

export function generateSEO({ title, description, path = '', image }: SEOProps): Metadata {
    const url = `${BASE_URL}${path}`;
    const fullTitle = `${title} | ScholarAssist`;

    return {
        title: fullTitle,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: 'ScholarAssist',
            type: 'website',
            images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
        },
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function generateServiceSchema(name: string, description: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: {
            '@type': 'Organization',
            name: 'ScholarAssist',
            url: BASE_URL,
        },
    };
}

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'ScholarAssist',
        url: BASE_URL,
        description: 'Expert academic guidance and assistance for thesis writing, essays, research papers, and project documentation.',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'contact@scholarassist.com',
        },
    };
}
