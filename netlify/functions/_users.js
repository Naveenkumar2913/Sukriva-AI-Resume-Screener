/** Production demo credentials — Admin is Naveen */
const USERS = [
  {
    id: 'u1',
    name: 'Naveen',
    email: 'admin@sukriva.com',
    password: process.env.ADMIN_PASSWORD || 'sukriva123',
    role: 'Admin',
    avatar: 'N',
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    email: 'recruiter@sukriva.com',
    password: process.env.RECRUITER_PASSWORD || 'recruit123',
    role: 'Recruiter',
    avatar: 'MC',
  },
  {
    id: 'u3',
    name: 'Sofia Rivera',
    email: 'demo@sukriva.com',
    password: process.env.DEMO_PASSWORD || 'demo123',
    role: 'Hiring Manager',
    avatar: 'SR',
  },
];

function authenticate(email, password) {
  const found = USERS.find(
    (u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase() && u.password === password
  );
  if (!found) return null;
  const { password: _p, ...user } = found;
  return user;
}

function publicUsers() {
  return USERS.map(({ password, ...u }) => ({ ...u, passwordHint: password }));
}

module.exports = { USERS, authenticate, publicUsers };
