# 🎯 MCQ MockMaker & Revision Hub

> Turn any MCQ PDF, competitive exam question paper, or study material into an interactive Computer-Based Test (CBT), active revision quiz, and memory flashcards.

![Live Demo Ready](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=for-the-badge&logo=github)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![PDF.js](https://img.shields.io/badge/PDF.js-Client--Side-FF6B6B?style=for-the-badge)

---

## ✨ Features

- 📄 **100% Client-Side PDF Extraction**: Extract text, questions, options, and answer keys directly in the browser with `pdfjs-dist`. Completely private — no files are sent to any remote server.
- 🧠 **Intelligent MCQ Parser**: Automatically detects numbered questions (`1.`, `Q1.`, `Question 1:`), option letters (`A`, `B`, `C`, `D`), and inline or end-of-document answer sheets.
- 🕒 **Timed Exam Simulation (CBT)**:
  - Real exam interface with countdown timer.
  - Interactive Question Palette (Answered, Unanswered, Marked for Review, Answered & Marked for Review).
  - Clean keyboard shortcuts (Keys `1-4` / `A-D` to select options, Arrow keys for navigation).
- ⚡ **Instant Practice / Revision Mode**:
  - Immediate green/red validation upon selecting an option.
  - Step-by-step solutions and explanations.
  - Bookmark tricky questions for targeted revision.
- 🃏 **3D Flashcard Recall**:
  - Flip cards to test memory retention before exams.
  - Track mastered vs. difficult questions.
- 📊 **Detailed Result Analytics**:
  - Accuracy %, score percentage, time spent per question, and instant 1-click **"Revise Weak Questions Only"** mode.
- 💾 **Offline & Local Storage**:
  - Save question papers and past test score history locally in your browser.

---

## 🚀 Live Hosting on GitHub Pages

This repository is pre-configured with a **GitHub Actions CI/CD workflow** (`.github/workflows/deploy.yml`).

### Setup in 2 Steps:
1. Go to your repository **Settings** > **Pages** on GitHub.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` or `master` branch. GitHub Actions will automatically build and publish your website live at:
   ```
   https://<your-username>.github.io/mock-mcqmaker/
   ```

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📝 License
MIT License