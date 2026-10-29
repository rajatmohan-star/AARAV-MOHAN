import * as THREE from 'three';
import { BuiltWorld } from './worldBuilder';
import { StageData } from '../types/game';
import { soundManager } from '../audio/soundManager';

export interface PlayerPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isGrounded: boolean;
  currentSpeed: number;
  lastActivePlatformId: string | null;
  invulnerableTimer: number;
}

export interface PhysicsCallbacks {
  onDamage: () => void;
  onCheckpoint: (index: number, name: string) => void;
  onFinish: () => void;
}

// Module-scope reusable objects for zero GC
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();

export class PhysicsEngine {
  private gravity = -29.0;
  private jumpPower = 11.2;
  private baseMoveSpeed = 12.0;
  private sprintMultiplier = 1.35;
  private groundFriction = 14.0;
  private airFriction = 2.0;

  public update(
    playerState: PlayerPhysicsState,
    input: { x: number; z: number; jump: boolean; sprint: boolean },
    cameraYaw: number,
    builtWorld: BuiltWorld,
    stage: StageData,
    delta: number,
    callbacks: PhysicsCallbacks
  ): void {
    const dt = Math.min(delta, 0.05); // Cap delta to prevent tunneling

    if (playerState.invulnerableTimer > 0) {
      playerState.invulnerableTimer -= dt;
    }

    // --- 1. HORIZONTAL MOVEMENT ---
    // Compute camera-relative direction
    _forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
    _right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

    _moveDir.set(0, 0, 0);
    _moveDir.addScaledVector(_forward, -input.z);
    _moveDir.addScaledVector(_right, input.x);

    const hasInput = _moveDir.lengthSq() > 0.001;
    if (hasInput) {
      _moveDir.normalize();
    }

    const targetSpeed = hasInput
      ? (this.baseMoveSpeed * (input.sprint ? this.sprintMultiplier : 1.0))
      : 0;

    const friction = playerState.isGrounded ? this.groundFriction : this.airFriction;

    if (hasInput) {
      const accel = playerState.isGrounded ? 45.0 : 20.0;
      playerState.velocity.x += _moveDir.x * accel * dt;
      playerState.velocity.z += _moveDir.z * accel * dt;

      // Limit max horizontal speed
      const hSpeed = Math.sqrt(playerState.velocity.x ** 2 + playerState.velocity.z ** 2);
      if (hSpeed > targetSpeed) {
        const factor = targetSpeed / hSpeed;
        playerState.velocity.x *= factor;
        playerState.velocity.z *= factor;
      }
    } else {
      // Apply friction damping
      const damp = Math.max(0, 1 - friction * dt);
      playerState.velocity.x *= damp;
      playerState.velocity.z *= damp;
    }

    // --- 2. JUMPING ---
    if (input.jump && playerState.isGrounded) {
      playerState.velocity.y = this.jumpPower;
      playerState.isGrounded = false;
      soundManager.playJump();
    }

    // Apply gravity
    playerState.velocity.y += this.gravity * dt;

    // --- 3. APPLY POSITION ---
    const prevY = playerState.position.y;
    playerState.position.x += playerState.velocity.x * dt;
    playerState.position.y += playerState.velocity.y * dt;
    playerState.position.z += playerState.velocity.z * dt;

    // --- 4. PLATFORM COLLISION DETECTION ---
    let groundedThisFrame = false;
    let standingPlatformTop = -999;
    let standingPlatformDelta = new THREE.Vector3();

    const playerRadius = 0.35;
    const playerFeet = playerState.position.y;

    for (const item of builtWorld.platformMeshes) {
      const p = item.def;
      const meshPos = item.mesh.position; // may be moving

      const halfW = p.width / 2;
      const halfD = p.depth / 2;

      // Check horizontal bounds
      const minX = meshPos.x - halfW - playerRadius;
      const maxX = meshPos.x + halfW + playerRadius;
      const minZ = meshPos.z - halfD - playerRadius;
      const maxZ = meshPos.z + halfD + playerRadius;

      if (
        playerState.position.x >= minX &&
        playerState.position.x <= maxX &&
        playerState.position.z >= minZ &&
        playerState.position.z <= maxZ
      ) {
        const platTop = meshPos.y + (p.type === 'cloud' ? 0.2 : 0.0);
        // If falling down onto or standing on platform surface
        if (
          prevY >= platTop - 0.25 &&
          playerFeet <= platTop + 0.35 &&
          playerState.velocity.y <= 0.1
        ) {
          groundedThisFrame = true;
          standingPlatformTop = platTop;
          playerState.lastActivePlatformId = p.id;

          // If moving platform, carry player along
          if (p.type === 'moving' && p.moveAxis && p.moveDistance) {
            const speed = p.moveSpeed || 2;
            const nowOffset = Math.sin(performance.now() * 0.001 * speed) * (p.moveDistance / 2);
            const prevOffset = Math.sin((performance.now() * 0.001 - dt) * speed) * (p.moveDistance / 2);
            const deltaOffset = nowOffset - prevOffset;
            if (p.moveAxis === 'x') standingPlatformDelta.x = deltaOffset;
            if (p.moveAxis === 'y') standingPlatformDelta.y = deltaOffset;
            if (p.moveAxis === 'z') standingPlatformDelta.z = deltaOffset;
          }
          break;
        }
      }
    }

    if (groundedThisFrame) {
      playerState.position.y = standingPlatformTop;
      playerState.velocity.y = 0;
      playerState.isGrounded = true;
      playerState.position.add(standingPlatformDelta);
    } else {
      playerState.isGrounded = false;
    }

    // --- 5. ROUND JUMP PADS DETECTION ---
    for (const jp of stage.jumpPads) {
      const dx = playerState.position.x - jp.x;
      const dz = playerState.position.z - jp.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const dy = playerState.position.y - jp.y;

      if (dist <= jp.radius + 0.4 && dy >= -0.5 && dy <= 1.2) {
        // Trigger super jump launch!
        playerState.velocity.y = jp.boostForce;
        if (jp.forwardBoost) {
          // Launch forward along -Z direction
          playerState.velocity.z = -jp.forwardBoost;
        }
        playerState.isGrounded = false;
        soundManager.playJumpPad();
        break;
      }
    }

    // --- 6. HAZARDS DETECTION ---
    if (playerState.invulnerableTimer <= 0) {
      for (const hz of builtWorld.hazardMeshes) {
        const hPos = hz.mesh.position;
        const dx = playerState.position.x - hPos.x;
        const dz = playerState.position.z - hPos.z;
        const dy = Math.abs(playerState.position.y - hPos.y);

        const dist2D = Math.sqrt(dx * dx + dz * dz);
        if (dist2D <= hz.def.radius + 0.3 && dy <= 1.2) {
          // Hazard hit!
          playerState.invulnerableTimer = 1.5;
          soundManager.playDamage();
          callbacks.onDamage();
          return;
        }
      }
    }

    // --- 7. CHECKPOINTS DETECTION ---
    for (const cp of stage.checkpoints) {
      const dx = playerState.position.x - cp.x;
      const dz = playerState.position.z - cp.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 2.5 && Math.abs(playerState.position.y - cp.y) < 2.0) {
        callbacks.onCheckpoint(cp.index, cp.name);
      }
    }

    // --- 8. FINISH LINE DETECTION ---
    const f = stage.finish;
    const fDistX = Math.abs(playerState.position.x - f.x);
    const fDistZ = Math.abs(playerState.position.z - f.z);
    const fDistY = Math.abs(playerState.position.y - f.y);

    if (fDistX < f.width / 2 + 0.5 && fDistZ < 2.0 && fDistY < f.height + 1.0) {
      callbacks.onFinish();
    }

    // --- 9. FALL INTO LAVA / ABYSS ---
    if (playerState.position.y < stage.killY) {
      soundManager.playDamage();
      callbacks.onDamage();
      return;
    }

    // Current horizontal speed for meter
    playerState.currentSpeed = Math.sqrt(
      playerState.velocity.x ** 2 + playerState.velocity.z ** 2
    );
  }
}
