import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Plan, Wall } from "../types.ts";

const SAMPLE_PLAN_ID = "rectangle";
const SAMPLE_WALL_ID = "ext-south";

type VolumeViewProps = {
  plan: Plan | null;
};

function isSampleWall(plan: Plan, wall: Wall): boolean {
  return plan.id === SAMPLE_PLAN_ID && wall.id === SAMPLE_WALL_ID;
}

function planRight(dx: number, dy: number, length: number, side: Wall["thickness_side"]): [number, number] {
  const sign = side === "right" ? 1 : -1;
  return [(dy / length) * sign, (-dx / length) * sign];
}

function buildVolume(plan: Plan): THREE.Group {
  const group = new THREE.Group();
  const wall = plan.storey.walls.find((item) => isSampleWall(plan, item));
  if (!wall) return group;
  const material = new THREE.MeshStandardMaterial({ color: "#efeae2", roughness: 0.82 });
  group.add(sampleWall(wall, plan.storey.height_m, material));
  return group;
}

function siteFrame(plan: Plan): { center: THREE.Vector3; span: number } {
  const points = plan.storey.walls.flatMap((wall) => wall.baseline);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    center: new THREE.Vector3((minX + maxX) / 2, plan.storey.height_m / 2, (minY + maxY) / 2),
    span: Math.max(maxX - minX, maxY - minY, 4),
  };
}
function sampleWall(wall: Wall, height: number, material: THREE.Material): THREE.Mesh {
  const [start, end] = wall.baseline;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length, 0);
  shape.lineTo(length, height);
  shape.lineTo(0, height);
  shape.closePath();
  for (const opening of wall.openings) {
    const x0 = opening.along_m;
    const x1 = x0 + opening.width_m;
    const y0 = opening.sill_m;
    const y1 = y0 + opening.height_m;
    const hole = new THREE.Path();
    hole.moveTo(x0, y0);
    hole.lineTo(x0, y1);
    hole.lineTo(x1, y1);
    hole.lineTo(x1, y0);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: wall.thickness_m, bevelEnabled: false });
  const mesh = new THREE.Mesh(geometry, material);
  const [nx, ny] = planRight(dx, dy, length, wall.thickness_side);
  mesh.position.set(start[0], 0, start[1]);
  mesh.setRotationFromMatrix(
    new THREE.Matrix4().makeBasis(
      new THREE.Vector3(dx / length, 0, dy / length),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(nx, 0, ny),
    ),
  );
  return mesh;
}

export function VolumeView({ plan }: VolumeViewProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !plan) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e6e2d8");
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    frame.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#fffaf3", 0.7));
    const sun = new THREE.DirectionalLight("#fff7ea", 1.4);
    sun.position.set(12, 18, 8);
    scene.add(sun);

    const volume = buildVolume(plan);
    scene.add(volume);
    const { center, span } = siteFrame(plan);
    const grid = new THREE.GridHelper(span * 2, 20, "#c5c0b4", "#d5d0c4");
    grid.position.y = 0;
    scene.add(grid);

    camera.position.set(center.x + span * 0.9, plan.storey.height_m * 2.2, center.z + span * 1.15);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(center);
    controls.enableDamping = true;
    controls.update();

    const resize = () => {
      const width = frame.clientWidth;
      const heightPx = frame.clientHeight;
      if (width === 0 || heightPx === 0) return;
      camera.aspect = width / heightPx;
      camera.updateProjectionMatrix();
      renderer.setSize(width, heightPx, false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);

    let frameId = 0;
    const draw = () => {
      frameId = requestAnimationFrame(draw);
      controls.update();
      renderer.render(scene, camera);
    };
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      controls.dispose();
      volume.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      grid.geometry.dispose();
      if (Array.isArray(grid.material)) {
        grid.material.forEach((material) => material.dispose());
      } else {
        grid.material.dispose();
      }
      renderer.dispose();
      frame.removeChild(renderer.domElement);
    };
  }, [plan]);

  const caption = plan
    ? plan.id === SAMPLE_PLAN_ID
      ? "Sample only: Rectangle's south wall, with its thickness side, door, and window. The rest of the building is not drawn."
      : "Empty volume. The worked example is the south wall on Rectangle."
    : "The volume appears with the selected plan.";

  return (
    <section className="volume" aria-label="Volume">
      <p className="volume-caption">{caption}</p>
      <div className="volume-frame" ref={frameRef} />
    </section>
  );
}
