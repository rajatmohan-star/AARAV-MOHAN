import { StageData, WorldInfo } from '../types/game';

export const WORLDS_INFO: Record<number, WorldInfo> = {
  1: {
    id: 1,
    name: 'Lava Rush',
    theme: 'lava',
    description: 'Brave the bubbling magma lake on vibrant purple platforms with yellow rails!',
    subtitle: 'World 1 • Stage 1',
    bgColor: '#3b0d11',
    accentColor: '#ff9500',
  },
  2: {
    id: 2,
    name: 'Frost Rush',
    theme: 'frost',
    description: 'Race across slick icy blue platforms and navigate frozen crystal obstacles!',
    subtitle: 'World 2 • Stage 2',
    bgColor: '#081b2e',
    accentColor: '#00d2ff',
  },
  3: {
    id: 3,
    name: 'Haunted Rush',
    theme: 'haunted',
    description: 'Escape the spooky Halloween castle over floating clouds and glowing pumpkins!',
    subtitle: 'World 3 • Stage 3',
    bgColor: '#170b28',
    accentColor: '#b5179e',
  },
};

// WORLD 1: LAVA RUSH (Stage 1)
export const STAGE_LAVA_RUSH: StageData = {
  worldId: 1,
  worldName: 'Lava Rush',
  stageName: 'Stage 1: Magma Sprint',
  stageNumber: 1,
  description: 'Purple platforms above orange lava with round jump pads',
  spawnPoint: { x: 0, y: 1.0, z: 0 },
  killY: -1.0,
  platforms: [
    // Starting lobby platform (purple with yellow edges)
    { id: 'l_start', x: 0, y: 0, z: 0, width: 8, depth: 10, height: 1.2, label: 'START' },
    // First hop sequence
    { id: 'l_p1', x: 0, y: 0, z: -8, width: 4.5, depth: 4.5, height: 1.2 },
    { id: 'l_p2', x: -2, y: 0.5, z: -15, width: 4.0, depth: 4.0, height: 1.2 },
    { id: 'l_p3', x: 2, y: 1.0, z: -22, width: 4.0, depth: 4.0, height: 1.2 },
    // Platform before jump pad 1
    { id: 'l_p4', x: 0, y: 1.5, z: -30, width: 6.0, depth: 7.0, height: 1.2 },
    // High landing platform after jump pad 1
    { id: 'l_p5', x: 0, y: 7.0, z: -52, width: 8.0, depth: 8.0, height: 1.2 },
    // Rotating obstacle bridge
    { id: 'l_p6', x: -3, y: 7.0, z: -63, width: 4.0, depth: 4.0, height: 1.2 },
    { id: 'l_p7', x: 3, y: 7.5, z: -71, width: 4.0, depth: 4.0, height: 1.2 },
    // Checkpoint 1 Island
    { id: 'l_cp1_plat', x: 0, y: 8.0, z: -83, width: 8.0, depth: 8.0, height: 1.2, label: 'CHECKPOINT 1' },
    // Double jump pad corridor
    { id: 'l_p8', x: 0, y: 8.0, z: -95, width: 6.0, depth: 6.0, height: 1.2 },
    // Mid-air landing island with second jump pad
    { id: 'l_p9', x: 0, y: 13.0, z: -116, width: 6.0, depth: 6.0, height: 1.2 },
    // High platform after double boost
    { id: 'l_p10', x: 0, y: 18.0, z: -138, width: 8.0, depth: 8.0, height: 1.2 },
    // Moving platforms section
    { id: 'l_mov1', x: 0, y: 18.0, z: -152, width: 4.5, depth: 4.5, height: 1.0, type: 'moving', moveAxis: 'x', moveDistance: 5.5, moveSpeed: 2.2 },
    { id: 'l_mov2', x: 0, y: 18.5, z: -164, width: 4.5, depth: 4.5, height: 1.0, type: 'moving', moveAxis: 'x', moveDistance: -5.5, moveSpeed: 2.2 },
    // Checkpoint 2 Island
    { id: 'l_cp2_plat', x: 0, y: 19.0, z: -178, width: 8.0, depth: 8.0, height: 1.2, label: 'CHECKPOINT 2' },
    // Final speed sprint stretch
    { id: 'l_p11', x: -2.5, y: 19.2, z: -190, width: 3.5, depth: 5.0, height: 1.2 },
    { id: 'l_p12', x: 2.5, y: 19.4, z: -201, width: 3.5, depth: 5.0, height: 1.2 },
    { id: 'l_p13', x: 0, y: 19.8, z: -212, width: 5.0, depth: 5.0, height: 1.2 },
    // Finish Arch Platform
    { id: 'l_finish_plat', x: 0, y: 20.0, z: -228, width: 10.0, depth: 12.0, height: 1.5, label: 'VICTORY' },
  ],
  jumpPads: [
    // Super jump pad 1
    { id: 'jp_l1', x: 0, y: 2.1, z: -31, radius: 1.4, boostForce: 16.5, forwardBoost: 16 },
    // Jump pad 2 in mid-air sequence
    { id: 'jp_l2', x: 0, y: 8.6, z: -95, radius: 1.4, boostForce: 15.5, forwardBoost: 15 },
    // Jump pad 3
    { id: 'jp_l3', x: 0, y: 13.6, z: -116, radius: 1.4, boostForce: 15.5, forwardBoost: 16 },
    // Final speed boost pad
    { id: 'jp_l4', x: 0, y: 20.4, z: -212, radius: 1.4, boostForce: 12.0, forwardBoost: 13 },
  ],
  hazards: [
    // Rotating fiery beam on platform 5
    { id: 'hz_l1', x: 0, y: 7.7, z: -52, radius: 3.2, type: 'spinner', rotationSpeed: 1.8 },
    // Hazard on platform 7
    { id: 'hz_l2', x: 3, y: 8.2, z: -71, radius: 2.0, type: 'spinner', rotationSpeed: -2.5 },
    // Hazard on platform 10
    { id: 'hz_l3', x: 0, y: 18.7, z: -138, radius: 3.4, type: 'spinner', rotationSpeed: 2.0 },
  ],
  checkpoints: [
    { id: 'cp_l1', index: 1, x: 0, y: 8.6, z: -83, name: 'Safe Zone 1' },
    { id: 'cp_l2', index: 2, x: 0, y: 19.6, z: -178, name: 'Safe Zone 2' },
  ],
  finish: {
    x: 0,
    y: 20.75,
    z: -230,
    width: 6,
    height: 5,
  },
};

