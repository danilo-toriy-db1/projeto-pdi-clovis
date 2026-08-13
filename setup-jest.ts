import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { webcrypto } from 'node:crypto';
import { toHaveNoViolations } from 'jest-axe';

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

setupZonelessTestEnv();
expect.extend(toHaveNoViolations);
