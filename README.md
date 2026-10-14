# Plan Takeoff Case Study

A senior take-home. The product is a browser tool for early building design. The exercise is to put a cost takeoff beside a plan, and to make the drawing explain the numbers.

Most of the work is the screen. The server still owns the numbers: it measures, prices, stores options, and remembers which price library it used. A prototype that only computes in the browser does not meet the brief. A prototype that only returns JSON does not meet it either.

There is no single correct measurement convention. We read [`docs/DESIGN.md`](docs/DESIGN.md) first. Say which rule you chose, what you refused to build, and why.

You may use AI tools. We grade the decisions in the design note, the behaviour of the prototype, and whether the tests match the rules you wrote down.

---

## The situation

An architect is working in plan. Walls have a thickness and a type. Some walls have doors and windows. A price library lists assemblies in credits per square metre (`CRD` — a unit for this exercise, not a real currency).

The architect needs two things on one screen:

1. The plan, drawn to scale.
2. A takeoff: quantities and cost for that plan, and a second saved option beside it.

Changing the plan, the measurement rule, or the price library has to stay understandable. If a number changes, the drawing should show why.

A structural tool will later consume the same plan. It is not part of this prototype. Do not design the data so that columns and beams have to live inside the cost lines. Say, in the design note, what you would hand that tool.

## What the screen has to make clear

- The selected plan, drawn to scale: walls, thickness, openings.
- Which edge the quantities use (interior face, centreline, or exterior face), visible on the drawing.
- A cost line and the wall it came from highlight each other.
- At least two saved options, compared by line and not only by a single total.
- An opening that does not fit its wall, and a wall whose assembly is missing, are visible on the plan. They are not a silent zero and not a negative area.
- When the price library changes, a saved option shows which version priced it.

The shell you are given is the frame: plan board, takeoff column, options tray, and a switch between library files. The drawing, the cost lines, and the options are yours. The library table in the column is the input price list, not a takeoff.

## What the server has to own

- Loading is already done. `GET /api/v1/plans` and `GET /api/v1/libraries` serve the files in [`data/`](data/README.md).
- Measurement and pricing run on the server. You design the endpoint.
- An option is stored, including the library version that priced it. You design the schema. There is a Postgres database and no tables yet. Write SQL. There is no ORM in this scaffold.
- Tests cover the rule you chose, including the awkward inputs in `data/plans`.

The browser reaches the API through the Vite dev server, which proxies `/api` to the backend. OpenAPI for the backend is at <http://localhost:8000/docs>.

## Deliverables

1. **Design note** — [`docs/DESIGN.md`](docs/DESIGN.md). Interpretation, measurement convention, what is stored and what is derived, API, how the drawing explains the numbers, failure cases, trade-offs, and a roadmap. The template is a guide. Change it if another shape is clearer.
2. **Prototype** — the screen and the server behaviour above, plus tests. We do not prescribe the component structure, the endpoint shapes, or a coverage percentage.
3. **Roadmap** — in the same note. Separate what you would harden next from product ideas. The structural tool belongs here unless a small part of it is necessary to defend the boundary you chose.

### Worth deciding, and writing down

- Interior face, centreline, or exterior face.
- How a corner shared by two walls is counted once.
- Where a partition stops against an exterior wall.
- Whether an opening is deducted from the whole wall.
- Whether slab and roof, which have rates and no elements in the plans, are in this estimate.
- Whether a saved option freezes library rates or follows the file currently selected.
- What the screen does with `opening-too-wide` and `missing-assembly`.

### Not required

Layer-by-layer build-ups, a second storey, columns and beams, editing the plan by dragging, price history, IFC, accounts, three-dimensional navigation. Build one of these only if it makes the design note truer, and say what you left out.

There is no fixed time limit. A senior candidate usually spends somewhere between half a day and a long weekend. Judgement matters more than how much of the roadmap you implement.

## Sample data

The files are the contract. Descriptions are hints. Coordinates win. Details are in [`data/README.md`](data/README.md).

| File | Role |
| --- | --- |
| `data/plans/rectangle.json` | Ordinary plan. Start here. |
| `data/plans/l-plan.json` | Exterior that turns inward. |
| `data/plans/opening-too-wide.json` | An opening that does not fit its wall. |
| `data/plans/missing-assembly.json` | A wall type the library does not contain. |
| `data/library/assemblies.json` | Price library `v1`. |
| `data/library/assemblies-v2.json` | Price library `v2`. Same assemblies. The external-wall rate differs. |

## Repo layout

```
.
├── backend/          FastAPI. Health, plans, and libraries. Takeoff is empty.
├── frontend/         Vite + React. Tool frame. Drawing and options are empty.
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

For iteration, run the processes on the host. Start only the database in Docker:

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

- The design note names a measurement convention and a rule for saved prices, and the prototype follows both.
- The drawing and the cost lines describe the same decision. A corner counted twice, or a partition that stops in a different place than the note says, is visible.
- Awkward inputs are reported on the plan.
- Tests lock the rule you chose. They are not a tour of the happy path only.
- The diff is reviewable. A design note first, then the vertical slice, reads better than one change that also adds accounts and a model editor.

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
