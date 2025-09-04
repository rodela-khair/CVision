
# 🚀 AI Resume Checker

A comprehensive React + Node.js application that helps job seekers optimize their resumes and find relevant opportunities. Features include resume parsing, skill gap analysis, job matching, automated job alerts, resume improvement tips, and feedback management.

---

## ✨ Features

### 🔍 **Core Features**
### Resume Parsing
- **PDF Text Extraction**: Built-in PDF parsing using pdf-parse library
- **Skill Recognition**: Custom algorithm recognizing 200+ technical skills
- **Education Detection**: Automatic extraction of degrees and institutions
- **Experience Analysis**: Job title and company extraction
- **Contact Information**: Email, phone, LinkedIn, GitHub extraction
- **No External Dependencies**: Completely self-contained, no API costs!
- **Job Matching**: AI-powered job matching using Jaccard similarity algorithm  
- **Skill Gap Analysis**: Identify missing skills compared to job requirements
- **Job Bookmarking**: Save and manage favorite job listings
- **Resume Improvement Tips**: Personalized suggestions based on resume analysis

### 🔔 **Smart Alerts & Notifications**
- **Job Alerts**: Create custom alerts with keywords, skills, locations, salary ranges
- **Automated Matching**: Daily/weekly automated job matching with email notifications
- **Notification Center**: Manage all notifications with read/unread states
- **Email Integration**: Optional email delivery with unsubscribe functionality

### 💬 **Communication & Feedback**
- **Contact System**: Users can submit feedback and inquiries
- **Admin Feedback Management**: Comprehensive admin interface for managing user feedback
- **Categorization**: Auto-categorization of feedback (bug reports, feature requests, etc.)

### 👨‍💼 **Admin Panel**
- **Job Management**: CRUD operations for job listings
- **Analytics Dashboard**: User activity tracking and insights
- **Feedback Management**: Handle user feedback and support requests
- **User Management**: Monitor user registrations and activity

---

## 📁 Project Structure

```
Resume Checker/
```
Resume Checker/
├── client/                     # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── BookmarkButton.js
│   │   │   ├── FeedbackManagement.js
│   │   │   ├── Footer.js
│   │   │   ├── Header.js
│   │   │   ├── JobCard.js
│   │   │   ├── JobModal.js
│   │   │   ├── Layout.js
│   │   │   └── SkillGapAnalysis.js
│   │   ├── pages/             # Page components
│   │   │   ├── About.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminPanel.js
│   │   │   ├── Contact.js
│   │   │   ├── JobAlerts.js
│   │   │   ├── JobListing.js
│   │   │   ├── Notifications.js
│   │   │   ├── ParsedResume.js
│   │   │   ├── Privacy.js
│   │   │   ├── ResumeTips.js
│   │   │   ├── SavedJobs.js
│   │   │   ├── SignIn.js
│   │   │   ├── SignUp.js
│   │   │   ├── SkillGapPage.js
│   │   │   └── UploadResume.js
│   │   ├── styles/            # CSS styles
│   │   └── App.js
│   └── package.json
├── server/                     # Node.js backend application
│   ├── controllers/           # Request handlers
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── bookmarkController.js
│   │   ├── jobController.js
│   │   ├── matchController.js
│   │   └── resumeController.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── models/              # MongoDB schemas
│   │   ├── AnalyticsEvent.js
│   │   ├── Feedback.js
│   │   ├── Job.js
│   │   ├── JobAlert.js
│   │   ├── Notification.js
│   │   ├── Resume.js
│   │   └── User.js
│   ├── routes/              # API route definitions
│   │   ├── analytics.js
│   │   ├── auth.js
│   │   ├── bookmarks.js
│   │   ├── feedback.js
│   │   ├── jobAlerts.js
│   │   ├── jobs.js
│   │   ├── match.js
│   │   ├── notifications.js
│   │   ├── resume.js
│   │   ├── resumeTips.js
│   │   └── skillGap.js
│   ├── services/            # Background services
│   │   └── alertChecker.js
│   ├── uploads/            # File storage directory
│   ├── .env.example       # Environment variables template
│   ├── package.json
│   ├── seed.js            # Database seeding script
│   └── server.js          # Main server entry point
└── readme.md
```
---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Resume Checker"
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
MONGO_URI=mongodb://localhost:27017/resume_checker
JWT_SECRET=your_super_secret_jwt_key_here

# Optional (for email notifications):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Database Setup
```bash
# Seed the database with sample jobs (optional)
node seed.js
```

### 5. Frontend Setup
```bash
cd ../client
npm install
```

### 6. Start the Application
```bash
# Terminal 1 - Start backend server
cd server
npm start
# Server runs on http://localhost:5000

