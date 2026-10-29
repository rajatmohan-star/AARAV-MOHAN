import * as THREE from 'three';
import { CheckpointDef, HazardDef, JumpPadDef, PlatformDef, StageData } from '../types/game';

// Procedural texture generators
function createLavaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Magma base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#ff3b00');
  grad.addColorStop(0.5, '#ff8800');
  grad.addColorStop(1, '#ffaa00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Lava crust veins
  ctx.strokeStyle = '#991100';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    let x = (i * 37) % 512;
    let y = (i * 43) % 512;
    ctx.moveTo(x, y);
    for (let j = 0; j < 3; j++) {
      x += (Math.sin(i + j) * 80 + 30);
      y += (Math.cos(i + j) * 80 + 20);
      ctx.lineTo(x % 512, y % 512);
    }
    ctx.stroke();
  }

  // Bright molten hot spots
  ctx.fillStyle = '#ffee55';
  for (let i = 0; i < 25; i++) {
    const rx = (i * 83) % 512;
    const ry = (i * 67) % 512;
    ctx.beginPath();
    ctx.arc(rx, ry, 12 + (i % 8) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 28);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFrostTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a3d62';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.moveTo((i * 31) % 256, (i * 19) % 256);
    ctx.lineTo(((i * 31) + 40) % 256, ((i * 19) + 40) % 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface BuiltWorld {
  root: THREE.Group;
  platformMeshes: { def: PlatformDef; mesh: THREE.Group }[];
  jumpPadMeshes: { def: JumpPadDef; mesh: THREE.Group }[];
  hazardMeshes: { def: HazardDef; mesh: THREE.Group; spinAxis: 'y' | 'x'; speed: number }[];
  checkpointMeshes: { def: CheckpointDef; mesh: THREE.Group; beacon: THREE.Mesh }[];
  finishMesh: THREE.Group;
  liquidPlane: THREE.Mesh | null;
  update: (time: number, delta: number) => void;
  dispose: () => void;
}

export function buildWorld(stage: StageData): BuiltWorld {
  const root = new THREE.Group();
  root.name = `World_${stage.worldName}`;

  const platformMeshes: { def: PlatformDef; mesh: THREE.Group }[] = [];
  const jumpPadMeshes: { def: JumpPadDef; mesh: THREE.Group }[] = [];
  const hazardMeshes: { def: HazardDef; mesh: THREE.Group; spinAxis: 'y' | 'x'; speed: number }[] = [];
  const checkpointMeshes: { def: CheckpointDef; mesh: THREE.Group; beacon: THREE.Mesh }[] = [];

  // Theme materials
  const isLava = stage.worldId === 1;
  const isFrost = stage.worldId === 2;
  const isHaunted = stage.worldId === 3;

  // Platform materials
  // Reference prompt: "purple platforms with yellow edges"
  const purplePlatformMat = new THREE.MeshStandardMaterial({
    color: isFrost ? 0x1e3a8a : (isHaunted ? 0x581c87 : 0x7c3aed), // Blue in frost, rich deep purple in haunted & lava
    roughness: isFrost ? 0.15 : 0.4,
    metalness: isFrost ? 0.3 : 0.05,
  });

  const yellowEdgeMat = new THREE.MeshStandardMaterial({
    color: isFrost ? 0x38bdf8 : 0xfacc15, // Cyan frost glow vs vivid gold yellow
    roughness: 0.25,
    metalness: 0.1,
    emissive: isFrost ? 0x0284c7 : 0xca8a04,
    emissiveIntensity: 0.25,
  });

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
  });

  // --- 1. BUILD PLATFORMS ---
  stage.platforms.forEach((p) => {
    const platGroup = new THREE.Group();
    platGroup.position.set(p.x, p.y, p.z);

    if (p.type === 'cloud') {
      // Build 3D puffy cartoon cloud (as in reference IMG_0840_a5a592ca.jpeg)
      const cloudPuffs = 7;
      for (let i = 0; i < cloudPuffs; i++) {
        const radius = (p.width / 3.2) * (0.8 + (i % 3) * 0.15);
        const puffGeo = new THREE.SphereGeometry(radius, 12, 12);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        const angle = (i / cloudPuffs) * Math.PI * 2;
        const dist = p.width * 0.28;
        puff.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        puff.scale.set(1.1, 0.45, 1.1);
        puff.castShadow = true;
        puff.receiveShadow = true;
        platGroup.add(puff);
      }
      // Center puff
      const centerPuffGeo = new THREE.SphereGeometry(p.width * 0.35, 12, 12);
      const centerPuff = new THREE.Mesh(centerPuffGeo, cloudMat);
      centerPuff.scale.set(1.1, 0.48, 1.1);
      centerPuff.castShadow = true;
      centerPuff.receiveShadow = true;
      platGroup.add(centerPuff);
    } else {
      // Main platform block
      const mainGeo = new THREE.BoxGeometry(p.width, p.height, p.depth);
      const mainMesh = new THREE.Mesh(mainGeo, purplePlatformMat);
      mainMesh.position.y = -p.height / 2;
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      platGroup.add(mainMesh);

      // Yellow/accent edges around top perimeter (as in reference pictures!)
      const edgeThickness = 0.22;
      const edgeHeight = 0.12;

      // Front & Back edge rails
      const edgeFBGeo = new THREE.BoxGeometry(p.width, edgeHeight, edgeThickness);
      const edgeFront = new THREE.Mesh(edgeFBGeo, yellowEdgeMat);
      edgeFront.position.set(0, edgeHeight / 2, p.depth / 2 - edgeThickness / 2);
      platGroup.add(edgeFront);

      const edgeBack = new THREE.Mesh(edgeFBGeo, yellowEdgeMat);
      edgeBack.position.set(0, edgeHeight / 2, -p.depth / 2 + edgeThickness / 2);
      platGroup.add(edgeBack);

      // Left & Right edge rails
      const edgeLRGeo = new THREE.BoxGeometry(edgeThickness, edgeHeight, p.depth);
      const edgeLeft = new THREE.Mesh(edgeLRGeo, yellowEdgeMat);
      edgeLeft.position.set(-p.width / 2 + edgeThickness / 2, edgeHeight / 2, 0);
      platGroup.add(edgeLeft);

      const edgeRight = new THREE.Mesh(edgeLRGeo, yellowEdgeMat);
      edgeRight.position.set(p.width / 2 - edgeThickness / 2, edgeHeight / 2, 0);
      platGroup.add(edgeRight);
    }

    root.add(platGroup);
    platformMeshes.push({ def: p, mesh: platGroup });
  });

  // --- 2. BUILD ROUND JUMPING PADS ---
  // Prompt: "round jumping pads"
  // Reference screenshots show circular pads with yellow outer rim, radial spokes, spring mechanism
  const padRimMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15, // Bright yellow rim
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0xeab308,
    emissiveIntensity: 0.3,
  });

  const padCenterMat = new THREE.MeshStandardMaterial({
    color: isFrost ? 0x06b6d4 : 0x0284c7, // Cyan/blue inner disc
    roughness: 0.25,
    metalness: 0.4,
  });

  const padArrowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  stage.jumpPads.forEach((jp) => {
    const padGroup = new THREE.Group();
    padGroup.position.set(jp.x, jp.y, jp.z);

    // Outer circular torus rim
    const rimGeo = new THREE.TorusGeometry(jp.radius, 0.14, 16, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, padRimMat);
    rimMesh.castShadow = true;
    padGroup.add(rimMesh);

    // Inner bouncy disc
    const discGeo = new THREE.CylinderGeometry(jp.radius * 0.9, jp.radius * 0.9, 0.12, 32);
    const discMesh = new THREE.Mesh(discGeo, padCenterMat);
    discMesh.position.y = -0.02;
    padGroup.add(discMesh);

    // Glowing jump chevron / arrow on top
    const arrowGeo = new THREE.ConeGeometry(0.35, 0.6, 3);
    arrowGeo.rotateX(Math.PI / 2);
    arrowGeo.rotateZ(Math.PI);
    const arrowMesh = new THREE.Mesh(arrowGeo, padArrowMat);
    arrowMesh.position.y = 0.08;
    padGroup.add(arrowMesh);

    root.add(padGroup);
    jumpPadMeshes.push({ def: jp, mesh: padGroup });
  });

  // --- 3. BUILD HAZARDS ---
  const hazardMat = new THREE.MeshStandardMaterial({
    color: isFrost ? 0x7dd3fc : (isHaunted ? 0xf97316 : 0xef4444),
    roughness: 0.2,
    metalness: 0.1,
    emissive: isFrost ? 0x0284c7 : (isHaunted ? 0xea580c : 0xb91c1c),
    emissiveIntensity: 0.6,
  });

  stage.hazards.forEach((hz) => {
    const hzGroup = new THREE.Group();
    hzGroup.position.set(hz.x, hz.y, hz.z);

    if (hz.type === 'spinner') {
      // Rotating double hazard bar
      const barGeo = new THREE.CylinderGeometry(0.18, 0.18, hz.radius * 2, 16);
      barGeo.rotateZ(Math.PI / 2);
      const barMesh = new THREE.Mesh(barGeo, hazardMat);
      barMesh.castShadow = true;
      hzGroup.add(barMesh);

      // Center pivot hub
      const hubGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
      const hubMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      hzGroup.add(hubMesh);
    } else if (hz.type === 'icicle') {
      // Frozen spinning star icicle
      const icicleGeo = new THREE.ConeGeometry(0.35, hz.radius, 6);
      const icicle1 = new THREE.Mesh(icicleGeo, hazardMat);
      icicle1.rotation.z = Math.PI / 2;
      icicle1.position.x = hz.radius / 2;
      hzGroup.add(icicle1);

      const icicle2 = new THREE.Mesh(icicleGeo, hazardMat);
      icicle2.rotation.z = -Math.PI / 2;
      icicle2.position.x = -hz.radius / 2;
      hzGroup.add(icicle2);
    } else {
      // Spooky pumpkin / skull hazard
      const pumpkinGeo = new THREE.SphereGeometry(0.65, 16, 16);
      const pumpkinMesh = new THREE.Mesh(pumpkinGeo, hazardMat);
      pumpkinMesh.castShadow = true;
      hzGroup.add(pumpkinMesh);

      // Carved eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const eyeGeo = new THREE.ConeGeometry(0.12, 0.2, 3);
      const le = new THREE.Mesh(eyeGeo, eyeMat);
      le.position.set(-0.2, 0.15, 0.55);
      le.rotation.x = Math.PI / 2;
      hzGroup.add(le);
      const re = new THREE.Mesh(eyeGeo, eyeMat);
      re.position.set(0.2, 0.15, 0.55);
      re.rotation.x = Math.PI / 2;
      hzGroup.add(re);
    }

    root.add(hzGroup);
    hazardMeshes.push({
      def: hz,
      mesh: hzGroup,
      spinAxis: 'y',
      speed: hz.rotationSpeed || 2.0,
    });
  });

  // --- 4. BUILD CHECKPOINTS ---
  const cpActiveMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e, // Bright green
    transparent: true,
    opacity: 0.45,
  });

  stage.checkpoints.forEach((cp) => {
    const cpGroup = new THREE.Group();
    cpGroup.position.set(cp.x, cp.y, cp.z);

    // Glowing ground circle
    const padGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.1, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: 0x15803d,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    cpGroup.add(pad);

    // Vertical light beam beacon
    const beaconGeo = new THREE.CylinderGeometry(1.8, 1.8, 8, 24, 1, true);
    const beaconMesh = new THREE.Mesh(beaconGeo, cpActiveMat);
    beaconMesh.position.y = 4;
    cpGroup.add(beaconMesh);

    // Safe zone arch banner
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftPost = new THREE.Mesh(postGeo, postMat);
    leftPost.position.set(-1.8, 1.75, 0);
    cpGroup.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, postMat);
    rightPost.position.set(1.8, 1.75, 0);
    cpGroup.add(rightPost);

    const beamGeo = new THREE.BoxGeometry(4.0, 0.4, 0.2);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.6 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 3.4, 0);
    cpGroup.add(beam);

    root.add(cpGroup);
    checkpointMeshes.push({ def: cp, mesh: cpGroup, beacon: beaconMesh });
  });

  // --- 5. BUILD FINISH ARCH & PORTAL ---
  const finishGroup = new THREE.Group();
  finishGroup.position.set(stage.finish.x, stage.finish.y, stage.finish.z);

  // Grand Portal Archway
  const archMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.6,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.3,
  });

  const pillarGeo = new THREE.CylinderGeometry(0.45, 0.5, stage.finish.height, 16);
  const leftPillar = new THREE.Mesh(pillarGeo, archMat);
  leftPillar.position.set(-stage.finish.width / 2, stage.finish.height / 2, 0);
  leftPillar.castShadow = true;
  finishGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, archMat);
  rightPillar.position.set(stage.finish.width / 2, stage.finish.height / 2, 0);
  rightPillar.castShadow = true;
  finishGroup.add(rightPillar);

  const topCrossGeo = new THREE.BoxGeometry(stage.finish.width + 1.2, 0.7, 0.9);
  const topCross = new THREE.Mesh(topCrossGeo, archMat);
  topCross.position.set(0, stage.finish.height + 0.1, 0);
  finishGroup.add(topCross);

  // Swirling portal energy disc
  const portalGeo = new THREE.PlaneGeometry(stage.finish.width - 0.8, stage.finish.height - 0.5);
  const portalMat = new THREE.MeshBasicMaterial({
    color: isLava ? 0xff5500 : (isFrost ? 0x38bdf8 : 0xc084fc),
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const portalMesh = new THREE.Mesh(portalGeo, portalMat);
  portalMesh.position.set(0, stage.finish.height / 2, 0);
  finishGroup.add(portalMesh);

  // Decorative trophy/star on top
  const starGeo = new THREE.OctahedronGeometry(0.65);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0xb45309,
    emissiveIntensity: 0.5,
  });
  const starMesh = new THREE.Mesh(starGeo, starMat);
  starMesh.position.set(0, stage.finish.height + 0.9, 0);
  finishGroup.add(starMesh);

  root.add(finishGroup);

  // --- 6. UNDERNEATH HAZARD / ENVIRONMENT PLANE ---
  // Prompt: "orange lava" for World 1
  let liquidPlane: THREE.Mesh | null = null;
  if (isLava) {
    const lavaGeo = new THREE.PlaneGeometry(120, 360, 24, 48);
    const lavaMat = new THREE.MeshStandardMaterial({
      map: createLavaTexture(),
      roughness: 0.6,
      metalness: 0.1,
      emissive: 0xff4500,
      emissiveIntensity: 0.45,
    });
    liquidPlane = new THREE.Mesh(lavaGeo, lavaMat);
    liquidPlane.rotation.x = -Math.PI / 2;
    liquidPlane.position.set(0, -1.0, -110);
    liquidPlane.receiveShadow = true;
    root.add(liquidPlane);
  } else if (isFrost) {
    const iceSeaGeo = new THREE.PlaneGeometry(120, 360, 24, 48);
    const iceSeaMat = new THREE.MeshStandardMaterial({
      map: createFrostTexture(),
      roughness: 0.1,
      metalness: 0.4,
      emissive: 0x0369a1,
      emissiveIntensity: 0.35,
    });
    liquidPlane = new THREE.Mesh(iceSeaGeo, iceSeaMat);
    liquidPlane.rotation.x = -Math.PI / 2;
    liquidPlane.position.set(0, -2.5, -110);
    root.add(liquidPlane);
  } else if (isHaunted) {
    // Spooky purple abyss with floating clouds & jack-o'-lanterns
    const darkGeo = new THREE.PlaneGeometry(120, 360);
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x130722,
      roughness: 0.9,
    });
    liquidPlane = new THREE.Mesh(darkGeo, darkMat);
    liquidPlane.rotation.x = -Math.PI / 2;
    liquidPlane.position.set(0, -2.5, -110);
    root.add(liquidPlane);

    // Add decorative carved pumpkins along platforms (like references!)
    const pumpkinMat = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      roughness: 0.4,
      emissive: 0xcc5500,
      emissiveIntensity: 0.35,
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });

    [-18, -45, -86, -112, -148, -170].forEach((zPos, idx) => {
      const pGroup = new THREE.Group();
      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), pumpkinMat);
      pMesh.scale.set(1.1, 0.85, 1.1);
      pGroup.add(pMesh);

      const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8), stemMat);
      stemMesh.position.y = 0.42;
      pGroup.add(stemMesh);

      const sideX = (idx % 2 === 0 ? 3.5 : -3.5);
      pGroup.position.set(sideX, 2.0 + (idx * 2.5), zPos);
      root.add(pGroup);
    });
  }

  // Animation update
  const update = (time: number, delta: number) => {
    // Rotate hazard bars
    hazardMeshes.forEach((h) => {
      h.mesh.rotation.y += h.speed * delta;
    });

    // Move dynamic platforms
    platformMeshes.forEach((item) => {
      if (item.def.type === 'moving' && item.def.moveAxis && item.def.moveDistance) {
        const speed = item.def.moveSpeed || 2;
        const offset = Math.sin(time * speed) * (item.def.moveDistance / 2);
        if (item.def.moveAxis === 'x') {
          item.mesh.position.x = item.def.x + offset;
        } else if (item.def.moveAxis === 'y') {
          item.mesh.position.y = item.def.y + offset;
        } else if (item.def.moveAxis === 'z') {
          item.mesh.position.z = item.def.z + offset;
        }
      }
    });

    // Bouncy jump pad subtle idle ring animation
    jumpPadMeshes.forEach((jp, idx) => {
      jp.mesh.position.y = jp.def.y + Math.sin(time * 3 + idx) * 0.04;
    });

    // Pulse checkpoint beacons
    checkpointMeshes.forEach((cp, idx) => {
      cp.beacon.rotation.y += delta * 1.5;
      const pulse = 0.35 + Math.sin(time * 3 + idx) * 0.12;
      (cp.beacon.material as THREE.MeshBasicMaterial).opacity = pulse;
    });

    // Rotate portal star and animate portal swirl
    starMesh.rotation.y += delta * 2.0;
    starMesh.rotation.z += delta * 0.8;

    // Scroll lava / ice texture
    if (liquidPlane && (liquidPlane.material as THREE.MeshStandardMaterial).map) {
      const map = (liquidPlane.material as THREE.MeshStandardMaterial).map;
      if (map) {
        map.offset.y += delta * 0.05;
        map.offset.x += delta * 0.01;
      }
    }
  };

  const dispose = () => {
    // Traverse and dispose geometries and materials
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });
  };

  return {
    root,
    platformMeshes,
    jumpPadMeshes,
    hazardMeshes,
    checkpointMeshes,
    finishMesh: finishGroup,
    liquidPlane,
    update,
    dispose,
  };
}
