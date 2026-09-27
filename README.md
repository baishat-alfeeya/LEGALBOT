# ⚖️ LEGALBOT — AI-Based Legal Assistance System

**LegalBot** is an AI-based legal assistance system designed to make legal information more accessible and easier to understand. It provides AI-assisted legal guidance, useful legal resources, self-help actions, emergency assistance, and access to nearby legal services through a unified platform.

> **Note:** LegalBot provides general legal information and AI-assisted guidance. It is not a substitute for professional legal advice.

---

## 🚀 Key Features

### 🤖 AI Legal Assistant

Interact with an AI-powered chatbot to ask questions and receive easy-to-understand legal information.

### 📄 Legal Documents & Templates

Access useful legal documents and templates for common legal situations.

### 🏠 Domestic Violence Assistance

Provides information, guidance, and possible self-help actions for users dealing with domestic violence situations.

### 🧳 Tourist Legal Assistance

Provides legal information and guidance for tourists who may face legal or emergency situations.

### 🆘 Self-Help Actions

Provides users with practical steps they can consider when dealing with common legal problems.

### 📍 Nearby Legal & Emergency Services

Helps users find nearby lawyers and police/emergency resources using location-based services.

### 🌐 Multilingual Support

Provides multilingual functionality to make the platform more accessible to users from different language backgrounds.

### 🔐 Authentication & Data Management

Uses authentication and storage services to manage user-related functionality securely.

---

## 🛠️ Technology Stack

| Category             | Technologies                |
| -------------------- | --------------------------- |
| Frontend             | Next.js, React, TypeScript  |
| UI                   | Tailwind CSS, Framer Motion |
| Backend              | Django / Python             |
| Database             | PostgreSQL                  |
| ORM                  | Prisma                      |
| AI                   | Anthropic Claude API        |
| Authentication       | Supabase                    |
| Storage              | Supabase Storage            |
| Maps                 | Maps / Location Services    |
| Internationalization | i18next                     |

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       USER          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   LEGALBOT FRONTEND │
                    │ Next.js + React + TS│
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌─────────────┐  ┌─────────────┐
       │ AI LEGAL   │   │ Legal Tools │  │   Maps &    │
       │ ASSISTANT  │   │ & Resources │  │  Services   │
       └──────┬─────┘   └──────┬──────┘  └──────┬──────┘
              │                │                │
              ▼                ▼                ▼
       ┌─────────────────────────────────────────────┐
       │             BACKEND SERVICES                │
       │              Django / Python                │
       └──────────────────────┬──────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
           ┌──────────┐ ┌──────────┐ ┌────────────┐
           │ Claude   │ │PostgreSQL│ │  Supabase  │
           │   API    │ │ Database │ │Auth/Storage│
           └──────────┘ └──────────┘ └────────────┘
```

---

## 📂 Project Structure

```text
LEGALBOT/
│
├── legalbot/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── legalbot-backend/
│   ├── api/
│   ├── legalbot_backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── package-lock.json
```

---

## 🔄 How LegalBot Works

```text
User
  │
  ▼
Selects Legal Assistance
  │
  ▼
Describes Legal Issue
  │
  ▼
AI / Legal Processing
  │
  ├──► Legal Information
  │
  ├──► Self-Help Actions
  │
  ├──► Documents & Templates
  │
  ├──► Emergency Assistance
  │
  └──► Nearby Lawyers / Police
```

---

## 💻 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* Python
* PostgreSQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/baishat-alfeeya/LEGALBOT.git
cd LEGALBOT
```

### 2. Frontend Setup

```bash
cd legalbot
npm install
npm run dev
```

The frontend will start on the local development server.

### 3. Backend Setup

Open another terminal:

```bash
cd legalbot-backend
pip install -r requirements.txt
```

Run the backend using the project's Django configuration.

### 4. Environment Variables

Create the required environment files using the provided `.env.example` files.

For example:

```text
.env.example → .env
```

Add the required API keys, database credentials, authentication configuration, and other environment-specific values.

**Never upload real API keys or passwords to GitHub.**

---

## 🔑 Important Security Note

This repository uses environment variables for sensitive configuration.

The following should **never** be committed:

```text
.env
.env.local
API keys
Database passwords
Authentication secrets
Private credentials
```

The repository's `.gitignore` is configured to prevent environment files from being uploaded.

---

## 🌟 Main Use Cases

LegalBot is designed around several common legal-assistance scenarios:

* General legal questions
* Understanding legal procedures
* Accessing legal documents and templates
* Domestic violence assistance
* Tourist-related legal assistance
* Finding nearby lawyers
* Finding nearby police/emergency resources
* Accessing self-help information

---

## 🔮 Future Scope

Potential future improvements include:

* More comprehensive legal knowledge bases
* Improved legal document analysis
* Additional regional and local legal resources
* More language support
* Improved AI response accuracy
* Additional emergency assistance features
* Integration with more legal service providers
* Improved personalization and accessibility

---

## ⚠️ Disclaimer

LegalBot is an educational and informational system designed to provide general legal information and AI-assisted guidance.

It does **not** establish an attorney-client relationship and should not be considered a replacement for a qualified lawyer or official emergency services.

For serious or urgent legal matters, users should contact an appropriate legal professional or relevant emergency authority.

---

## 👩‍💻 Author

### Baishat Alfeeya

Computer Science Engineering Student

GitHub: **[@baishat-alfeeya](https://github.com/baishat-alfeeya)**

---

## ⭐ Project

If you find this project interesting, consider giving the repository a ⭐.

**Repository:**
https://github.com/baishat-alfeeya/LEGALBOT
