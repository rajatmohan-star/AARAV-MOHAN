export type WorldId = 1 | 2 | 3;

export interface WorldInfo {
  id: WorldId;
  name: string;
  theme: 'lava' | 'frost' | 'haunted';
  description: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type?: 'regular' | 'ice' | 'bouncy' | 'moving' | 'disappearing' | 'cloud';
  moveAxis?: 'x' | 'y' | 'z';
  moveDistance?: number;
  moveSpeed?: number;
  label?: string;
}

export interface JumpPadDef {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  boostForce: number;
  forwardBoost?: number;
}

export interface HazardDef {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  height?: number;
  type: 'spinner' | 'icicle' | 'ghost' | 'pumpkin' | 'laser';
  rotationSpeed?: number;
  axis?: 'y' | 'x';
}

export interface CheckpointDef {
  id: string;
  index: number;
  x: number;
  y: number;
  z: number;
  name: string;
}

export interface FinishDef {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}

export interface StageData {
  worldId: WorldId;
  worldName: string;
  stageName: string;
  stageNumber: number;
  description: string;
  spawnPoint: Vector3D;
  platforms: PlatformDef[];
  jumpPads: JumpPadDef[];
  hazards: HazardDef[];
  checkpoints: CheckpointDef[];
  finish: FinishDef;
  killY: number;
}

export interface PlayerStats {
  speed: number;
  hearts: number;
  maxHearts: number;
  currentCheckpoint: number;
  stageCompleted: boolean;
  gameTime: number;
  streakMultiplier: number;
  unlockedWorlds: number[]; // [1, 2, 3]
  activeWorld: WorldId;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  joystickX: number; // -1 to 1
  joystickY: number; // -1 to 1
}
