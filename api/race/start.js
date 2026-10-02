import crypto from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const ticket = crypto.randomUUID();
  return res.status(200).json({ ticket });
}