// WORLD 2: FROST RUSH (Stage 2)
export const STAGE_FROST_RUSH: StageData = {
  worldId: 2,
  worldName: 'Frost Rush',
  stageName: 'Stage 2: Glacial Blitz',
  stageNumber: 2,
  description: 'Icy blue platforms and frozen obstacles over a crystalline abyss',
  spawnPoint: { x: 0, y: 1.0, z: 0 },
  killY: -2.0,
  platforms: [
    // Starting icy lobby platform
    { id: 'f_start', x: 0, y: 0, z: 0, width: 8, depth: 10, height: 1.2, type: 'ice', label: 'START' },
    // Ice bridge sequence
    { id: 'f_p1', x: 0, y: 0, z: -8, width: 4.5, depth: 4.5, height: 1.2, type: 'ice' },
    { id: 'f_p2', x: -3, y: 0.5, z: -16, width: 4.0, depth: 4.0, height: 1.2, type: 'ice' },
    { id: 'f_p3', x: 3, y: 1.2, z: -24, width: 4.0, depth: 4.0, height: 1.2, type: 'ice' },
    // Super ice ramp platform
    { id: 'f_p4', x: 0, y: 2.0, z: -33, width: 6.0, depth: 7.0, height: 1.2, type: 'ice' },
    // Glacier plateau
    { id: 'f_p5', x: 0, y: 8.5, z: -55, width: 8.0, depth: 8.0, height: 1.2, type: 'ice' },
    // Narrow icy stepping floes
    { id: 'f_p6', x: -2.5, y: 8.5, z: -66, width: 3.5, depth: 3.5, height: 1.2, type: 'ice' },
    { id: 'f_p7', x: 2.5, y: 9.0, z: -75, width: 3.5, depth: 3.5, height: 1.2, type: 'ice' },
    // Checkpoint 1 Plateau
    { id: 'f_cp1_plat', x: 0, y: 9.5, z: -87, width: 8.0, depth: 8.0, height: 1.2, type: 'ice', label: 'CHECKPOINT 1' },
    // Slippery moving ice blocks
    { id: 'f_mov1', x: 0, y: 9.8, z: -100, width: 4.5, depth: 4.5, height: 1.0, type: 'moving', moveAxis: 'x', moveDistance: 6.0, moveSpeed: 2.5 },
    { id: 'f_p8', x: 0, y: 10.2, z: -113, width: 6.0, depth: 6.0, height: 1.2, type: 'ice' },
    { id: 'f_mov2', x: 0, y: 10.5, z: -126, width: 4.5, depth: 4.5, height: 1.0, type: 'moving', moveAxis: 'x', moveDistance: -6.0, moveSpeed: 2.8 },
    // Checkpoint 2 Plateau
    { id: 'f_cp2_plat', x: 0, y: 11.0, z: -140, width: 8.0, depth: 8.0, height: 1.2, type: 'ice', label: 'CHECKPOINT 2' },
    // Launch ramp to upper frozen peak
    { id: 'f_p9', x: 0, y: 11.2, z: -152, width: 5.5, depth: 6.0, height: 1.2, type: 'ice' },
    // Floating ice crystal spire
    { id: 'f_p10', x: 0, y: 17.5, z: -174, width: 7.0, depth: 7.0, height: 1.2, type: 'ice' },
    { id: 'f_p11', x: -3, y: 18.0, z: -186, width: 3.8, depth: 3.8, height: 1.2, type: 'ice' },
    { id: 'f_p12', x: 3, y: 18.5, z: -196, width: 3.8, depth: 3.8, height: 1.2, type: 'ice' },
    // Grand Frozen Temple Finish Platform
    { id: 'f_finish_plat', x: 0, y: 19.0, z: -212, width: 10.0, depth: 12.0, height: 1.5, type: 'ice', label: 'VICTORY' },
  ],
  jumpPads: [
    { id: 'jp_f1', x: 0, y: 2.6, z: -34, radius: 1.4, boostForce: 17.5, forwardBoost: 16 },
    { id: 'jp_f2', x: 0, y: 10.8, z: -113, radius: 1.4, boostForce: 12.5, forwardBoost: 10 },
    { id: 'jp_f3', x: 0, y: 11.8, z: -153, radius: 1.4, boostForce: 17.5, forwardBoost: 16 },
  ],
  hazards: [
    // Frozen rotating crystal spinners
    { id: 'hz_f1', x: 0, y: 9.2, z: -55, radius: 3.4, type: 'icicle', rotationSpeed: 2.2 },
    { id: 'hz_f2', x: 0, y: 18.2, z: -174, radius: 3.2, type: 'icicle', rotationSpeed: -2.4 },
  ],
  checkpoints: [
    { id: 'cp_f1', index: 1, x: 0, y: 10.1, z: -87, name: 'Glacial Rest 1' },
    { id: 'cp_f2', index: 2, x: 0, y: 11.6, z: -140, name: 'Glacial Rest 2' },
  ],
  finish: {
    x: 0,
    y: 19.75,
    z: -214,
    width: 6,
    height: 5,
  },
};

