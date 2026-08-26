import crypto from 'crypto';

export function buildDataCheckString(payload: Record<string, any>) {
  const keys = Object.keys(payload).filter(k => k !== 'hash').sort();
  return keys.map(k => `${k}=${payload[k]}`).join('\n');
}

export function verifyTelegramAuth(payload: Record<string, any>, botToken: string, opts?: { maxAgeSeconds?: number }) {
  const maxAge = opts?.maxAgeSeconds ?? 300; // default 5 minutes
  const dataCheckString = buildDataCheckString(payload);
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const hash = payload.hash;
  // constant-time compare
  const ok = crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(hash, 'hex'));
  if (!ok) return false;

  const authDate = parseInt(String(payload.auth_date), 10);
  if (Number.isNaN(authDate)) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAge) return false;
  return true;
}
