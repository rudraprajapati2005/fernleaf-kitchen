export const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'ymail.com',
  'googlemail.com',
]);

export function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^@/, '');
}

export function assertCompanyDomain(domain: string): string {
  const d = normalizeDomain(domain);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) {
    throw new Error('Invalid email domain');
  }
  if (PUBLIC_EMAIL_DOMAINS.has(d)) {
    throw new Error('Public email domains are not allowed');
  }
  return d;
}
