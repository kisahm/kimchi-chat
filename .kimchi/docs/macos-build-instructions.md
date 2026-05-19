# macOS Native App Build Instructions

This document describes how to build the native macOS application for Kimchi Chat using Tauri.

## Prerequisites

1. **Rust** (required for Tauri backend)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

2. **Node.js dependencies**
   ```bash
   npm install
   ```

## Quick Start

### Development Mode

Run the app in development mode with hot-reload:

```bash
npm run tauri:dev
```

This will:
1. Start the Next.js dev server on port 3000
2. Launch the Tauri native window
3. Enable hot-reload for both frontend and backend changes

### Production Build

Build the native macOS app:

```bash
npm run tauri:build
```

This will:
1. Build the Next.js static export to `dist/`
2. Compile the Rust backend
3. Create `Kimchi Chat.app` bundle

## Build Outputs

After running `npm run tauri:build`, the builds are located at:

| Platform | Location |
|----------|----------|
| macOS App | `src-tauri/target/release/bundle/macos/Kimchi Chat.app` |
| macOS DMG | `src-tauri/target/release/bundle/dmg/Kimchi-Chat_0.1.0_*.dmg` |

## App Icons

To generate proper app icons, you need a 1240x1240px PNG image:

```bash
# Generate all icon sizes from a source image
npm run tauri icon /path/to/app-icon.png
```

This will create all required icon files in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

Without icons, the app will use Tauri's default placeholder icons.

## Architecture

### Frontend (Next.js)
- Located in `app/`, `components/`, `hooks/`, `lib/`
- Built as static export (`output: 'export'` in `next.config.ts`)
- Detects Tauri environment via `isTauri()` function

### Backend (Rust)
- Located in `src-tauri/src/`
- Main entry: `src-tauri/src/lib.rs`
- Chat API: `src-tauri/src/api/chat.rs`
- Streaming response handling via Tauri Channels

### API Flow

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js    │────▶│  Tauri Rust     │────▶│   kimchi.dev    │
│   Frontend   │◄────│  Backend        │◄────│   API           │
└──────────────┘     └─────────────────┘     └─────────────────┘
     User                Native HTTP              External
     Interface           (No CORS)                Service
```

## Features

- **Dual Mode Operation**: Works as web app (browser) AND native app (Tauri)
- **Streaming Chat**: Real-time SSE-style streaming via Tauri Channels
- **Auto Model Selection**: Falls back to first available model if "auto" selected
- **Native Performance**: ~3-5MB app bundle vs 150MB+ for Electron

## Troubleshooting

### Build fails with Rust errors
```bash
# Update Rust
rustup update

# Clean and rebuild
cargo clean --manifest-path src-tauri/Cargo.toml
npm run tauri:build
```

### App won't launch
```bash
# Check for missing dependencies in the Rust build
cargo check --manifest-path src-tauri/Cargo.toml
```

### Icons not showing
Run `npm run tauri icon /path/to/icon.png` to generate all required icon files.

## Code Signing (Distribution)

For distribution outside the App Store:

1. Get Apple Developer ID certificate
2. Configure signing in `src-tauri/tauri.conf.json`:
   ```json
   {
     "bundle": {
       "macOS": {
         "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
       }
     }
   }
   ```

3. Build with: `npm run tauri:build`

## Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and behavior
- App bundle info (version, identifier)
- macOS minimum system version
- Security settings

## Environment Variables

- `TAURI_SIGNING_PRIVATE_KEY`: For updater signing
- `APPLE_ID` / `APPLE_PASSWORD`: For notarization
