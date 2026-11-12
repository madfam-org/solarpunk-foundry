import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { pseudonym } from '../index';

describe('pseudonym', () => {
  it('is 32 lowercase hex characters and deterministic', async () => {
    const a = await pseudonym('k1', 'example-app', 'acc-1');
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(await pseudonym('k1', 'example-app', 'acc-1')).toBe(a);
  });

  it('equals hex(HMAC-SHA-256(key, product:id))[0:32]', async () => {
    const expected = createHmac('sha256', 'k1').update('example-app:acc-1').digest('hex').slice(0, 32);
    expect(await pseudonym('k1', 'example-app', 'acc-1')).toBe(expected);
  });

  it('differs by product, id and key', async () => {
    const a = await pseudonym('k1', 'example-app', 'acc-1');
    expect(await pseudonym('k1', 'other-app', 'acc-1')).not.toBe(a);
    expect(await pseudonym('k1', 'example-app', 'acc-2')).not.toBe(a);
    expect(await pseudonym('k2', 'example-app', 'acc-1')).not.toBe(a);
  });
});
