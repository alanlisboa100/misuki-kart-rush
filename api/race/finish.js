import { getProfile, setProfileCookie, createDefaultProfile } from '../_lib/session.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  let profile = getProfile(req);
  if (!profile) {
    profile = createDefaultProfile({});
  }

  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch { b = {}; }
  }
  b = b || {};

  const time = Number(b.time);
  const position = Number(b.position) || 1;
  const stars = Number(b.stars) || 0;
  const track = Number(b.track || 0);
  const mode = String(b.mode || 'race');

  // Cálculo da recompensa de moedas
  const reward = 85 + stars * 4 + (mode === 'race' ? Math.max(0, 90 - (position - 1) * 15) : 40);

  profile.coins = (profile.coins || 0) + reward;

  // Atualiza recorde se o tempo for melhor
  if (Number.isFinite(time) && time > 0) {
    profile.records = profile.records || {};
    const key = `${track}-${mode}`;
    const previous = profile.records[key];
    if (previous === undefined || time < previous) {
      profile.records[key] = time;
    }
  }

  setProfileCookie(res, profile);
  return res.status(200).json({ profile, earned: reward });
}
