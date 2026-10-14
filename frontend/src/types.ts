export type RequestState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

export type Health = {
  status: string;
};

export type PlanSummary = {
  id: string;
  name: string;
  description: string;
  wall_count: number;
  opening_count: number;
  storey_height_m: number;
};

export type Point = [number, number];

export type Opening = {
  id: string;
  kind: "door" | "window";
  along_m: number;
  width_m: number;
  height_m: number;
  sill_m: number;
};

export type Wall = {
  id: string;
  assembly_id: string;
  baseline: [Point, Point];
  thickness_m: number;
  thickness_side: "left" | "right";
  openings: Opening[];
};

export type Plan = {
  schema_version: 1;
  id: string;
  name: string;
  description: string;
  units: "m";
  storey: {
    id: string;
    height_m: number;
    walls: Wall[];
  };
};

export type Assembly = {
  id: string;
  name: string;
  category: "wall" | "slab" | "roof";
  unit: "m2";
  rate: number;
};

export type Library = {
  schema_version: 1;
  version: string;
  currency: string;
  assemblies: Assembly[];
};

export type LibrarySummary = {
  version: string;
  currency: string;
  assembly_count: number;
};
