import { getProfile, setProfileCookie, createDefaultProfile, owns, pilotPrices, vehicles } from './_lib/session.js';

function validNumber(val, min, max) {
  return Number.isInteger(val) && val >= min && val <= max;
}

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

  const kind = b.kind;
  const item = Number(b.item);

  if (!['pilot', 'vehicle'].includes(kind) || !validNumber(item, 0, kind === 'pilot' ? pilotPrices.length - 1 : vehicles.length - 1)) {
    return res.status(400).json({ error: 'Item de compra inválido.' });
  }

  if (owns(profile, kind, item)) {
    return res.status(200).json({ profile, alreadyOwned: true });
  }

  const price = kind === 'pilot' ? pilotPrices[item] : vehicles[item].price;
  if (profile.coins < price) {
    return res.status(409).json({ error: 'Você precisa de mais moedas para esse item. Participe de corridas para acumular!' });
  }

  profile.coins -= price;
  profile.owned = profile.owned || [];
  profile.owned.push({ kind, item_id: item });

  setProfileCookie(res, profile);
  return res.status(200).json({ profile, alreadyOwned: false });
}
