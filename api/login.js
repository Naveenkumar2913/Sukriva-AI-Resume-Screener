const { authenticate, publicUsers } = require('./_users');

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    // Return demo credentials metadata for login UI (no secrets beyond demo passwords)
    return res.status(200).json({
      ok: true,
      accounts: publicUsers().map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        password: u.passwordHint,
      })),
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = readBody(req);
  const email = String(body.email || '').trim();
  const password = String(body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.', code: 'MISSING_FIELDS' });
  }

  const user = authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
  }

  // Simple session token (demo-grade; swap for JWT/session store in enterprise)
  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64url');

  return res.status(200).json({
    ok: true,
    user,
    token,
    expiresIn: 60 * 60 * 24 * 7,
  });
};
