/** 32-bit FNV-1a, returned as the first `len` hex characters. Deterministic labels, not commit IDs. */
export function fnv1a(input: string, len = 7): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, len);
}
