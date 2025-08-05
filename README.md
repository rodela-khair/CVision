
# AI Resume Checker

A React + Node.js application that lets users upload their resumes, parses out key skills, and matches them against available job listings using a simple ML (Jaccard) matching algorithm. Includes an Admin Panel for managing job postings.

---

## 📁 Folder Structure

```
Resume Checker/
├── client/                # React front-end
│   ├── public/
│   ├── src/
│   │   ├── assets/images/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.js
│   ├── package.json
│   └── .env                # (optional) e.g. REACT_APP_API_URL
├── server/         
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── matchController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── isAdmin.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── match.js
│   │   └── resume.js
│   ├── uploads/           # Multer file storage
│   ├── seed.js            # Seeds 40+ dummy jobs
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md              # <-- You are here
```

---

## 🚀 Features Implemented

1. **Upload Resume**  
   - Front-end form (`UploadResume.js`)  
   - `/api/resume/upload` (Multer + JWT auth)

2. **Resume Parsing**  
   - Integrated Affinda API  
   - Strips out parentheses from skills (e.g. `"Python (Programming Language)" → "Python"`)  
   - Saves `parsedData.skills` in MongoDB

3. **ML Matching Algorithm**  
   - Jaccard similarity between parsed skills & job `requiredSkills`  
   - `/api/match/:resumeId` endpoint  
   - Only shows jobs with at least one matching skill

4. **Job Listing Page**  
   - `/jobs/:resumeId` shows matched & sorted jobs (with `% match` badge)  
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
