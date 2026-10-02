import crypto from 'node:crypto';
import { getProfile, setProfileCookie, createDefaultProfile } from '../_lib/session.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'private, no-store');

  const CLIENT_ID = process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID;

  if (req.method === 'GET') {
    // Se o cliente configurou X_CLIENT_ID no Vercel, suporta redirecionamento OAuth 2.0 PKCE oficial
    if (CLIENT_ID) {
      const verifier = crypto.randomBytes(32).toString('base64url');
      const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
      const state = crypto.randomBytes(16).toString('hex');
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'misuki-kart-rush.vercel.app';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const redirectUri = `${proto}://${host}/api/auth/x/callback`;

      res.setHeader('Set-Cookie', [
        `x_pkce_verifier=${verifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
        `x_auth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
      ]);

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'users.read tweet.read');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      return res.redirect(302, authUrl.toString());
    }

    return res.status(200).json({
      oauthConfigured: false,
      message: 'Modo de conexão direta com @handle do 𝕏 ativo.'
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    const rawHandle = String(body.handle || body.username || '').replace(/^@/, '').trim();
    if (!rawHandle) {
      return res.status(400).json({ error: 'Informe seu @usuario do 𝕏.' });
    }

    if (!/^[A-Za-z0-9_]{1,15}$/.test(rawHandle)) {
      return res.status(400).json({ error: 'Nome de usuário do 𝕏 inválido (use apenas letras, números e _ até 15 caracteres).' });
    }

    // Se já havia um perfil de convidado com progresso, mantém moedas e karts ao vincular ao X
    let current = getProfile(req);
    let profile;

    if (current) {
      current.xHandle = rawHandle;
      current.nickname = body.nickname || current.nickname || `@${rawHandle}`;
      current.avatar = `https://unavatar.io/twitter/${rawHandle}`;
      profile = current;
    } else {
      profile = createDefaultProfile({
        userId: 'x_' + rawHandle.toLowerCase(),
        nickname: body.nickname || `@${rawHandle}`,
        xHandle: rawHandle,
        avatar: `https://unavatar.io/twitter/${rawHandle}`
      });
    }

    setProfileCookie(res, profile);
    return res.status(200).json({
      success: true,
      message: `Conta vinculada ao @${rawHandle} com sucesso!`,
      profile
    });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
