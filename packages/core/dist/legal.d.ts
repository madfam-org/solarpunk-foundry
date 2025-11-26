/**
 * @solarpunk/core - Legal & Compliance
 *
 * Authoritative legal information for the ecosystem.
 * These values MUST be used consistently across all applications.
 *
 * Changes to this file require governance approval.
 */
declare const company: {
    /** Legal entity name */
    readonly legalName: "Innovaciones MADFAM SAS de CV";
    /** Trade name / DBA */
    readonly tradeName: "MADFAM";
    /** Country of incorporation */
    readonly country: "Mexico";
    /** Tax ID (RFC in Mexico) */
    readonly taxId: "IMA230101XXX";
    /** Year of incorporation */
    readonly foundedYear: 2023;
    /** Registered address */
    readonly address: {
        readonly street: "";
        readonly city: "Ciudad de México";
        readonly state: "CDMX";
        readonly postalCode: "";
        readonly country: "Mexico";
    };
};
declare const contacts: {
    /** General support */
    readonly support: "support@madfam.io";
    /** Privacy/data protection inquiries */
    readonly privacy: "privacy@madfam.io";
    /** Security vulnerabilities (responsible disclosure) */
    readonly security: "security@madfam.io";
    /** Legal inquiries */
    readonly legal: "legal@madfam.io";
    /** Business/partnerships */
    readonly business: "business@madfam.io";
    /** Technical inquiries */
    readonly tech: "tech@madfam.io";
};
declare const legalUrls: {
    /** Privacy Policy */
    readonly privacyPolicy: "https://madfam.io/legal/privacy";
    /** Terms of Service */
    readonly termsOfService: "https://madfam.io/legal/terms";
    /** Cookie Policy */
    readonly cookiePolicy: "https://madfam.io/legal/cookies";
    /** Acceptable Use Policy */
    readonly acceptableUse: "https://madfam.io/legal/acceptable-use";
    /** Data Processing Agreement (for B2B) */
    readonly dpa: "https://madfam.io/legal/dpa";
    /** Security Policy */
    readonly security: "https://madfam.io/security";
    /** Open Source Licenses */
    readonly licenses: "https://madfam.io/legal/licenses";
    /** Trademark Guidelines */
    readonly trademark: "https://madfam.io/legal/trademark";
};
declare const compliance: {
    /** Data protection regulations we comply with */
    readonly dataProtection: readonly ["LFPDPPP", "GDPR"];
    /** Financial regulations (for Dhanam) */
    readonly financial: readonly ["CNBV"];
    /** Education/certification regulations (for AVALA) */
    readonly education: readonly ["CONOCER", "SEP"];
};
/**
 * Generate copyright notice for a given year range
 */
declare function getCopyrightNotice(startYear?: number): string;
/**
 * Standard license headers for source files
 */
declare const licenseHeaders: {
    readonly 'AGPL-3.0': string;
    readonly 'MPL-2.0': string;
    readonly Proprietary: string;
};
declare const socialLinks: {
    readonly github: "https://github.com/madfam-io";
    readonly twitter: "https://twitter.com/madfam_io";
    readonly linkedin: "https://linkedin.com/company/madfam";
};
/**
 * Standard footer links for all applications
 */
declare const footerLinks: {
    readonly legal: readonly [{
        readonly label: "Privacy Policy";
        readonly href: "https://madfam.io/legal/privacy";
    }, {
        readonly label: "Terms of Service";
        readonly href: "https://madfam.io/legal/terms";
    }, {
        readonly label: "Cookie Policy";
        readonly href: "https://madfam.io/legal/cookies";
    }];
    readonly company: readonly [{
        readonly label: "About";
        readonly href: "https://madfam.io/about";
    }, {
        readonly label: "Careers";
        readonly href: "https://madfam.io/careers";
    }, {
        readonly label: "Contact";
        readonly href: "https://madfam.io/contact";
    }];
    readonly resources: readonly [{
        readonly label: "Documentation";
        readonly href: "https://docs.madfam.io";
    }, {
        readonly label: "Blog";
        readonly href: "https://madfam.io/blog";
    }, {
        readonly label: "Status";
        readonly href: "https://status.madfam.io";
    }];
};

export { company, compliance, contacts, footerLinks, getCopyrightNotice, legalUrls, licenseHeaders, socialLinks };
