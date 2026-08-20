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
