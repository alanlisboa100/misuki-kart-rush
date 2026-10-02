import { parseCookies, getProfile, setProfileCookie, createDefaultProfile } from '../../_lib/session.js';

export default async function handler(req, res) {
  const CLIENT_ID = process.env.X_CLIENT_ID || process.env.TWITTER_CLIENT_ID;
  const CLIENT_SECRET = process.env.X_CLIENT_SECRET || process.env.TWITTER_CLIENT_SECRET;

  const url = new URL(req.url, 'http://localhost');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookies = parseCookies(req);
  const savedState = cookies.x_auth_state;
  const verifier = cookies.x_pkce_verifier;

  if (!code || !state || state !== savedState || !verifier || !CLIENT_ID) {
    return res.redirect(302, '/?auth_error=x_invalid_state');
  }

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'misuki-kart-rush.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const redirectUri = `${proto}://${host}/api/auth/x/callback`;

    const tokenParams = new URLSearchParams();
    tokenParams.set('code', code);
    tokenParams.set('grant_type', 'authorization_code');
    tokenParams.set('client_id', CLIENT_ID);
    tokenParams.set('redirect_uri', redirectUri);
    tokenParams.set('code_verifier', verifier);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    if (CLIENT_SECRET) {
      const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    }

    const tokenResp = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: tokenParams.toString()
    });

    if (!tokenResp.ok) {
      console.error('X OAuth token error:', await tokenResp.text());
      return res.redirect(302, '/?auth_error=x_token_failed');
    }

    const tokenData = await tokenResp.json();
    const userResp = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResp.ok) {
      return res.redirect(302, '/?auth_error=x_user_failed');
    }

    const userData = await userResp.json();
    const user = userData.data;

    let profile = getProfile(req);
    if (!profile) {
      profile = createDefaultProfile({
        userId: 'x_' + user.id,
        nickname: user.name || `@${user.username}`,
        xHandle: user.username,
        avatar: user.profile_image_url ? user.profile_image_url.replace('_normal', '_400x400') : `https://unavatar.io/twitter/${user.username}`
      });
    } else {
      profile.xHandle = user.username;
      profile.nickname = user.name || profile.nickname;
      profile.avatar = user.profile_image_url ? user.profile_image_url.replace('_normal', '_400x400') : profile.avatar;
    }

    setProfileCookie(res, profile);
    return res.redirect(302, '/?login=success');
  } catch (err) {
    console.error('X Callback Exception:', err);
    return res.redirect(302, '/?auth_error=x_exception');
  }
}