# Terminal 2 - Start frontend
cd client
npm start
# Client runs on http://localhost:3000
```

### 7. Create Admin Account
1. Register a regular user account through the UI
2. In MongoDB, update the user document to set `isAdmin: true`
3. Log out and log back in to access admin features

---

## 🎯 Core Features Overview

### 📄 **Resume Management**
- **Upload & Parsing**: PDF resume upload with automatic skill extraction
- **Multiple Resumes**: Support for managing multiple resume versions
- **Skill Analysis**: Automatic identification and categorization of skills

### 🎯 **Job Matching System**  
- **Smart Matching**: Jaccard similarity algorithm for skill-based job matching
- **Match Scoring**: Percentage-based compatibility scoring
- **Filtered Results**: Only displays jobs with skill overlap
- **Sorting Options**: Sort by match percentage, date, or relevance

### 🔍 **Advanced Job Search**
- **Multi-filter Search**: Filter by title, skills, location, company, salary
- **Real-time Results**: Dynamic filtering as you type
- **Bookmark System**: Save and organize favorite job listings
- **Detailed Views**: Expandable job details with requirements and descriptions

### 📊 **Skill Gap Analysis**
- **Market Comparison**: Compare your skills against job market demands
- **Missing Skills**: Identify in-demand skills you're lacking
- **Visual Analytics**: Charts and graphs showing skill distribution
- **Improvement Suggestions**: Actionable recommendations for skill development

### 🚨 **Job Alerts & Notifications**
- **Custom Alerts**: Create personalized job alerts with multiple criteria
- **Automated Matching**: Background service checks for new matches
- **Email Notifications**: Optional email delivery of job matches
- **Notification Center**: Centralized hub for all alerts and updates
- **Frequency Control**: Daily or weekly alert frequency options

### 💡 **Resume Improvement**
- **Smart Tips**: AI-generated resume improvement suggestions  
- **Category-based Advice**: Tips organized by Skills, Experience, ATS, Formatting
- **Priority System**: Color-coded priority levels (High/Medium/Low)
- **Actionable Insights**: Specific steps to improve resume effectiveness

### 💬 **Communication System**
- **Contact Forms**: User feedback and inquiry submission
- **Auto-categorization**: Automatic classification of feedback types
- **Admin Dashboard**: Comprehensive feedback management for administrators
- **Status Tracking**: Follow feedback from submission to resolution  
   - `/jobs` shows all jobs  
   - Filters by title, skill, location, company

5. **Admin Panel**  
   - Full CRUD on jobs (`POST`/`PUT`/`DELETE` `/api/jobs`)  
   - Protected by `isAdmin` flag on JWT  
   - UI to create/edit/delete/search jobs (`AdminPanel.js`)

6. **Auth**  
   - User & Admin signup (`/api/auth/signup`) with invite code for admins  
   - JWT-based `auth` + `isAdmin` middleware  
   - Login (`/api/auth/signin`)

7. **Layout**  
   - Shared Header & Footer  
   - Header shows Login/Logout, nav links, Admin link when appropriate

---

## 🔧 Tech Stack

- **Front-end:** React, React Router, Axios, `jwt-decode`  
- **Back-end:** Node.js, Express, MongoDB (Mongoose), Multer, pdf-parse / Affinda API  
- **Dev Tools:** nodemon, create-react-app, VS Code

---

## ⚙️ Quick Start

### 1. Clone & Install

```bash
git clone https://your-repo-url.git
cd "Resume Checker"
```

#### Server

```bash
cd server
npm install
```

- Copy `.env.example` → `.env` and fill in:
  ```dotenv
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  ADMIN_CODE=your_admin_invite_code
  AFFINDA_API_KEY=your_affinda_key
  PORT=5000
  ```

- Seed jobs (one-time):
  ```bash
  node seed.js
  ```

- Start server:
  ```bash
  npm run dev
  # or
  npm start
  ```

#### Client

```bash
cd ../client
npm install
```

- In `client/package.json`, ensure:
  ```json
  "proxy": "http://localhost:5000"
  ```
- (Optional) create `.env` at client root for any client-only vars.

- Start React:
  ```bash
  npm start
  ```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 📡 API Endpoints

### Auth
| Method | Path                   | Body                             | Returns           |
|--------|------------------------|----------------------------------|-------------------|
| POST   | `/api/auth/signup`     | `{ name, email, password, role, adminCode? }` | `{ token }`       |
| POST   | `/api/auth/signin`     | `{ email, password }`            | `{ token }`       |

### Resume
| Method | Path                          | Headers               | Body (form-data) | Returns                     |
|--------|-------------------------------|-----------------------|------------------|-----------------------------|
| POST   | `/api/resume/upload`          | `Authorization: Bearer <token>` | `resume` file       | `{ msg, resume }`            |
| GET    | `/api/resume/:id/parsed`      | `Authorization: Bearer <token>` | —                | `{ parsedData: { skills, fullText } }` |

### Jobs
| Method | Path                   | Headers               | Body                           | Returns             |
|--------|------------------------|-----------------------|--------------------------------|---------------------|
| GET    | `/api/jobs`            | `Authorization`       | —                              | `{ jobs: [...] }`   |
| POST   | `/api/jobs`            | `Authorization, isAdmin` | `{ title, company, location, requiredSkills, description }` | `{ job }`      |
| PUT    | `/api/jobs/:id`        | `Authorization, isAdmin` | same as POST body             | `{ job }`           |
| DELETE | `/api/jobs/:id`        | `Authorization, isAdmin` | —                              | `{ msg }`           |

### Matching
| Method | Path                         | Headers               | Returns                         |
|--------|------------------------------|-----------------------|---------------------------------|
| GET    | `/api/match/:resumeId`       | `Authorization`       | `{ matches: [{ job, score }] }` |

---

## ✅ Next Up

- **Save/Bookmark Jobs**  
- **Skill Gap Analysis**  
- **Resume Tips**  
- **Analytics Dashboard**  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feat/your-feature`)  
3. Commit your changes (`git commit -m "feat: ..."`)  
4. Push to your branch (`git push origin feat/your-feature`)  
5. Open a Pull Request

---

## 📄 License

MIT © Your Name
