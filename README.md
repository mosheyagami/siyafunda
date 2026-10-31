# Siyafunda Reader

> A modern, accessible, and interactive reading practice web app for children, built with React and Vite.

---

## Features

- **Read-Along Mode:** Uses speech recognition to let children read stories aloud and get instant feedback on their reading accuracy.
- **Story Library:** Includes a set of short, levelled stories. Users can add their own custom stories.
- **Progress Tracking:** Tracks words read, missed words, and reading streaks. Earn coins and badges for progress.
- **Accessibility:** Adjustable font size, font family, line height, color tint, and bionic reading mode for enhanced readability.
- **Multi-Language Support:** Supports English (US, South Africa), Zulu, and Afrikaans for speech recognition.
- **Rewards & Motivation:** Collect coins, badges, and fireflies for reading achievements.
- **Mobile Friendly:** Optimized for phones and tablets. Special HTTPS mode for microphone access on mobile browsers.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd siyafunda
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running Locally

- **Standard development:**
  ```sh
  npm run dev
  ```
- **Phone microphone testing:**
  ```sh
  npm run dev:phone
  ```
  > Open the HTTPS Network URL shown by Vite on your phone (same Wi-Fi). Accept the certificate warning and allow microphone access.

### Building for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

---

## Project Structure

- `src/` — Main source code
  - `App.jsx` — Main app logic and UI
  - `main.jsx` — Entry point
  - `assets/` — Images and static assets
  - `App.css`, `index.css` — Styling
- `public/` — Static files
- `vite.config.js` — Vite configuration
- `eslint.config.js` — ESLint configuration

---

## Tech Stack

- **React 19** — UI library
- **Vite** — Fast build tool
- **Speech Recognition:** [react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition)
- **Drag & Drop:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Icons:** [lucide-react](https://lucide.dev/)
- **Levenshtein Distance:** [fast-levenshtein](https://www.npmjs.com/package/fast-levenshtein)

---

## Accessibility & Customization

- Adjustable font size, font family, line height, and color tint
- Bionic reading mode for easier word recognition
- Keyboard and screen reader friendly

---

## License

MIT License. See [LICENSE](LICENSE) for details.
