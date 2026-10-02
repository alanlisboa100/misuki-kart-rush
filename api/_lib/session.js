import crypto from 'node:crypto';

export const SESSION_COOKIE = 'misuki_kart_session';
const SECRET = process.env.SESSION_SECRET || 'misuki-kart-rush-session-key-v2-supersecret';

export const pilotPrices = [0, 0, 0, 0, 0, 0, 0, 0, 300, 400, 450, 600];
export const vehicles = [
  { name: 'Rush Original', price: 0 },
  { name: 'Cometa GT', price: 350 },
  { name: 'Buggy Duna', price: 450 },
  { name: 'Phantom X', price: 750 },
  { name: 'Retrô 88', price: 300 },
  { name: 'Vortex R', price: 1000 }
];
export const paintColors = ['original', '#b585f6', '#f36e9a', '#59d6e8', '#d2ff5a', '#ffae59', '#e8eaff', '#25263d', '#e94853'];
export const wheelNames = ['Clássicas', 'Cromadas', 'Neon', 'Off-road'];
export const spoilerNames = ['Original', 'Sem aerofólio', 'Asa dupla'];

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const map = {};
  header.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) map[k] = decodeURIComponent(v.join('='));
  });
  return map;
}

export function signData(data) {
  const payload = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${hmac}`;
}

export function verifyData(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, hmac] = parts;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (hmac !== expected) return null;
  try {
    const raw = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createDefaultProfile({ userId, nickname, xHandle, avatar }) {
  const cleanHandle = xHandle ? xHandle.replace(/^@/, '') : '';
  const finalNick = nickname || (cleanHandle ? `@${cleanHandle}` : 'Piloto Misuki');
  return {
    userId: userId || 'x_' + (cleanHandle || crypto.randomBytes(6).toString('hex')),
    nickname: finalNick,
    xHandle: cleanHandle || null,
    avatar: avatar || (cleanHandle ? `https://unavatar.io/twitter/${cleanHandle}` : null),
    coins: 600,
    createdAt: Date.now(),
    owned: [
      { kind: 'pilot', item_id: 0 },
      { kind: 'vehicle', item_id: 0 }
    ],
    garage: {
      pilot: 0,
      vehicle: 0,
      paint: 'original',
      wheels: 0,
      spoiler: 0
    },
    records: {}
  };
}

export function getProfile(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE] || req.headers['x-misuki-session'];
  if (token) {
    const verified = verifyData(token);
    if (verified) return verified;
  }
  return null;
}

export function setProfileCookie(res, profile) {
  const token = signData(profile);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
}

export function clearProfileCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function owns(profile, kind, index) {
  if (kind === 'pilot') {
    return pilotPrices[index] === 0 || !!profile?.owned?.some(x => x.kind === kind && x.item_id === index);
  }
  return index === 0 || !!profile?.owned?.some(x => x.kind === kind && x.item_id === index);
}
