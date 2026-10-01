import { scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scryptAsync = promisify(scrypt);

export const dummyPasswordRecord = Object.freeze({ salt: "dummy-salt-01", hash: "I989ucsPCipaKMxzX7qABpLNMb13wPo9T3lW83FmOjY=", keyLength: 32 });

export function createPasswordVerifier() {
  return {
    dummyRecord: dummyPasswordRecord,
    async verify(password, record) {
      const expected = Buffer.from(record.hash, "base64");
      const actual = await scryptAsync(password, record.salt, record.keyLength, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
  };
}
