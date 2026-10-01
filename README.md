# ✨ EduGenie: Google Gemini Powered Learning Assistant

**EduGenie** is a state-of-the-art educational companion model and interactive learning platform powered by **Google Gemini**. It bridges foundational pedagogy with cutting-edge AI capabilities—offering adaptive concept explanations, Socratic tutoring, interactive 3D flashcards, dynamic quizzes, and code mentorship.

---

## 🚀 Quick Start (Choose Either Method)

### Method 1: Instant Browser Launch (Zero Installation Required!)
You can run EduGenie **directly in your browser** without starting any server or installing packages:
1. Double-click [`run_website.bat`](file:///c:/Users/ELCOT/Desktop/New%20folder/run_website.bat) or open [`index.html`](file:///c:/Users/ELCOT/Desktop/New%20folder/index.html) in Chrome, Edge, Brave, or Firefox.
2. The website loads in **Curated Offline Learning Mode** with instant access to all 6 sample topics and interactive features.
3. To enable real-time dynamic AI generation, click **⚙️ API & Backend** in the top navigation and enter your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (Keys start with `AIzaSy...`).

### Method 2: Python Backend Server (Zero Dependencies)
Your system has Python installed. If you prefer running a backend process:
1. Double-click [`run_python_backend.bat`](file:///c:/Users/ELCOT/Desktop/New%20folder/run_python_backend.bat) (or run `python server.py` in your terminal).
2. Open [http://localhost:5000](http://localhost:5000) in your web browser.
3. In EduGenie's **⚙️ API & Backend** settings, switch the mode to **Local Backend Server**.

*(Optional)* A Node.js backend (`server.js` with `package.json`) is also included if you install Node in the future.

---

## 🌟 Key Features

| Learning Tool | Description |
| :--- | :--- |
| 💡 **Concept Explainer** | Tailors breakdowns to 4 depths (*ELI5, Beginner, College, Expert*) with real-world analogies, step-by-step logic, and misconception alerts. |
| ⚡ **Quiz & 3D Flashcards** | Generates dynamic 5-question multiple choice quizzes with instant feedback and explanations, plus interactive 3D flippable flashcards. |
| 💬 **Socratic AI Tutor** | Conversational tutor that asks probing, guided questions to help you discover foundational principles on your own. |
| 💻 **Code Mentor** | Analyzes code algorithms, proves Big-O time/space complexity, optimizes performance bottlenecks, and finds edge-case bugs. |
| 🗺️ **Study Roadmap** | Produces structured week-by-week syllabus roadmaps with milestones and project lab exercises. |
| 📑 **Cheat Sheet & Summary** | Formulates high-yield formula sheets, comparison tables, and quick reference summaries ready to print or save as PDF. |
| 🔊 **Audio Speech Synthesizer** | Listen to explanations read aloud using the Web Speech API (`Listen` button). |
| 💾 **Markdown Export** | One-click export to download notes directly to your computer. |

---

## 🔑 Gemini API Key & Settings

- **Get a Free API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and click **Create API Key**. All Google Gemini keys start with `AIzaSy...`.
- **Frontend Setup**: Click **⚙️ API & Backend** in the top navigation, paste your key into the password field, and click **Save Settings**. Stored securely in your browser's local storage.
- **Backend Setup**: Add `GEMINI_API_KEY=AIzaSy...` to [`.env`](file:///c:/Users/ELCOT/Desktop/New%20folder/.env).
- **Supported Models**: `gemini-2.0-flash` (Default, Fast & Multi-modal), `gemini-1.5-flash`, `gemini-1.5-pro` (Deep Reasoning).

---

## 📂 File Directory

```
project/
├── index.html               # Main interactive web application
├── style.css                # Modern cosmic glassmorphic design system
├── app.js                   # Application logic, Gemini client & interactive tools
├── server.py                # Python 3 zero-dependency backend server
├── server.js                # Node.js Express backend server (optional)
├── package.json             # Node.js dependencies configuration
├── .env                     # Environment variables with your Gemini API key
├── .env.example             # Template for API keys
├── run_website.bat          # 1-click Windows launcher for website
├── run_python_backend.bat   # 1-click Windows launcher for Python server
└── README.md                # Documentation & usage guide
```
