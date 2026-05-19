# Native macOS Release Plan: Tauri Integration

## Goal
Convert the kimchi-chat Next.js web app into a native macOS application that can be distributed as a `.app` bundle and via DMG installers.

## Solution: Tauri v2
**Why Tauri:**
- Native Rust backend (not Node.js) → ~3-5MB app bundle vs ~150MB for Electron
- First-class Next.js support with `output: 'export'` mode
- Native macOS integration (menu bar, dock, system tray optional)
- Built-in auto-updater support
- Signed code for distribution
- No separate server required — the frontend is bundled into the binary

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Desktop App                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                WebView (WKWebView)                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Next.js Static Export (SPA)              │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐             │  │  │
│  │  │  │   Chat UI    │  │  Settings    │             │  │  │
│  │  │  └──────────────┘  └──────────────┘             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Tauri Rust Runtime (backend)              │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  HTTP API Client (replaces Next.js /api routes)  │  │  │
│  │  │  → make HTTP requests to kimchi.dev API          │  │  │
│  │  │  → CORS bypassed (native code, not browser)      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Static Export Mode
Next.js will build as a static SPA:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  // ... rest of config
};
```

### 2. API Proxy Replacement
The `/api/chat/route.ts` server-side proxy becomes a Tauri **Command**:
- `invoke('chat', { messages, model, apiKey })` from frontend
- Rust backend makes the HTTP request to kimchi.dev API
- No CORS issues — native code can make any HTTP request

### 3. State Persistence
Current: localStorage in browser
Tauri: Keep using localStorage (Tauri WebView supports it) OR migrate to Tauri's file-based store for better durability

## File Structure Changes

```
kimchi-chat/
├── app/                          # Unchanged Next.js app
├── components/                   # Unchanged UI components
├── lib/                          # Unchanged utilities
├── hooks/                        # Unchanged hooks
├── src-tauri/                    # NEW: Rust backend code
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   ├── icons/                    # App icons (macOS icns)
│   ├── src/
│   │   ├── lib.rs                # Main Tauri setup
│   │   ├── main.rs               # Entry point
│   │   └── api/                  # API proxy commands
│   │       └── chat.rs           # Chat API command
│   └── build.rs                  # Build script
├── tauri/                        # NEW: Tauri-specific frontend code (if needed)
│   └── commands.ts               # Type-safe invoke wrappers
├── next.config.ts                # MODIFIED: Add output: 'export'
├── package.json                  # MODIFIED: Add tauri scripts
└── README.md                     # MODIFIED: Add desktop build docs
```

## Implementation Steps

### Phase 1: Core Tauri Setup
1. Add Tauri dependencies to package.json
2. Initialize Tauri project (`npm create tauri-app` or manual setup)
3. Configure next.config.ts for static export
4. Update .gitignore for Rust build artifacts

### Phase 2: Rust Backend Commands
1. Create `src-tauri/src/api/chat.rs` — API proxy command
2. Create `src-tauri/src/lib.rs` — Command registration
3. Implement streaming response handling in Rust
4. Add type-safe command bindings in TypeScript

### Phase 3: Frontend Adaptation
1. Modify chat API calls to use `invoke('chat', ...)` instead of fetch to `/api/chat`
2. Update settings to work with desktop context (localStorage still works)
3. Add desktop-specific features (menu bar, keyboard shortcuts)

### Phase 4: macOS Packaging
1. Generate macOS app icons (required sizes: 16, 32, 64, 128, 256, 512, 1024)
2. Configure tauri.conf.json for macOS:
   - Bundle identifier: `dev.kimchi.chat`
   - Category: `public.app-category.productivity`
   - Signing configuration
3. Build universal binary (Intel + Apple Silicon)
4. Create DMG installer

### Phase 5: Distribution Setup
1. Configure code signing (Apple Developer ID)
2. Set up notarization for Gatekeeper
3. Configure auto-updater (optional)
4. GitHub Actions workflow for automated builds

## Configuration Details

### tauri.conf.json key settings:
```json
{
  "productName": "Kimchi Chat",
  "identifier": "dev.kimchi.chat",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:3000"
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "macOS": {
      "frameworks": [],
      "minimumSystemVersion": "10.13",
      "license": "MIT"
    }
  }
}
```

### Build Commands:
```bash
# Development
npm run tauri dev          # Runs Next.js dev + Tauri dev window

# Production build
npm run tauri build        # Builds static export + Rust binary + .app bundle
```

## Success Criteria
- [ ] `npm run tauri dev` launches native macOS window with working chat
- [ ] `npm run tauri build` produces `Kimchi Chat.app` in `src-tauri/target/release/bundle/macos/`
- [ ] App runs without requiring Node.js or npm on the user's machine
- [ ] Streaming chat responses work correctly
- [ ] Settings persist between app restarts
- [ ] App bundle is < 10MB (Tauri's typical size)

## Risks & Considerations

1. **CORS Elimination**: Since Tauri runs native code, the kimchi.dev API can be called directly without a proxy. This simplifies the architecture but requires careful API key handling.

2. **Streaming**: Tauri's HTTP client requires special handling for streaming responses. May need to use `reqwest` with streaming.

3. **Deep Links**: If we want URL scheme support (e.g., `kimchi-chat://`), additional Tauri plugin setup is needed.

4. **Sandboxing**: macOS App Store requires sandboxing which restricts some network capabilities. Direct download distribution doesn't require this.
