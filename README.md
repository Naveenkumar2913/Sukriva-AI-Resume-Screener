# Sukriva — Production Resume Screener

## Admin
- **Name:** Naveen  
- **Email:** `admin@sukriva.com`  
- **Password:** `sukriva123`

## All login credentials
| Name | Role | Email | Password |
|------|------|-------|----------|
| **Naveen** | Admin | admin@sukriva.com | sukriva123 |
| Marcus Chen | Recruiter | recruiter@sukriva.com | recruit123 |
| Sofia Rivera | Hiring Manager | demo@sukriva.com | demo123 |

Login hits **`POST /api/login`** (Vercel/Netlify). If the API is unreachable, the same credentials work via a secure client fallback.

## Backend (deploy-ready)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/login` | Real credential check + session token |
| `POST /api/analyzeResume` | Gemini ATS analysis with **guaranteed server ATS fallback** (always returns 200 + analysis) |
| `POST /api/askAI` | AI Adviser with resume-grounded fallback |

Shared engines: `api/_atsEngine.js`, `api/_users.js` (mirrored under `netlify/functions/`).

## Optional env
```
GEMINI_API_KEY=...
ADMIN_PASSWORD=sukriva123
RECRUITER_PASSWORD=recruit123
DEMO_PASSWORD=demo123
```

Without `GEMINI_API_KEY`, analysis still works via **Sukriva server ATS engine**.

## Deploy
### Vercel
- Build: `npm run build`
- Output: `dist`
- Functions: `/api/*`
- Add `GEMINI_API_KEY` (optional but recommended)

### Netlify
- Build: `npm run build`
- Publish: `dist`
- Functions: `netlify/functions`
- Redirects in `netlify.toml` map `/api/*` → functions

## Features
- Resume upload (PDF / DOCX / TXT)
- ATS score, radar chart, trend chart (`updateTrendChart`)
- Skill gaps, job recommendations, certifications
- AI Adviser (dynamic, resume-based)
- History + dashboard
- Protected routes after login
