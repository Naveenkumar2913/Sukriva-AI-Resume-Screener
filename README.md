<<<<<<< HEAD
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
=======
# 🚀 Sukriva — AI Resume Screening Platform

Sukriva is an AI-powered resume screening platform designed to help students and recruiters analyze resumes, evaluate ATS compatibility, identify skill gaps, and discover suitable job opportunities.

## ✨ Features

* 📄 Resume upload — PDF, DOCX, and TXT
* 🎯 ATS Resume Score
* 📊 Resume analysis dashboard
* 🧠 AI-powered resume analysis
* 🔍 Skill gap identification
* 💼 Job recommendations
* 📜 Certification recommendations
* 🤖 AI Adviser for resume-based guidance
* 📈 Resume analysis history
* 🔐 User authentication and protected routes
* 📱 Responsive modern UI
* ☁️ Vercel and Netlify deployment support

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* CSS

### Backend

* Node.js
* Serverless API Functions

### AI / Resume Processing

* NLP-based resume analysis
* ATS scoring
* Google Gemini API integration
* Resume text extraction

### Deployment

* Vercel
* Netlify

## 📂 Project Structure

```text
Sukriva/
├── api/
│   ├── analyzeResume.js
│   ├── askAI.js
│   ├── login.js
│   ├── _atsEngine.js
│   └── _users.js
│
├── netlify/
│   └── functions/
│
├── public/
│   ├── images/
│   └── pdf.worker.min.mjs
│
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── vite.config.ts
├── vercel.json
├── netlify.toml
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Sukriva.git
cd Sukriva
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit your `.env` file or API keys to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The application will run locally using the Vite development server.

### 5. Build for production

```bash
npm run build
```

## 🔄 How Sukriva Works

```text
Upload Resume
      ↓
Extract Resume Content
      ↓
Analyze Skills & Experience
      ↓
ATS Evaluation
      ↓
Resume Score
      ↓
Skill Gap Analysis
      ↓
Job Recommendations
      ↓
AI Adviser & Dashboard
```

## 🎯 Use Cases

### Students & Job Seekers

* Understand resume quality
* Improve ATS compatibility
* Identify missing skills
* Discover suitable job roles
* Get AI-powered resume guidance

### Recruiters

* Quickly screen resumes
* Analyze candidate skills
* Evaluate ATS compatibility
* Review candidate information efficiently

## 🔮 Future Improvements

* Advanced job matching
* LinkedIn profile analysis
* Real-time job recommendations
* Resume improvement suggestions
* More AI-powered career insights
* Cloud database integration
* Recruiter candidate comparison

## 👨‍💻 Author

**Naveen Kumar B L**

Computer Science & Data Science Student

---

⭐ If you find Sukriva useful, consider giving the repository a star!
>>>>>>> 797876cf0fb85c0ee065bde3ca4be09d3005674f
