import { getProfile, setProfileCookie, createDefaultProfile, owns, pilotPrices, vehicles, paintColors, wheelNames, spoilerNames } from './_lib/session.js';

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

  const pilot = Number(b.pilot);
  const vehicle = Number(b.vehicle);
  const paint = String(b.paint || 'original');
  const wheels = Number(b.wheels);
  const spoiler = Number(b.spoiler);

  if (
    !validNumber(pilot, 0, pilotPrices.length - 1) ||
    !validNumber(vehicle, 0, vehicles.length - 1) ||
    !paintColors.includes(paint) ||
    !validNumber(wheels, 0, wheelNames.length - 1) ||
    !validNumber(spoiler, 0, spoilerNames.length - 1)
  ) {
    return res.status(400).json({ error: 'Personalização inválida.' });
  }

  if (!owns(profile, 'pilot', pilot) || !owns(profile, 'vehicle', vehicle)) {
    return res.status(403).json({ error: 'Esse item ainda não está desbloqueado na sua garagem.' });
  }

  profile.garage = { pilot, vehicle, paint, wheels, spoiler };
  setProfileCookie(res, profile);

  return res.status(200).json({ profile });
}
