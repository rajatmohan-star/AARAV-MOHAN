import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createCartoonCharacter, CharacterRig } from './proceduralCharacter';
import { buildWorld, BuiltWorld } from './worldBuilder';
import { PhysicsEngine, PlayerPhysicsState } from './physicsEngine';
import { STAGES_BY_WORLD, WORLDS_INFO } from './worldData';
import { InputState, PlayerStats, WorldId } from '../types/game';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onCheckpointTrigger: (name: string) => void;
  onStageComplete: (worldId: WorldId) => void;
  onGameOver: () => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private characterRig!: CharacterRig;
  private builtWorld: BuiltWorld | null = null;
  private physicsEngine: PhysicsEngine;
  private callbacks: GameEngineCallbacks;

  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private clock = new THREE.Clock();

  // Camera Orbit angles
  private cameraYaw: number = 0;
  private cameraPitch: number = 0.28;
  private cameraDist: number = 5.6;

  // Pointer drag tracking
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Key states
  private keysPressed: Record<string, boolean> = {};

  // External input (e.g. mobile joystick)
  public inputState: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    joystickX: 0,
    joystickY: 0,
  };

  // Player physics
  private playerPhysics: PlayerPhysicsState = {
    position: new THREE.Vector3(0, 1.5, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    isGrounded: true,
    currentSpeed: 0,
    lastActivePlatformId: null,
    invulnerableTimer: 0,
  };

  // Game Stats
  public stats: PlayerStats = {
    speed: 0,
    hearts: 5,
    maxHearts: 5,
    currentCheckpoint: 0,
    stageCompleted: false,
    gameTime: 0,
    streakMultiplier: 1.0,
    unlockedWorlds: [1],
    activeWorld: 1,
  };

  private lightsGroup = new THREE.Group();
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.physicsEngine = new PhysicsEngine();

    this.checkSoftwareGl();
    this.initScene();
    this.initLighting();
    this.initPlayer();
    this.loadWorld(1);
    this.setupListeners();
    this.startLoop();
  }

  private checkSoftwareGl() {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) {
      this.isSoftwareGl = true;
      return;
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  }

  private initScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    // Studio Environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    this.camera.position.set(0, 3, 5);
  }

  private initLighting() {
    this.scene.add(this.lightsGroup);

    // Warm Key Light (casts soft shadow)
    this.dirLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    this.dirLight.position.set(25, 40, 20);
    if (!this.isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 120;
      const d = 30;
      this.dirLight.shadow.camera.left = -d;
      this.dirLight.shadow.camera.right = d;
      this.dirLight.shadow.camera.top = d;
      this.dirLight.shadow.camera.bottom = -d;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.lightsGroup.add(this.dirLight);

    // Cool Fill Light
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x334155, 1.2);
    this.lightsGroup.add(this.hemiLight);
  }

  private updateFogAndAtmosphere(worldId: WorldId) {
    if (worldId === 1) {
      // Lava Rush: Warm smoky orange/red
      this.scene.background = new THREE.Color(0x2a0d10);
      this.scene.fog = new THREE.FogExp2(0x2a0d10, 0.012);
      this.dirLight.color.setHex(0xffedd5);
      this.hemiLight.color.setHex(0xfeb2b2);
      this.hemiLight.groundColor.setHex(0x7c2d12);
    } else if (worldId === 2) {
      // Frost Rush: Crystalline Arctic Cyan
      this.scene.background = new THREE.Color(0x06182c);
      this.scene.fog = new THREE.FogExp2(0x06182c, 0.011);
      this.dirLight.color.setHex(0xe0f2fe);
      this.hemiLight.color.setHex(0x7dd3fc);
      this.hemiLight.groundColor.setHex(0x0c4a6e);
    } else {
      // Haunted Rush: Spooky Halloween Night
      this.scene.background = new THREE.Color(0x130924);
      this.scene.fog = new THREE.FogExp2(0x130924, 0.013);
      this.dirLight.color.setHex(0xfbcfe8);
      this.hemiLight.color.setHex(0xc084fc);
      this.hemiLight.groundColor.setHex(0x3b0764);
    }
  }

  private initPlayer() {
    this.characterRig = createCartoonCharacter();
    this.scene.add(this.characterRig.group);
  }

  public loadWorld(worldId: WorldId) {
    if (this.builtWorld) {
      this.scene.remove(this.builtWorld.root);
      this.builtWorld.dispose();
      this.builtWorld = null;
    }

    this.stats.activeWorld = worldId;
    this.stats.currentCheckpoint = 0;
    this.stats.stageCompleted = false;

    this.updateFogAndAtmosphere(worldId);

    const stageData = STAGES_BY_WORLD[worldId];
    this.builtWorld = buildWorld(stageData);
    this.scene.add(this.builtWorld.root);

    // Spawn player
    this.respawnPlayer(0);
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  public respawnPlayer(checkpointIdx: number = this.stats.currentCheckpoint) {
    const stage = STAGES_BY_WORLD[this.stats.activeWorld];
    let spawn = stage.spawnPoint;

    if (checkpointIdx > 0) {
      const cp = stage.checkpoints.find((c) => c.index === checkpointIdx);
      if (cp) {
        spawn = { x: cp.x, y: cp.y + 0.6, z: cp.z };
      }
    }

    this.playerPhysics.position.set(spawn.x, spawn.y + 0.5, spawn.z);
    this.playerPhysics.velocity.set(0, 0, 0);
    this.playerPhysics.isGrounded = true;
    this.playerPhysics.invulnerableTimer = 1.2;

    this.characterRig.group.position.copy(this.playerPhysics.position);
    this.characterRig.group.rotation.y = 0;
  }

  public refillHearts() {
    this.stats.hearts = this.stats.maxHearts;
    this.respawnPlayer();
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  private handlePlayerDamage() {
    this.stats.hearts = Math.max(0, this.stats.hearts - 1);
    this.stats.streakMultiplier = 1.0;
    this.callbacks.onStatsUpdate({ ...this.stats });

    if (this.stats.hearts <= 0) {
      this.callbacks.onGameOver();
    } else {
      this.respawnPlayer();
    }
  }

  private handleCheckpoint(index: number, name: string) {
    if (index > this.stats.currentCheckpoint) {
      this.stats.currentCheckpoint = index;
      this.stats.streakMultiplier = Number((this.stats.streakMultiplier + 0.25).toFixed(2));
      soundManager.playCheckpoint();
      this.callbacks.onCheckpointTrigger(name);
      this.callbacks.onStatsUpdate({ ...this.stats });
    }
  }

  private handleFinish() {
    if (this.stats.stageCompleted) return;
    this.stats.stageCompleted = true;
    soundManager.playVictory();

    // Unlock next world if applicable
    const nextWorld = (this.stats.activeWorld + 1) as WorldId;
    if (nextWorld <= 3 && !this.stats.unlockedWorlds.includes(nextWorld)) {
      this.stats.unlockedWorlds = [...this.stats.unlockedWorlds, nextWorld];
    }

    this.callbacks.onStatsUpdate({ ...this.stats });
    this.callbacks.onStageComplete(this.stats.activeWorld);
  }

  private setupListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    // Only capture if not touching controls
    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;

    // Smooth camera rotation
    this.cameraYaw -= dx * 0.0055;
    this.cameraPitch = Math.max(0.08, Math.min(1.15, this.cameraPitch + dy * 0.004));

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  public handleCameraDrag(deltaX: number, deltaY: number) {
    this.cameraYaw -= deltaX * 0.0055;
    this.cameraPitch = Math.max(0.08, Math.min(1.15, this.cameraPitch + deltaY * 0.004));
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.animationFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.animationFrameId = window.setTimeout(cb, 80);
        }
      };
      this.animationFrameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.05);
      const time = this.clock.getElapsedTime();

      this.update(time, delta);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      afterDraw(tick);
    } else {
      this.animationFrameId = requestAnimationFrame(tick);
    }
  }

  private update(time: number, delta: number) {
    if (!this.builtWorld) return;

    this.stats.gameTime += delta;

    // 1. Gather combined inputs (keyboard + virtual joystick)
    let inputX = 0;
    let inputZ = 0;

    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) inputZ -= 1;
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) inputZ += 1;
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) inputX -= 1;
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) inputX += 1;

    // Add virtual joystick
    if (Math.abs(this.inputState.joystickX) > 0.05) inputX += this.inputState.joystickX;
    if (Math.abs(this.inputState.joystickY) > 0.05) inputZ += this.inputState.joystickY;

    const isJump = Boolean(this.keysPressed['Space'] || this.inputState.jump);
    const isSprint = Boolean(this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight'] || this.inputState.sprint);

    // 2. Physics step
    const stageData = STAGES_BY_WORLD[this.stats.activeWorld];
    this.physicsEngine.update(
      this.playerPhysics,
      { x: inputX, z: inputZ, jump: isJump, sprint: isSprint },
      this.cameraYaw,
      this.builtWorld,
      stageData,
      delta,
      {
        onDamage: () => this.handlePlayerDamage(),
        onCheckpoint: (idx, name) => this.handleCheckpoint(idx, name),
        onFinish: () => this.handleFinish(),
      }
    );

    // 3. Update character mesh position & rotation
    this.characterRig.group.position.copy(this.playerPhysics.position);

    // Face movement direction smoothly
    const hSpeed = Math.sqrt(this.playerPhysics.velocity.x ** 2 + this.playerPhysics.velocity.z ** 2);
    if (hSpeed > 0.2) {
      const targetAngle = Math.atan2(this.playerPhysics.velocity.x, this.playerPhysics.velocity.z);
      // Smooth angle interpolation
      let diff = targetAngle - this.characterRig.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.characterRig.group.rotation.y += diff * Math.min(1.0, delta * 12.0);
    }

    // Invulnerability blinking
    if (this.playerPhysics.invulnerableTimer > 0) {
      this.characterRig.group.visible = Math.floor(time * 16) % 2 === 0;
    } else {
      this.characterRig.group.visible = true;
    }

    // Update cartoon animation
    this.characterRig.updateAnimation(hSpeed, this.playerPhysics.isGrounded, delta);

    // 4. Update world animations (spinners, moving platforms, lava scroll)
    this.builtWorld.update(time, delta);

    // 5. Follow player with smooth Third-Person Camera
    const targetPlayerY = this.playerPhysics.position.y + 1.2;
    const targetCamX = this.playerPhysics.position.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDist;
    const targetCamY = targetPlayerY + Math.sin(this.cameraPitch) * this.cameraDist;
    const targetCamZ = this.playerPhysics.position.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDist;

    // Smooth exponential damping
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 14.0, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 14.0, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 14.0, delta);

    this.camera.lookAt(
      this.playerPhysics.position.x,
      targetPlayerY,
      this.playerPhysics.position.z
    );

    // Update Key Light position to follow player
    this.dirLight.position.set(
      this.playerPhysics.position.x + 20,
      this.playerPhysics.position.y + 35,
      this.playerPhysics.position.z + 18
    );
    this.dirLight.target.position.copy(this.playerPhysics.position);
    this.dirLight.target.updateMatrixWorld();

    // 6. Update stats HUD (convert speed to fun arcade units e.g. km/h or speed units)
    this.stats.speed = Math.round(hSpeed * 3.6);
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  public triggerJump(pressed: boolean) {
    this.inputState.jump = pressed;
  }

  public setJoystick(x: number, y: number) {
    this.inputState.joystickX = x;
    this.inputState.joystickY = y;
  }

  public dispose() {
    if (this.isSoftwareGl) {
      clearTimeout(this.animationFrameId);
    } else {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    if (this.builtWorld) {
      this.builtWorld.dispose();
    }

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
