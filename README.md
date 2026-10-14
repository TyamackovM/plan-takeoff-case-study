# Plan Takeoff Case Study

A senior take-home. The product is a browser tool for early building design. Put a cost takeoff beside a floor plan, and make the drawing explain the numbers.

Most of the work is the screen. The server still owns the numbers: it measures, prices, stores options, and records which price library it used. A prototype that only computes in the browser does not meet the brief. A prototype that only returns JSON does not meet it either.

There is no single correct way to measure a wall. In [`docs/DESIGN.md`](docs/DESIGN.md), say which rule you chose, what you left out, and why.

You may use AI tools. We grade the decisions in the design note, the behaviour of the prototype, and whether the tests match the rules you wrote down.

---

## The job

An architect is looking at one floor. Walls have a thickness and an assembly. Some walls have doors and windows. A price library gives a rate per square metre for each assembly, in credits (`CRD`). `CRD` is a unit for this exercise, not a real currency. On the screen the switch is labelled Library.

On one screen the architect needs:

1. The plan, drawn to scale.
2. The same walls in 3D, so the height of a door or a window is visible. A plan cannot show that.
3. A takeoff: area and cost for this plan, and a second saved option beside it.

If the plan, the way you measure, or the price library changes, it has to stay clear why a number moved, and which wall it belongs to.

## The files

Plans and price libraries are in [`data/`](data/README.md). Distances are metres. In the plan, `Y` increases upward. Sketches of the plans are in that same file. The JSON is what the program loads. A `description` is the sentence shown on the plan board.

A wall is one straight segment.

- `baseline` is the line from the first point to the second. On the exterior walls in these files, that line lies on the inner face. The square where two exterior walls meet is not part of either wall. That is where the line is drawn. It is not the measuring rule: you still choose inner face, centreline, or outer face.
- `thickness_m` is how thick the wall is. `thickness_side` is `left` or `right` as you walk from the first point to the second. On the exterior walls in these files, `right` is the outer side.
- `assembly_id` names the row in the price library, for example `external-wall`.
- An opening belongs to one wall. `along_m` is the distance from the first point of the baseline to the start of the opening. `width_m` continues along the wall. `height_m` and `sill_m` go up from the floor, so they show in 3D and not on the plan. A door has `sill_m` of `0`.

On Rectangle, the wall `ext-south` runs from `(0, 0)` to `(10, 0)`. Its door starts at `along_m` 1.5 and is `width_m` 0.9, so it covers 1.5 m to 2.4 m of that wall and is 2.1 m tall.

The file check only looks at shape. It accepts an opening that does not fit its wall, and an `assembly_id` that is not in the price library. `opening-too-wide` and `missing-assembly` are those two plans. Show them on the plan. Do not turn them into zero or a negative area.

`ground-slab` and `roof` are rows in the price library. No plan contains them. Decide whether this estimate includes them, and say so in the design note.

| File | What it is |
| --- | --- |
| `data/plans/rectangle.json` | A simple plan. Start here. |
| `data/plans/l-plan.json` | The outside wall turns inward. |
| `data/plans/opening-too-wide.json` | A window wider than its wall. |
| `data/plans/missing-assembly.json` | One wall. Its `assembly_id` is not in the price library. |
| `data/library/assemblies.json` | Price library `v1`. |
| `data/library/assemblies-v2.json` | Price library `v2`. Same assemblies. The `external-wall` rate is 220 in `v1` and 240 in `v2`. |

## What to build

The screen:

- The selected plan, to scale: walls, thickness, openings.
- The same plan in 3D, in the pane under the plan. Give each wall the storey height (`storey.height_m`), and place each opening by its sill and height. The 3D view does not calculate cost.
- The edge you measured (inner face, centreline, or outer face), visible on the drawing.
- A cost line and the wall it came from highlight each other.
- At least two saved options, compared wall by wall, not only by the total.
- Each saved option shows which library version priced it.
- The opening that does not fit, and the wall whose `assembly_id` has no rate, are visible. They are not a silent zero and not a negative area.

What is already running: a plan switch, a library switch, a plan board that does not draw the walls, an empty 3D pane, a takeoff column, and an empty options area. The takeoff column shows the loaded price library under the heading Price library. That table is input. The quantity and cost lines above it are still empty.

The server:

