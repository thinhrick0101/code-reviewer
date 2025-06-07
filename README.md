# AI-Powered Code Reviewer & Refactor Assistant

This developer productivity tool, built with Next.js, leverages Large Language Models to significantly improve code quality. It performs comprehensive reviews of single code snippets, offers intelligent refactoring suggestions, and provides context-aware explanations for its feedback. All review sessions are saved and can be revisited, creating a persistent history of your code's evolution.

![AI Code Reviewer Screenshot](https://i.imgur.com/7s1D8gA.png)

## Table of Contents
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Future Improvements](#-future-improvements)

## ✨ Key Features

-   **In-Depth AI Review:** Get feedback on code style, performance, and security vulnerabilities for any code snippet you provide.
-   **AI-Powered Refactoring:** Request and view AI-generated refactored versions of your code in a side-by-side diff view for easy comparison.
-   **Context-Aware Explanations (RAG):** Don't just see a suggestion, understand it. Get detailed explanations for AI feedback, powered by a RAG (Retrieval-Augmented Generation) system that pulls from best-practice documentation.
-   **Persistent Submission History:** Your reviews are automatically saved to a MongoDB database. Browse and revisit past analyses at any time.
-   **Real-time Streaming:** AI feedback for refactoring and explanations is streamed token-by-token for a dynamic, responsive user experience.

## 🧠 How It Works

The application follows a client-server architecture. The frontend, built with Next.js and React, provides the user interface for pasting code and displaying results. The backend, implemented as Next.js API routes, handles the core logic.

1.  **Code Input:** The user pastes a code snippet into the Monaco Editor on the homepage.
2.  **API Request:** The code is sent to the `/api/review` endpoint.
3.  **AI Analysis:** The backend uses **LangChain.js** to construct a prompt with the code. This prompt is sent to the OpenAI GPT-4 model.
4.  **Database Storage:** The AI's response, along with the original code, is saved as a `Submission` document in the MongoDB database.
5.  **Response to Client:** The review results are sent back to the client for display.
6.  **Refactoring & Explanations:** Subsequent requests for refactoring (`/api/refactor`) or explanations (`/api/rag`) follow a similar flow, with responses being streamed back to the client.

## 🛠️ Tech Stack & Architecture

This project uses a modern, full-stack JavaScript approach.

-   **Framework:** [Next.js](https://nextjs.org/) (React)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
-   **AI/LLM Orchestration:** [LangChain.js](https://js.langchain.com/) is used to structure prompts, parse model outputs, and manage the flow of data to and from the OpenAI API.
-   **Database:** [MongoDB](https://www.mongodb.com/) (via Atlas) with [Mongoose](https://mongoosejs.com/) for data modeling and persistence.
-   **UI Components:**
    -   **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/) provides a powerful and familiar editing experience.
    -   **UI Primitives:** Radix UI (for Tabs) and `lucide-react` (for icons).

## 🔌 API Endpoints

The core backend logic is exposed via several RESTful API endpoints.

-   `POST /api/review`
    -   **Description:** Analyzes a single snippet of code.
    -   **Input:** `{ code: string }`
    -   **Output:** A JSON object with review suggestions. The result is also saved to the database.

-   `POST /api/refactor`
    -   **Description:** Takes a piece of code and refactors it.
    -   **Input:** `{ code: string, submissionId: string }`
    -   **Output:** A streamed plain text response of the refactored code. The result is simultaneously saved to the corresponding database entry.

-   `POST /api/rag`
    -   **Description:** Provides a detailed explanation for an AI suggestion using the RAG service.
    -   **Input:** `{ question: string }`
    -   **Output:** A streamed plain text response with the detailed explanation.

-   `GET /api/history` & `GET /api/history/[id]`
    -   **Description:** Endpoints for retrieving the list of all submissions and a single submission by its ID, respectively.

## 📂 Project Structure

```
code-reviewer/
├── public/               # Static assets (images, fonts)
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # Backend API endpoints for each feature
│   │   ├── history/      # Frontend pages for submission history
│   │   └── page.tsx      # Main homepage component (Code Input UI)
│   ├── components/       # Reusable React components
│   │   ├── CodeDiff.tsx  # Side-by-side diff view for refactoring
│   │   ├── Editor.tsx    # Monaco Editor wrapper
│   │   └── layout/       # Header, Footer, etc.
│   ├── lib/              # Core helper libraries
│   │   ├── dbConnect.ts  # Mongoose database connection utility
│   │   └── ragService.ts # Retrieval-Augmented Generation service
│   └── models/           # Mongoose schemas for database models
│       └── Submission.ts # Defines the structure for review data
├── .env.local            # Environment variables (untracked)
├── next.config.ts        # Next.js configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v20.x or later recommended)
-   [npm](https://www.npmjs.com/)
-   **OpenAI API Key:** Get one from the [OpenAI Platform](https://platform.openai.com/).
-   **MongoDB URI:** Get a free database and connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/code-reviewer.git
    cd code-reviewer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the project root and add your keys:

    ```plaintext
    # Get this from https://platform.openai.com/api-keys
    OPENAI_API_KEY="your_openai_api_key_here"

    # Get this from your MongoDB Atlas dashboard
    MONGODB_URI="your_mongodb_connection_string_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🖥️ Usage

1.  **Enter Code:** Paste the code you want to review into the editor on the homepage.
2.  **Start Review:** Click the "Review Code" button. The analysis will begin, and results will appear in the right-hand panel.
3.  **Explore Results:**
    -   The **Review** tab shows the assessment and file-specific feedback.
    -   Click the **Refactor Code** button to generate an improved version. A **Refactored** tab will appear with a diff view.
    -   Click **Explain** on any specific suggestion to get a detailed explanation. An **Explanation** tab will appear with the streamed response.
4.  **Check History:** Click the "History" link in the header to see a list of all your past submissions.

## 🔮 Future Improvements

-   **Multi-File Project Analysis:** Expand the tool to accept and analyze entire project directories.
-   **CI/CD Integration:** Deploy the review system as a GitHub Action that automatically comments on Pull Requests.
-   **VSCode Extension:** Build a companion extension for real-time code review directly within the VSCode editor.
-   **User Authentication:** Add user accounts to keep review histories private.
-   **Team Features:** Allow teams to share review settings and results.

---

This project is intended as a powerful assistant for developers, aiming to improve code quality and productivity.
