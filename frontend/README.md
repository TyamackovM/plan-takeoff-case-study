# Frontend

Vite, React, and TypeScript. The frame of the tool is in place: a plan board, a takeoff column, and an options tray. The board does not draw the plan. The column shows the price library it loaded, which is an input, not a takeoff. The options tray is empty.

The task, including what the screen has to make visible, is in the [root README](../README.md).

## Local

```bash
npm ci
npm run dev
```

The dev server is at <http://localhost:5173>. Requests to `/api` are proxied to `http://localhost:8000`. Set `API_PROXY_TARGET` to point somewhere else. Compose builds the app and serves it with `vite preview` on the same proxy; there the target is `http://backend:8000`, so the browser still talks only to port 5173.

## Checks

```bash
npm run typecheck
npm run build
```

## Where to continue

| Piece | File | What is left |
| --- | --- | --- |
| Drawing | `src/components/PlanStage.tsx` | Draw the selected `Plan` to scale |
| Cost lines | `src/components/TakeoffPanel.tsx` | Render the server takeoff, and link a line to a wall |
| Options | `src/components/OptionsTray.tsx` | List saved options and compare them |
| HTTP | `src/api.ts` | The calls for the endpoints you add |

`src/App.tsx` loads health, the plan list, the selected plan, and the selected library. Those requests abort when the selection changes and when Retry runs.
