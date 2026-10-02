import { getProfile, setProfileCookie, createDefaultProfile } from './_lib/session.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method === 'GET') {
    const profile = getProfile(req);
    if (!profile) {
      return res.status(401).json({
        error: 'Conecte sua conta do 𝕏 para salvar sua garagem.',
        signin: '/#x-login'
      });
    }
    return res.status(200).json({ signedIn: true, profile });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    let profile = getProfile(req);
    const nickname = String(body.nickname || '').trim();

    if (!profile) {
      // Cria nova conta a partir dos dados fornecidos
      const xHandle = body.xHandle ? String(body.xHandle).replace(/^@/, '').trim() : '';
      profile = createDefaultProfile({
        nickname: nickname || (xHandle ? `@${xHandle}` : 'Piloto 𝕏'),
        xHandle,
        avatar: body.avatar || null
      });
    } else {
      if (nickname) {
        if (!/^[\p{L}\p{N} _.-]{2,25}$/u.test(nickname)) {
          return res.status(400).json({ error: 'Use 2 a 25 caracteres no nome do piloto.' });
        }
        profile.nickname = nickname;
      }
      if (body.xHandle) {
        profile.xHandle = String(body.xHandle).replace(/^@/, '').trim();
        profile.avatar = profile.avatar || `https://unavatar.io/twitter/${profile.xHandle}`;
      }
      if (body.avatar) {
        profile.avatar = String(body.avatar);
      }
    }

    setProfileCookie(res, profile);
    return res.status(200).json({ profile });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
