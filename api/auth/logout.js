import { clearProfileCookie } from '../_lib/session.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  clearProfileCookie(res);
  return res.status(200).json({ success: true, message: 'Sessão encerrada com sucesso.' });
}
