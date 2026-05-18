#!/usr/bin/env bash
set -euo pipefail

# ── colours ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; ORANGE='\033[0;33m'; GREEN='\033[0;32m'
BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'

print_logo() {
  echo ""
  echo -e "${ORANGE}${BOLD}  🌶  kimchi.chat${RESET}"
  echo -e "${DIM}  AI chat powered by kimchi.dev${RESET}"
  echo ""
}

info()    { echo -e "  ${BOLD}→${RESET} $*"; }
success() { echo -e "  ${GREEN}✓${RESET} $*"; }
error()   { echo -e "  ${RED}✗ Error:${RESET} $*" >&2; }
warn()    { echo -e "  ${ORANGE}⚠${RESET} $*"; }

# ── checks ─────────────────────────────────────────────────────────────────────
check_node() {
  if ! command -v node &>/dev/null; then
    error "Node.js is not installed."
    echo "  Install it from https://nodejs.org (v18+ required)"
    exit 1
  fi

  local version
  version=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
  if [[ "$version" -lt 18 ]]; then
    error "Node.js v18+ required, found v${version}."
    exit 1
  fi
  success "Node.js $(node --version)"
}

check_npm() {
  if ! command -v npm &>/dev/null; then
    error "npm is not installed."
    exit 1
  fi
  success "npm $(npm --version)"
}

install_deps() {
  if [[ ! -d node_modules ]]; then
    info "Installing dependencies..."
    npm install --silent
    success "Dependencies installed"
  else
    success "Dependencies already installed"
  fi
}

# ── optional: open browser after server starts ──────────────────────────────
open_browser() {
  local url="http://localhost:3000"
  sleep 2
  if command -v open &>/dev/null; then          # macOS
    open "$url"
  elif command -v xdg-open &>/dev/null; then    # Linux
    xdg-open "$url"
  fi
}

# ── main ───────────────────────────────────────────────────────────────────────
print_logo
check_node
check_npm
install_deps

echo ""
echo -e "  ${BOLD}Starting dev server…${RESET}"
echo -e "  ${DIM}URL:${RESET} ${ORANGE}http://localhost:3000${RESET}"
echo -e "  ${DIM}Stop:${RESET} Ctrl+C"
echo ""

# Open browser in background (non-blocking)
open_browser &

exec npm run dev
