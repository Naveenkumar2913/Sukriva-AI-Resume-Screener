export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Placement Cell' | 'Student';
  avatar: string;
}

/** Demo accounts — Sukriva for engineering B.Tech students */
export const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: 'u1',
    name: 'Naveen',
    email: 'admin@sukriva.com',
    password: 'sukriva123',
    role: 'Admin',
    avatar: 'N',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    email: 'placement@sukriva.com',
    password: 'place123',
    role: 'Placement Cell',
    avatar: 'PS',
  },
  {
    id: 'u3',
    name: 'Rahul Verma',
    email: 'student@sukriva.com',
    password: 'btech123',
    role: 'Student',
    avatar: 'RV',
  },
];

const SESSION_KEY = 'sukriva_session';

export function authenticate(email: string, password: string): User | null {
  const found = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!found) return null;
  const { password: _, ...user } = found;
  return user;
}

export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
