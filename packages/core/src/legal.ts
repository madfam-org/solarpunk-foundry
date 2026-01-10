/**
 * @madfam/core - Legal & Compliance
 *
 * Authoritative legal information for the ecosystem.
 * These values MUST be used consistently across all applications.
 *
 * Changes to this file require governance approval.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANY INFORMATION
// ═══════════════════════════════════════════════════════════════════════════════

export const company = {
  /** Legal entity name */
  legalName: 'Innovaciones MADFAM SAS de CV',

  /** Trade name / DBA */
  tradeName: 'MADFAM',

  /** Country of incorporation */
  country: 'Mexico',

  /** Tax ID (RFC in Mexico) */
  taxId: 'IMA230101XXX', // Placeholder - replace with actual

  /** Year of incorporation */
  foundedYear: 2023,

  /** Registered address */
  address: {
    street: '', // To be filled
    city: 'Ciudad de México',
    state: 'CDMX',
    postalCode: '',
    country: 'Mexico',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT INFORMATION
// ═══════════════════════════════════════════════════════════════════════════════

export const contacts = {
  /** General support */
  support: 'support@madfam.io',

  /** Privacy/data protection inquiries */
  privacy: 'privacy@madfam.io',

  /** Security vulnerabilities (responsible disclosure) */
  security: 'security@madfam.io',

  /** Legal inquiries */
  legal: 'legal@madfam.io',

  /** Business/partnerships */
  business: 'business@madfam.io',

  /** Technical inquiries */
  tech: 'tech@madfam.io',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// LEGAL DOCUMENT URLS
// ═══════════════════════════════════════════════════════════════════════════════

export const legalUrls = {
  /** Privacy Policy */
  privacyPolicy: 'https://madfam.io/legal/privacy',

  /** Terms of Service */
  termsOfService: 'https://madfam.io/legal/terms',

  /** Cookie Policy */
  cookiePolicy: 'https://madfam.io/legal/cookies',

  /** Acceptable Use Policy */
  acceptableUse: 'https://madfam.io/legal/acceptable-use',

  /** Data Processing Agreement (for B2B) */
  dpa: 'https://madfam.io/legal/dpa',

  /** Security Policy */
  security: 'https://madfam.io/security',

  /** Open Source Licenses */
  licenses: 'https://madfam.io/legal/licenses',

  /** Trademark Guidelines */
  trademark: 'https://madfam.io/legal/trademark',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLIANCE INFORMATION
// ═══════════════════════════════════════════════════════════════════════════════

export const compliance = {
  /** Data protection regulations we comply with */
  dataProtection: [
    'LFPDPPP', // Mexico's Federal Law on Protection of Personal Data
    'GDPR',    // For EU users (if applicable)
  ],

  /** Financial regulations (for Dhanam) */
  financial: [
    'CNBV',    // Comisión Nacional Bancaria y de Valores guidelines
  ],

  /** Education/certification regulations (for AVALA) */
  education: [
    'CONOCER', // Consejo Nacional de Normalización y Certificación
    'SEP',     // Secretaría de Educación Pública recognition
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COPYRIGHT & LICENSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate copyright notice for a given year range
 */
export function getCopyrightNotice(startYear?: number): string {
  const start = startYear ?? company.foundedYear;
  const currentYear = new Date().getFullYear();
  const yearRange = start === currentYear ? `${currentYear}` : `${start}-${currentYear}`;
  return `© ${yearRange} ${company.legalName}. All rights reserved.`;
}

/**
 * Standard license headers for source files
 */
export const licenseHeaders = {
  'AGPL-3.0': `
/**
 * Copyright (c) ${new Date().getFullYear()} ${company.legalName}
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */`.trim(),

  'MPL-2.0': `
/**
 * Copyright (c) ${new Date().getFullYear()} ${company.legalName}
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */`.trim(),

  'Proprietary': `
/**
 * Copyright (c) ${new Date().getFullYear()} ${company.legalName}
 * All rights reserved.
 *
 * This software is proprietary and confidential. Unauthorized copying,
 * distribution, or use of this software, via any medium, is strictly prohibited.
 */`.trim(),
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA & EXTERNAL LINKS
// ═══════════════════════════════════════════════════════════════════════════════

export const socialLinks = {
  github: 'https://github.com/madfam-org',
  twitter: 'https://twitter.com/madfam_io',
  linkedin: 'https://linkedin.com/company/madfam',
  // Add more as needed
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER COMPONENT DATA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard footer links for all applications
 */
export const footerLinks = {
  legal: [
    { label: 'Privacy Policy', href: legalUrls.privacyPolicy },
    { label: 'Terms of Service', href: legalUrls.termsOfService },
    { label: 'Cookie Policy', href: legalUrls.cookiePolicy },
  ],
  company: [
    { label: 'About', href: 'https://madfam.io/about' },
    { label: 'Careers', href: 'https://madfam.io/careers' },
    { label: 'Contact', href: 'https://madfam.io/contact' },
  ],
  resources: [
    { label: 'Documentation', href: 'https://docs.madfam.io' },
    { label: 'Blog', href: 'https://madfam.io/blog' },
    { label: 'Status', href: 'https://status.madfam.io' },
  ],
} as const;
