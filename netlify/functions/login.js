const { authenticate, publicUsers } = require('./_users');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        accounts: publicUsers().map((u) => ({
          name: u.name, email: u.email, role: u.role, password: u.passwordHint,
        })),
      }),
    };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const user = authenticate(body.email, body.password);
  if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' }) };
  const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64url');
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, user, token, expiresIn: 604800 }) };
};