// WORLD 3: HAUNTED RUSH (Stage 3)
export const STAGE_HAUNTED_RUSH: StageData = {
  worldId: 3,
  worldName: 'Haunted Rush',
  stageName: 'Stage 3: Halloween Castle',
  stageNumber: 3,
  description: 'Spooky purple Halloween castle with glowing pumpkins and cloud steps',
  spawnPoint: { x: 0, y: 1.0, z: 0 },
  killY: -2.0,
  platforms: [
    // Haunted castle start terrace
    { id: 'h_start', x: 0, y: 0, z: 0, width: 8, depth: 10, height: 1.2, label: 'START' },
    // Castle cobblestone bridge
    { id: 'h_p1', x: 0, y: 0, z: -8, width: 4.5, depth: 4.5, height: 1.2 },
    { id: 'h_p2', x: -2.5, y: 0.6, z: -15, width: 4.0, depth: 4.0, height: 1.2 },
    { id: 'h_p3', x: 2.5, y: 1.2, z: -23, width: 4.0, depth: 4.0, height: 1.2 },
    // Pad platform
    { id: 'h_p4', x: 0, y: 1.8, z: -32, width: 6.0, depth: 7.0, height: 1.2 },
    // CLOUD PLATFORMS (As featured in user reference screenshot IMG_0840_a5a592ca.jpeg!)
    { id: 'h_cloud1', x: 0, y: 8.0, z: -52, width: 7.0, depth: 7.0, height: 1.2, type: 'cloud', label: 'CLOUD' },
    { id: 'h_cloud2', x: -3.5, y: 8.5, z: -63, width: 5.5, depth: 5.5, height: 1.2, type: 'cloud', label: 'CLOUD' },
    { id: 'h_cloud3', x: 3.5, y: 9.0, z: -74, width: 5.5, depth: 5.5, height: 1.2, type: 'cloud', label: 'CLOUD' },
    // Checkpoint 1 Spooky Keep
    { id: 'h_cp1_plat', x: 0, y: 9.5, z: -86, width: 8.0, depth: 8.0, height: 1.2, label: 'CHECKPOINT 1' },
    // Ghostly moving platforms
    { id: 'h_mov1', x: 0, y: 10.0, z: -98, width: 4.5, depth: 4.5, height: 1.0, type: 'moving', moveAxis: 'x', moveDistance: 6.5, moveSpeed: 2.6 },
    { id: 'h_p5', x: 0, y: 10.5, z: -112, width: 6.0, depth: 6.0, height: 1.2 },
    // Second cloud launch
    { id: 'h_cloud4', x: 0, y: 16.5, z: -134, width: 7.0, depth: 7.0, height: 1.2, type: 'cloud', label: 'CLOUD' },
    // Checkpoint 2 Terrace
    { id: 'h_cp2_plat', x: 0, y: 17.0, z: -148, width: 8.0, depth: 8.0, height: 1.2, label: 'CHECKPOINT 2' },
    // Halloween number tiles runway (homage to reference pictures!)
    { id: 'h_p6', x: -2.5, y: 17.3, z: -160, width: 3.8, depth: 5.0, height: 1.2 },
    { id: 'h_p7', x: 2.5, y: 17.6, z: -172, width: 3.8, depth: 5.0, height: 1.2 },
    { id: 'h_p8', x: 0, y: 18.0, z: -184, width: 5.0, depth: 5.0, height: 1.2 },
    // Grand Halloween Castle Finish Platform
    { id: 'h_finish_plat', x: 0, y: 18.5, z: -202, width: 10.0, depth: 12.0, height: 1.5, label: 'GRAND ESCAPE' },
  ],
  jumpPads: [
    { id: 'jp_h1', x: 0, y: 2.4, z: -33, radius: 1.4, boostForce: 16.5, forwardBoost: 15 },
    { id: 'jp_h2', x: 0, y: 11.1, z: -112, radius: 1.4, boostForce: 16.5, forwardBoost: 16 },
    { id: 'jp_h3', x: 0, y: 18.6, z: -184, radius: 1.4, boostForce: 12.0, forwardBoost: 12 },
  ],
  hazards: [
    // Spooky glowing pumpkin lantern spinner
    { id: 'hz_h1', x: 0, y: 8.6, z: -52, radius: 3.2, type: 'pumpkin', rotationSpeed: 2.0 },
    // Haunted spinning barrier on cloud 4
    { id: 'hz_h2', x: 0, y: 17.2, z: -134, radius: 3.2, type: 'ghost', rotationSpeed: -2.3 },
  ],
  checkpoints: [
    { id: 'cp_h1', index: 1, x: 0, y: 10.1, z: -86, name: 'Crypt Safe Zone 1' },
    { id: 'cp_h2', index: 2, x: 0, y: 17.6, z: -148, name: 'Haunted Keep Safe Zone 2' },
  ],
  finish: {
    x: 0,
    y: 19.25,
    z: -204,
    width: 6,
    height: 5,
  },
};

export const STAGES_BY_WORLD: Record<number, StageData> = {
  1: STAGE_LAVA_RUSH,
  2: STAGE_FROST_RUSH,
  3: STAGE_HAUNTED_RUSH,
};
