# serve-sim Integration

`serve-sim` ([EvanBacon/serve-sim](https://github.com/EvanBacon/serve-sim)) is wired
into GemHub Lite as a Metro middleware so the iOS Simulator can be previewed,
controlled, and recorded from a browser tab while `expo start` is running. The
stream is intended for development, agent tools (Codex / Claude / Cursor), and
demo recording. It must never ship inside production builds.

## Requirements

- macOS with Xcode Command Line Tools installed (`xcrun simctl` must work).
- At least one **booted** iOS Simulator before opening the preview URL.
- Node 20+ (see `.nvmrc`).

## How It Is Wired

- Runtime entry: `metro.config.js` extends `config.server.enhanceMiddleware`
  with a `connect()` app that mounts `simMiddleware({ basePath: '/.sim' })`
  in front of Metro's own middleware stack. This is the exact pattern
  documented in the upstream README's "Expo" section.
- Dependencies: `serve-sim` and `connect` are pinned in `devDependencies` so
  release bundles stay clean.
- The middleware reads helper state from `$TMPDIR/serve-sim/` and proxies the
  browser to the live MJPEG + WebSocket endpoints. CORS is wide-open on the
  helper, so no extra dev-server proxy is required.

## Preview Workflow

1. Boot a simulator (`xcrun simctl boot "iPhone 16 Pro"` or open Simulator.app).
2. In one terminal, start the streaming helper:

   ```sh
   npm run sim          # spawns the Swift helper for the booted device
   ```

   The first run downloads/extracts the bundled Swift helper. Leave this
   process running.
3. In another terminal, start the dev server as usual:

   ```sh
   npm run start        # or: npm run ios
   ```
4. Open `http://localhost:8081/.sim` in any browser. The page renders the live
   simulator, accepts taps/keyboard/drag-and-drop, and streams device logs at
   `/.sim/logs` (SSE). State JSON is at `/.sim/api`.

## Camera Injection (Optional)

VisionCamera reads from the simulator's stub camera by default. To feed a
real image, video, or webcam into `com.gemhublite.app`:

```sh
npm run sim:camera                                # animated placeholder
npx serve-sim camera com.gemhublite.app --webcam  # host webcam
npx serve-sim camera com.gemhublite.app --file ./assets/sample-ring.jpg
npx serve-sim camera switch ./assets/sample-loop.mp4
```

This is the recommended way to validate the Camera → SKU → Save flow on the
simulator without a physical device.

## Tear Down

```sh
npm run sim:kill     # stops all serve-sim helpers
```

`metro.config.js` only mounts the middleware; killing the helper leaves the
dev server untouched. Restart the helper with `npm run sim` when needed.

## Safety Notes

- Do not expose `http://localhost:8081/.sim` over a public tunnel without
  auth — the preview accepts input events on the simulator.
- `serve-sim` is dev-only. It is not bundled into the Expo app and has no
  effect on `expo build` or EAS pipelines.
- macOS only. Linux/Windows contributors should skip the helper; the dev
  server still works without it because the middleware only activates the
  `/.sim` routes.
