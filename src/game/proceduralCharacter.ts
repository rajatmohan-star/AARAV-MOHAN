import * as THREE from 'three';

export interface CharacterRig {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  shadowDisc: THREE.Mesh;
  hat: THREE.Group;
  updateAnimation: (speed: number, isGrounded: boolean, delta: number) => void;
  setBlinking: (blink: boolean) => void;
}

export function createCartoonCharacter(): CharacterRig {
  const root = new THREE.Group();
  root.name = 'PlayerCharacter';

  // Body container (for squash/stretch and hip tilt)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.75;
  root.add(bodyGroup);

  // High-performance vibrant cartoon PBR materials
  const hoodieMat = new THREE.MeshStandardMaterial({
    color: 0xff2a6d, // Vibrant bright magenta hoodie (as seen in reference)
    roughness: 0.35,
    metalness: 0.05,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffd1a4, // Peachy cartoon skin
    roughness: 0.5,
    metalness: 0.0,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x9c27b0, // Deep purple pants
    roughness: 0.4,
    metalness: 0.1,
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x22223b, // Dark navy runner sneakers
    roughness: 0.3,
    metalness: 0.1,
  });

  const hatMat = new THREE.MeshStandardMaterial({
    color: 0x2b2d42, // Sleek dark top hat
    roughness: 0.3,
    metalness: 0.2,
  });

  // --- 1. TORSO (Smooth Capsule) ---
  const torsoGeo = new THREE.CapsuleGeometry(0.32, 0.45, 16, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, hoodieMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torsoMesh.position.y = 0.25;
  bodyGroup.add(torsoMesh);

  // Hoodie pocket detail
  const pocketGeo = new THREE.BoxGeometry(0.36, 0.16, 0.12);
  const pocketMat = new THREE.MeshStandardMaterial({
    color: 0xe01e5a,
    roughness: 0.4,
  });
  const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
  pocketMesh.position.set(0, 0.12, 0.26);
  bodyGroup.add(pocketMesh);

  // --- 2. HEAD & FACE ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.65, 0);
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Cute cartoon eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111122 });
  const eyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const pupilGeo = new THREE.SphereGeometry(0.035, 10, 10);

  // Left Eye
  const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  leftEye.position.set(-0.1, 0.04, 0.24);
  const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  leftPupil.position.set(0, 0, 0.045);
  leftEye.add(leftPupil);
  headGroup.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
  rightEye.position.set(0.1, 0.04, 0.24);
  const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  rightPupil.position.set(0, 0, 0.045);
  rightEye.add(rightPupil);
  headGroup.add(rightEye);

  // Cute blushing cheeks
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xff70a6, transparent: true, opacity: 0.7 });
  const blushGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.16, -0.04, 0.22);
  headGroup.add(leftBlush);
  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.16, -0.04, 0.22);
  headGroup.add(rightBlush);

  // --- 3. COLORFUL TOP HAT (Reference Item) ---
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.24, 0);
  headGroup.add(hatGroup);

  // Brim
  const brimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.05, 24);
  const brimMesh = new THREE.Mesh(brimGeo, hatMat);
  brimMesh.castShadow = true;
  hatGroup.add(brimMesh);

  // Crown
  const crownGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.4, 24);
  const crownMesh = new THREE.Mesh(crownGeo, hatMat);
  crownMesh.position.y = 0.22;
  crownMesh.castShadow = true;
  hatGroup.add(crownMesh);

  // Rainbow striped ribbon bands (as seen on SpeedyWizard in screenshot!)
  const rainbowColors = [0xff3b30, 0xff9500, 0xffcc00, 0x34c759, 0x007aff];
  rainbowColors.forEach((col, i) => {
    const ringGeo = new THREE.CylinderGeometry(0.283, 0.283, 0.03, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: col });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.07 + i * 0.035;
    hatGroup.add(ringMesh);
  });

  // --- 4. LEGS & SNEAKERS ---
  const legGeo = new THREE.CapsuleGeometry(0.09, 0.38, 12, 12);
  const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.3);

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.16, 0.0, 0);
  bodyGroup.add(leftLegGroup);

  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.25;
  leftLegMesh.castShadow = true;
  leftLegGroup.add(leftLegMesh);

  const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
  leftShoe.position.set(0, -0.46, 0.05);
  leftShoe.castShadow = true;
  leftLegGroup.add(leftShoe);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.16, 0.0, 0);
  bodyGroup.add(rightLegGroup);

  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.25;
  rightLegMesh.castShadow = true;
  rightLegGroup.add(rightLegMesh);

  const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
  rightShoe.position.set(0, -0.46, 0.05);
  rightShoe.castShadow = true;
  rightLegGroup.add(rightShoe);

  // --- 5. ARMS & HANDS ---
  const armGeo = new THREE.CapsuleGeometry(0.08, 0.36, 12, 12);
  const handGeo = new THREE.SphereGeometry(0.09, 12, 12);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.38, 0.38, 0);
  bodyGroup.add(leftArmGroup);

  const leftArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  leftArmMesh.position.y = -0.18;
  leftArmMesh.castShadow = true;
  leftArmGroup.add(leftArmMesh);

  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.38, 0);
  leftArmGroup.add(leftHand);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.38, 0.38, 0);
  bodyGroup.add(rightArmGroup);

  const rightArmMesh = new THREE.Mesh(armGeo, hoodieMat);
  rightArmMesh.position.y = -0.18;
  rightArmMesh.castShadow = true;
  rightArmGroup.add(rightArmMesh);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.38, 0);
  rightArmGroup.add(rightHand);

  // --- 6. CONTACT SHADOW DISC ---
  const shadowGeo = new THREE.CircleGeometry(0.48, 24);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  root.add(shadowDisc);

  // Animation cycle variables
  let animTime = 0;

  const updateAnimation = (speed: number, isGrounded: boolean, delta: number) => {
    if (isGrounded) {
      if (speed > 0.4) {
        // Running cycle
        const strideFrequency = Math.min(18, 7 + speed * 0.45);
        animTime += delta * strideFrequency;

        const legAngle = Math.sin(animTime) * 0.75;
        const armAngle = -Math.sin(animTime) * 0.7;

        leftLegGroup.rotation.x = legAngle;
        rightLegGroup.rotation.x = -legAngle;

        leftArmGroup.rotation.x = armAngle;
        leftArmGroup.rotation.z = -0.15;
        rightArmGroup.rotation.x = -armAngle;
        rightArmGroup.rotation.z = 0.15;

        // Torso bounce and lean forward
        bodyGroup.position.y = 0.75 + Math.abs(Math.sin(animTime * 2)) * 0.08;
        bodyGroup.rotation.x = Math.min(0.28, speed * 0.012);
        bodyGroup.rotation.y = Math.sin(animTime) * 0.08;

        // Hat jiggle
        hatGroup.rotation.z = Math.sin(animTime) * 0.05;
      } else {
        // Idle breathing
        animTime += delta * 2.5;
        bodyGroup.position.y = 0.75 + Math.sin(animTime) * 0.02;
        bodyGroup.rotation.x = 0;
        bodyGroup.rotation.y = 0;

        leftLegGroup.rotation.x = 0;
        rightLegGroup.rotation.x = 0;
        leftArmGroup.rotation.x = Math.sin(animTime) * 0.04;
        leftArmGroup.rotation.z = -0.1;
        rightArmGroup.rotation.x = -Math.sin(animTime) * 0.04;
        rightArmGroup.rotation.z = 0.1;

        hatGroup.rotation.z = 0;
      }
    } else {
      // In air / jumping pose
      leftLegGroup.rotation.x = -0.55;
      rightLegGroup.rotation.x = 0.45;
      leftArmGroup.rotation.x = -0.9;
      leftArmGroup.rotation.z = -0.4;
      rightArmGroup.rotation.x = -0.9;
      rightArmGroup.rotation.z = 0.4;
      bodyGroup.rotation.x = -0.15;
    }
  };

  const setBlinking = (blink: boolean) => {
    leftEye.scale.y = blink ? 0.1 : 1.0;
    rightEye.scale.y = blink ? 0.1 : 1.0;
  };

  return {
    group: root,
    body: bodyGroup,
    head: headGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    shadowDisc,
    hat: hatGroup,
    updateAnimation,
    setBlinking,
  };
}
