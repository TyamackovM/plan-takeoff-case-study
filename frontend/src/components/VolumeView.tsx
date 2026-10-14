import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Plan } from "../types.ts";

type VolumeViewProps = {
  plan: Plan | null;
};

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

    const { center, span } = siteFrame(plan);
    const grid = new THREE.GridHelper(span * 2, 20, "#c5c0b4", "#d5d0c4");
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

  return (
    <section className="volume" aria-label="3D">
      <p className="volume-caption">{plan ? "3D view of the selected plan." : "The 3D view appears with the selected plan."}</p>
      <div className="volume-frame" ref={frameRef} />
    </section>
  );
}
