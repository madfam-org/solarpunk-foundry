import { describe, expect, it } from 'vitest';
import { brand } from '../brand';
import { company, getCopyrightNotice } from '../legal';

// Pins the owner ruling of 2026-09-23 (coherence audit B-A03). Changing any of
// these strings is a governance decision, not a refactor.
describe('legal constants', () => {
  it('uses the registered legal name, punctuated', () => {
    expect(company.legalName).toBe('Innovaciones MADFAM S.A.S. de C.V.');
    expect(brand.legalName).toBe(company.legalName);
  });

  it('states the domicile as Cuernavaca, Morelos, Mexico', () => {
    expect(company.address).toEqual({ city: 'Cuernavaca', state: 'Morelos', country: 'Mexico' });
    expect(company.country).toBe('Mexico');
  });

  it('does not publish the tax id or the founding year', () => {
    expect(company.taxId).toBeNull();
    expect(company.foundedYear).toBeNull();
  });

  it('never renders a placeholder or a guessed year in the copyright notice', () => {
    const year = new Date().getFullYear();
    expect(getCopyrightNotice()).toBe(`© ${year} Innovaciones MADFAM S.A.S. de C.V. All rights reserved.`);
    expect(getCopyrightNotice(2024)).toBe(
      `© 2024-${year} Innovaciones MADFAM S.A.S. de C.V. All rights reserved.`,
    );
  });
});
