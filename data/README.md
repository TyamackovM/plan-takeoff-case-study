# Input files

Plans and price libraries. Coordinates are metres. `Y` increases upward. The origin is arbitrary.

The JSON is what the program loads. A `description` is the sentence shown on the plan board. The sketches below are a picture of the same coordinates.

## Walls

Each wall is one straight, axis-aligned segment.

- `baseline` is the segment from the first point to the second. On the exterior walls in these files, that line lies on the inner face. The partition baseline lies on one face of the partition. The square where two exterior walls meet is not part of either wall. That is where the line is drawn. How you measure the wall is still your decision: inner face, centreline, or outer face.
- `thickness_side` is `left` or `right` as you walk from the first point to the second. The wall material lies on that side, for `thickness_m`. On the exterior walls in these files, `right` is the outer side.
- `assembly_id` names a row in the price library.
- `along_m` is the distance from the first baseline point to the start of an opening. `width_m` continues along the baseline. `height_m` and `sill_m` go up from the floor. A door has `sill_m` of `0`.

The file check looks at shape only: two different axis-aligned points, positive sizes, allowed field values, unique ids. It still accepts an opening that does not fit its wall, and an `assembly_id` that is not in the price library. `opening-too-wide` and `missing-assembly` are those plans.

Tenths of a metre are not all exact in binary floating point. Decide how you parse coordinates and say so in `docs/DESIGN.md`.

## Rectangle

```
y
8  +------------------+
   |                  |
   |        |         |
   |        |         |
0  +------------------+
   0        6        10   x
```

The interior footprint is the rectangle. Exterior thickness sits outside it. The partition baseline is `x = 6`, from `y = 0` to `y = 8`, with thickness toward `+x`.

## L plan

```
8  +--------+
   |        |
4  |        +--------+
   |                 |
0  +-----------------+
   0        6       10
```

The exterior turns inward at `(6, 4)`.

## Libraries

`library/assemblies.json` is version `v1`. `library/assemblies-v2.json` is version `v2`. They list the same assemblies. `v2` changes `external-wall` from 220 to 240 CRD/m² and leaves the other rates as they are.

`ground-slab` and `roof` have rates. No plan contains a slab or a roof. Whether the estimate includes them is your decision.

Rates are whole credits (`CRD`) per square metre. `CRD` is the unit of this exercise, not a real currency.

## Files

| File | What it is for |
| --- | --- |
| `plans/rectangle.json` | A simple plan. Start here. |
| `plans/l-plan.json` | The outside wall turns inward at `(6, 4)`. |
| `plans/opening-too-wide.json` | The south window is 12 m wide on a 10 m wall. |
| `plans/missing-assembly.json` | One wall. Its `assembly_id` is `not-in-library`. |
| `library/assemblies.json` | Price library `v1`. `external-wall` is 220 CRD/m². |
| `library/assemblies-v2.json` | Price library `v2`. `external-wall` is 240 CRD/m². The other rates match `v1`. |
