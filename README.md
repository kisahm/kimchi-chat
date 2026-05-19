# 🌶 kimchi.chat

A modern AI chat interface for [kimchi.dev](https://kimchi.dev) — multi-model, streaming, dark-themed.

Built with **Next.js 15**, **Tailwind CSS v4**, and the **OpenAI-compatible kimchi.dev API**.

---

## Quickstart

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- A kimchi.dev API key → [app.kimchi.dev/settings](https://app.kimchi.dev/settings)

### 1. Clone

```bash
git clone https://github.com/kisahm/kimchi-chat
cd kimchi-chat
```

### 2. Start

```bash
./start.sh
```

The script installs dependencies (first run only) and opens `http://localhost:3000` automatically.

Alternatively:

```bash
npm install
npm run dev
```

### 3. Enter your API key

On first launch the settings dialog opens automatically. Paste your kimchi.dev API key and click **Get started**.

---

## Features

| Feature | Details |
|---|---|
| **Streaming chat** | Token-by-token via SSE, stop anytime |
| **Auto model selection** | Kimchi picks the best available model per request |
| **Model selector** | Explicitly choose any model from `/v1/models` |
| **Model badge** | Hover over a response to see which model was used |
| **Reasoning blocks** | `<think>` tags shown as collapsible "Reasoning" section |
| **Markdown + code** | Full markdown with syntax highlighting and copy button |
| **Chat history** | Multiple conversations, rename & delete, grouped by date |
| **Keyboard shortcuts** | Enter to send, Shift+Enter for newline |
| **Collapsible sidebar** | More screen space when you need it |

---

## Configuration

All settings are stored in your browser's `localStorage` — nothing is sent to any server except the kimchi.dev API.

| Setting | Default | Description |
|---|---|---|
| API Key | _(required)_ | Your kimchi.dev API key |
| Base URL | `https://llm.cast.ai/openai/v1` | API endpoint — change to a local harness URL if needed |
| Model | Auto | `auto` lets the API pick; or choose explicitly |

### Using a local Kimchi harness

If you have the [kimchi CLI](https://github.com/castai/kimchi) installed and running locally, point the Base URL to your local harness endpoint in Settings.

---

## Project structure

```
kimchi-chat/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Streaming proxy → kimchi.dev (avoids CORS)
│   │   └── models/route.ts    # Models list proxy
│   ├── globals.css            # CSS variables, animations
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatWindow.tsx         # Message list + empty state
│   ├── MessageItem.tsx        # Markdown, think-tags, model badge
│   ├── MessageInput.tsx       # Auto-resize textarea
│   ├── ModelSelector.tsx      # Dropdown with live model list
│   ├── SettingsModal.tsx      # API key + base URL
│   └── Sidebar.tsx            # Conversation list
├── hooks/
│   └── useChat.ts             # Streaming logic, abort controller
├── lib/
│   ├── kimchi-client.ts       # fetchModels helper
│   ├── store.ts               # Zustand store (persisted)
│   └── types.ts
├── start.sh                   # ← run this
└── README.md
```

---

## Tech stack

- [Next.js 15](https://nextjs.org) — App Router, server-side API proxy
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs) — state + localStorage persistence
- [openai](https://github.com/openai/openai-node) — OpenAI-compatible SDK (server-side only)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [lucide-react](https://lucide.dev) — icons

---

## Why a server-side proxy?

The kimchi.dev API (`llm.cast.ai`) does not send CORS headers, so direct browser requests are blocked. The Next.js API routes (`/api/chat`, `/api/models`) act as a thin server-side proxy — your API key never leaves your machine.

---

## License

MIT — see [LICENSE](./LICENSE)
