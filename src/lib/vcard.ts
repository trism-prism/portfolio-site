/** Folds a content line to 75 octets with CRLF + space continuation (RFC 6350 §3.2). */
export function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let curLen = 0;
  let limit = 75;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (curLen + n > limit) {
      out.push(cur);
      cur = '';
      curLen = 0;
      limit = 74; // continuation lines start with a space
    }
    cur += ch;
    curLen += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

export function buildVCard(p: {
  name: string;
  first: string;
  last: string;
  email: string;
  url: string;
  title: string;
  note: string;
  links: string[];
  location: string;
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:4.0',
    `FN:${esc(p.name)}`,
    `N:${esc(p.last)};${esc(p.first)};;;`,
    `EMAIL;TYPE=work:${p.email}`,
    `TITLE:${esc(p.title)}`,
    `ADR;TYPE=home:;;;${esc(p.location)};;;`,
    `URL:${p.url}`,
    ...p.links.map((l) => `URL:${l}`),
    `NOTE:${esc(p.note)}`,
    'END:VCARD',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
