# Input files

Plans and price libraries. Coordinates are metres. `Y` increases upward. The origin is arbitrary.

These files are the input contract. The descriptions are hints. If a description and a coordinate disagree, the coordinate wins.

## Walls

Each wall is one straight, axis-aligned segment.

- `baseline` is the segment from the first point to the second. Exterior baselines in these files lie on the **interior face** of the wall. The partition baseline lies on one face of the partition. Baselines are not extended around corners: the square where two exterior walls meet is not assigned to either wall.
- `thickness_side` is `left` or `right` of the baseline direction. The wall material occupies that side, for `thickness_m`.
- Exterior walls of these plans are walked so that `right` is outward. That is a property of the files, not a rule you have to rediscover: the field is set on every wall.
- `along_m` is the distance from the first baseline point to the start of an opening, measured along the baseline. `width_m` runs along the baseline. `height_m` and `sill_m` are vertical, measured from the storey floor.

The schema checks shape only: two distinct axis-aligned points, positive sizes, known enums, unique ids. It does not check that an opening fits its wall, and it does not check that `assembly_id` exists in the library. Those cases are in the files on purpose.

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

`library/assemblies.json` is version `v1`. `library/assemblies-v2.json` is version `v2`. They list the same assemblies. `v2` changes the external-wall rate and leaves the others as they are.

`ground-slab` and `roof` have rates and no elements in the plans. Whether an estimate includes them is a decision, not a field in the plan.

Rates are whole credits (`CRD`) per square metre. `CRD` is the unit of this exercise, not a real currency.

## Files

| File | What it is for |
| --- | --- |
| `plans/rectangle.json` | The ordinary plan. Start here. |
| `plans/l-plan.json` | An exterior that turns inward. |
| `plans/opening-too-wide.json` | An opening that does not fit its wall. |
| `plans/missing-assembly.json` | A wall whose assembly is not in the library. |
| `library/assemblies.json` | Price library `v1`. |
| `library/assemblies-v2.json` | Price library `v2`. |