- Loading is done. `GET /api/v1/plans` and `GET /api/v1/libraries` serve the files in [`data/`](data/README.md).
- You add measurement and pricing. You choose the endpoint.
- You store an option, including the library version that priced it. You choose the tables. Postgres is running and has no tables yet. Write SQL. There is no ORM.
- Tests cover the way you measure, including `opening-too-wide` and `missing-assembly`.

The browser calls the API through the Vite dev server, which proxies `/api` to the backend. API docs are at <http://localhost:8000/docs>.

## What to hand in

1. **Design note** — [`docs/DESIGN.md`](docs/DESIGN.md). How you measure, what you store and what you recompute, the API, how the drawing explains the numbers, `opening-too-wide` and `missing-assembly`, what you decided not to build, and what you would do next. The template is a guide. Change it if another shape is clearer.
2. **Prototype** — the screen and the server behaviour above, plus tests. The component structure, the endpoint shapes, and the coverage number are up to you.
3. **What you would do next** — in the same note. Separate the next fix to this prototype from later product ideas.

### Write down which way you chose

- Inner face, centreline, or outer face.
- How a corner shared by two walls is counted once.
- Where a partition meets an exterior wall.
- Whether an opening is subtracted from the whole wall.
- Whether the slab and the roof, which have rates and do not appear in any plan, are in this estimate.
- Whether a saved option keeps the rates from the moment it was saved, or follows the price library currently selected.
- What the screen shows for `opening-too-wide` and `missing-assembly`.

### Leave out

A layer-by-layer wall build-up, a second storey, dragging the plan to edit it, a price history, accounts, walking through the building, and a separate 3D file. The 3D view is this plan given a height, not a second model. Add something else only if the design note needs it, and say what you skipped.

There is no fixed time limit. A senior candidate usually spends somewhere between half a day and a long weekend. Judgement matters more than how much of the later work you build.

## Repo layout

```
.
├── backend/          FastAPI. Serves plans and price libraries. Takeoff is not written yet.
├── frontend/         Vite + React. Plan board, 3D pane, takeoff column, options area.
├── data/             Plans and price libraries
├── docs/DESIGN.md    Design-note template
├── docker-compose.yml
└── README.md
```

## Running

Everything:

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| App | http://localhost:5173 |
| API docs | http://localhost:8000/docs |
| Health | http://localhost:8000/api/v1/health |
| Postgres | `localhost:5432`, database `takeoff`, user `postgres`, password `postgres` |

The Compose stack serves the built frontend and one Uvicorn process. It does not mount the source tree, and it does not reload on save. After a code change, rebuild the image you changed. Edits to `data/` are copied into the backend image at build time, so they also need a backend rebuild.

While you change the code, run the processes on the host and keep only the database in Docker:

```bash
docker compose up db
```

Backend, from `backend/`:

```bash
cp .env.example .env
uv sync --group dev
uv run uvicorn app.server:create_app --factory --reload --port 8000
```

Frontend, from `frontend/`:

```bash
npm ci
npm run dev
```

The dev server proxies `/api` to `http://localhost:8000`. Override that with `API_PROXY_TARGET` if the API is elsewhere.

Backend checks, from `backend/`, with Postgres already up:

```bash
uv run ruff format --check . && uv run ruff check .
uv run pyright
uv run pytest
```

Frontend checks, from `frontend/`:

```bash
npm run typecheck
npm run build
```

## How we read a submission

- The design note names how you measure and what a saved option does when the price library changes. The prototype follows both.
- The drawing and the cost lines follow the same measuring rule. If a corner is counted twice, or a partition ends in a different place than the note says, that shows on the screen.
- `opening-too-wide` and `missing-assembly` are visible, not hidden.
- Tests cover the way you measure, not only Rectangle.
- The diff is reviewable. The design note first, then the prototype, is easier to read than one change that also adds accounts and a way to edit the plan.

## Handing it back

Keep the review history in your own fork. Do not open pull requests against this repository.

1. Fork the repository.
2. Branch from your fork's `main`.
3. Open pull requests inside the fork, into that `main`.
4. Make the finished `docs/DESIGN.md` the first pull request.
5. Put the prototype in one or more pull requests after that. You choose the split.
6. In each description, write the scope, the decisions, what you left out, how you checked it, and what you would do next.
7. Send the person who invited you a link to the fork, the pull requests in the order they should be read, and how to run the result.

The pull requests can stay open. The diffs and the discussion need to remain readable.
