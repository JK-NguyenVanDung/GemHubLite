#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# scripts/doctor.sh — environment health check for GemHub Lite
#
# Verifies that the local machine can build the Android project end-to-end:
#   1. Node is installed, on PATH, and within the engines range.
#   2. `node` is reachable from GUI-launched apps (symlink in /usr/local/bin).
#   3. JAVA_HOME points at a valid JDK 17+ (Android Studio JBR is fine).
#   4. ANDROID_HOME exists and contains platform-tools + an SDK platform.
#   5. The Gradle wrapper can print its version (catches Java/Gradle issues).
#
# Exit code 0 = healthy, 1 = at least one check failed.
# Run via: `npm run doctor` (preferred) or `bash scripts/doctor.sh`.
# -----------------------------------------------------------------------------
set -u

# ---- pretty output ----------------------------------------------------------
RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
fails=0
pass() { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }
fail() { printf "  ${RED}✗${RESET} %s\n" "$1"; fails=$((fails+1)); }
section() { printf "\n${BOLD}%s${RESET}\n" "$1"; }

# Repo root is the parent of this script's directory; lets `doctor.sh` work
# regardless of CWD (npm script runs from package.json dir; manual invocation
# might run from anywhere).
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$REPO_ROOT"

printf "${BOLD}GemHub Lite — environment doctor${RESET}\n"
printf "${DIM}repo: %s${RESET}\n" "$REPO_ROOT"

# ---- 1. Node ----------------------------------------------------------------
section "Node.js"
if ! command -v node >/dev/null 2>&1; then
  fail "node not found on PATH"
else
  node_path="$(command -v node)"
  node_ver="$(node -v)"
  pass "node $node_ver at $node_path"

  # Engines check: read >= lower bound from package.json (best-effort, no jq).
  required="$(node -e "console.log((require('./package.json').engines||{}).node||'')" 2>/dev/null)"
  if [ -n "$required" ]; then
    if node -e "
      const semver = (s) => s.replace(/^v/,'').split('.').map(Number);
      const [maj,min] = semver(process.version);
      const r = '$required';
      // crude '>=X.Y <Z' parser, sufficient for our spec
      const lo = r.match(/>=\s*(\d+)\.(\d+)/);
      const hi = r.match(/<\s*(\d+)/);
      let ok = true;
      if (lo) ok = ok && (maj > +lo[1] || (maj === +lo[1] && min >= +lo[2]));
      if (hi) ok = ok && (maj < +hi[1]);
      process.exit(ok ? 0 : 1);
    " 2>/dev/null; then
      pass "satisfies engines.node '$required'"
    else
      fail "violates engines.node '$required' (current $node_ver)"
      if [ -f .nvmrc ]; then
        warn "fix: nvm install && nvm use (project pins Node $(cat .nvmrc))"
      elif [ -f .node-version ]; then
        warn "fix: switch Node to $(cat .node-version)"
      fi
    fi
  fi
fi

# ---- 2. GUI-visible node (macOS) -------------------------------------------
if [ "$(uname)" = "Darwin" ]; then
  section "GUI PATH visibility (Android Studio / Finder launch)"
  # /usr/local/bin is in /etc/paths and therefore inherited by GUI-launched
  # processes. Without a node binary there, settings.gradle's commandLine("node")
  # fails with error=2 when Studio is launched from the Dock.
  if [ -x /usr/local/bin/node ]; then
    target="$(readlink /usr/local/bin/node || echo "/usr/local/bin/node")"
    pass "/usr/local/bin/node -> $target"
  else
    fail "/usr/local/bin/node missing — GUI-launched Android Studio will not find node"
    warn "fix: sudo ln -sf \"\$(which node)\" /usr/local/bin/node"
    warn "     sudo ln -sf \"\$(which npm)\"  /usr/local/bin/npm"
    warn "     sudo ln -sf \"\$(which npx)\"  /usr/local/bin/npx"
  fi
fi

# ---- 3. Java ----------------------------------------------------------------
section "Java / JDK"
if [ -z "${JAVA_HOME:-}" ]; then
  # Auto-detect Android Studio's bundled JDK as a fallback.
  studio_jbr="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  if [ -d "$studio_jbr" ]; then
    warn "JAVA_HOME unset; Android Studio JBR available at:"
    warn "  $studio_jbr"
    warn "fix: add to ~/.zshrc — export JAVA_HOME=\"$studio_jbr\""
    fails=$((fails+1))
  else
    fail "JAVA_HOME unset and no Android Studio JBR found"
  fi
else
  if [ -x "$JAVA_HOME/bin/java" ]; then
    jver="$("$JAVA_HOME/bin/java" -version 2>&1 | head -1)"
    pass "JAVA_HOME=$JAVA_HOME"
    pass "$jver"
  else
    fail "JAVA_HOME=$JAVA_HOME but \$JAVA_HOME/bin/java not executable"
  fi
fi

# ---- 4. Android SDK ---------------------------------------------------------
section "Android SDK"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
if [ ! -d "$SDK" ]; then
  fail "Android SDK not found at $SDK"
  warn "set ANDROID_HOME or install via Android Studio → SDK Manager"
else
  pass "SDK at $SDK"
  if [ -x "$SDK/platform-tools/adb" ]; then
    pass "platform-tools/adb present"
  else
    fail "platform-tools/adb missing — install via Android Studio SDK Manager"
  fi
  if ls "$SDK/platforms" 2>/dev/null | grep -q '^android-'; then
    plats="$(ls "$SDK/platforms" 2>/dev/null | grep '^android-' | tr '\n' ' ')"
    pass "platforms: $plats"
  else
    warn "no installed SDK platforms — first build will download one"
  fi
fi

# ---- 5. Gradle wrapper ------------------------------------------------------
section "Gradle wrapper"
if [ ! -x android/gradlew ]; then
  fail "android/gradlew not found or not executable"
else
  # Use a subshell with the resolved JAVA_HOME so we don't pollute the caller.
  if out="$( JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}" \
            android/gradlew -p android --version 2>&1 )"; then
    gver="$(printf '%s\n' "$out" | grep -E '^Gradle' | head -1)"
    pass "${gver:-gradle wrapper OK}"
  else
    fail "gradlew --version failed:"
    printf '%s\n' "$out" | sed 's/^/    /'
  fi
fi

# ---- Summary ---------------------------------------------------------------
echo
if [ "$fails" -eq 0 ]; then
  printf "${GREEN}${BOLD}✓ All checks passed.${RESET} You should be able to run \`npx expo run:android\`.\n"
  exit 0
else
  printf "${RED}${BOLD}✗ %d check(s) failed.${RESET} See suggestions above, then re-run \`npm run doctor\`.\n" "$fails"
  exit 1
fi
