import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/PointerLockControls.js';

const MONSTERS = [
  {
    id: 'shadow-stalker',
    name: 'Shadow Stalker',
    description: 'A stealthy pursuer that blends with darkness',
    speed: 0.06,
    strength: 'High',
    ability: 'Temporary Invisibility',
    abilityDescription: 'Becomes invisible for 10 seconds',
    abilityDuration: 10000,
    cooldown: 120000,
    color: 0x220000,
    emissive: 0x110000,
    scale: 1.2,
    modelParts: [
      { type: 'core', geometry: 'icosahedron', scale: [1.2, 1.5, 1.2] },
      { type: 'spikes', count: 6, length: 0.8 },
      { type: 'tentacles', count: 4, length: 1.2 }
    ]
  },
  {
    id: 'flame-hunter',
    name: 'Flame Hunter',
    description: 'Leaves a trail of burning destruction',
    speed: 0.08,
    strength: 'Medium',
    ability: 'Flame Barrier',
    abilityDescription: 'Creates a circle of fire that damages the player',
    abilityDuration: 15000,
    cooldown: 120000,
    color: 0xff4400,
    emissive: 0xff2200,
    scale: 1.0,
    modelParts: [
      { type: 'core', geometry: 'sphere', scale: [1, 1, 1] },
      { type: 'flames', count: 8, height: 0.6 }
    ]
  },
  {
    id: 'cyber-sentinel',
    name: 'Cyber Sentinel',
    description: 'Advanced AI construct with tactical capabilities',
    speed: 0.07,
    strength: 'Medium',
    ability: 'Tactical Scan',
    abilityDescription: 'Reveals player location and predicts movement',
    abilityDuration: 8000,
    cooldown: 120000,
    color: 0x00ffff,
    emissive: 0x00aaaa,
    scale: 1.1,
    modelParts: [
      { type: 'core', geometry: 'dodecahedron', scale: [1.1, 1.1, 1.1] },
      { type: 'antenna', count: 3, height: 0.5 },
      { type: 'scanner', radius: 0.3 }
    ]
  },
  {
    id: 'bio-horror',
    name: 'Bio-Horror',
    description: 'Mutated creature with regenerative powers',
    speed: 0.05,
    strength: 'Very High',
    ability: 'Rapid Regeneration',
    abilityDescription: 'Heals damage and increases speed temporarily',
    abilityDuration: 12000,
    cooldown: 120000,
    color: 0x00ff00,
    emissive: 0x006600,
    scale: 1.3,
    modelParts: [
      { type: 'core', geometry: 'sphere', scale: [1.3, 1.5, 1.3] },
      { type: 'tentacles', count: 6, length: 1.5 },
      { type: 'spores', count: 12 }
    ]
  },
  {
    id: 'quantum-wraith',
    name: 'Quantum Wraith',
    description: 'Ethereal being that phases through walls',
    speed: 0.09,
    strength: 'Low',
    ability: 'Phase Shift',
    abilityDescription: 'Can move through walls temporarily',
    abilityDuration: 5000,
    cooldown: 120000,
    color: 0x9900ff,
    emissive: 0x660099,
    scale: 0.9,
    modelParts: [
      { type: 'core', geometry: 'octahedron', scale: [0.9, 1.2, 0.9] },
      { type: 'aura', particles: 20 },
      { type: 'wisps', count: 4 }
    ]
  },
  {
    id: 'doom-mech',
    name: 'Doom Mech',
    description: 'Heavily armored mechanical monster',
    speed: 0.04,
    strength: 'Extreme',
    ability: 'Seismic Slam',
    abilityDescription: 'Creates shockwave that stuns the player',
    abilityDuration: 3000,
    cooldown: 120000,
    color: 0x666666,
    emissive: 0x333333,
    scale: 1.5,
    modelParts: [
      { type: 'core', geometry: 'box', scale: [1.5, 2, 1.5] },
      { type: 'armor', plates: 6 },
      { type: 'pistons', count: 4 }
    ]
  }
];

var selectedMonster = null;

var camera, scene, renderer, controls;
var monster; 
var exit = null; 
var maze;
var mazeWalls = []; 
var gameOver = false;
var won = false;
var backgroundMusic;
var flashlightOn = false;
var flashlight;

// Game state
var currentObjectives = [];
const OBJECTIVES_NEEDED = 4; 

const POSSIBLE_OBJECTIVES = [
  {
    id: 'find-key',
    name: 'Find the key',
    itemColor: 0xFFD700,
    emissiveColor: 0x665500,
    geometry: 'box',
    dimensions: [0.5, 0.5, 0.1],
    itemCount: 1
  },
  {
    id: 'collect-evidence',
    name: 'Collect evidence',
    itemColor: 0x0000ff,
    emissiveColor: 0x000066,
    geometry: 'sphere',
    dimensions: [0.3, 16, 16],
    itemCount: 3
  },
  {
    id: 'find-scrolls',
    name: 'Find ancient scrolls',
    itemColor: 0xC4A484,
    emissiveColor: 0x625039,
    geometry: 'cylinder',
    dimensions: [0.1, 0.1, 0.4, 16],
    itemCount: 2
  },
  {
    id: 'collect-gems',
    name: 'Collect magical gems',
    itemColor: 0xFF00FF,
    emissiveColor: 0x800080,
    geometry: 'octahedron',
    dimensions: [0.3],
    itemCount: 4
  },
  {
    id: 'find-relics',
    name: 'Find cursed relics',
    itemColor: 0x800000,
    emissiveColor: 0x400000,
    geometry: 'dodecahedron',
    dimensions: [0.3],
    itemCount: 2
  }
];

var gameItems = [];
var itemsCollected = {};

const MAZE_SIZE = 20;
const CELL_SIZE = 5;
const WALL_HEIGHT = 4;
const PLAYER_HEIGHT = 2;
const PLAYER_RADIUS = 0.5;

const playerVelocity = new THREE.Vector3();
const moveSpeed = 0.1;
var monsterSpeed = 0.07;

// Add these new variables for ability management
var canUseAbility = true;
var abilityTimer = null;
var cooldownTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  const monsterGrid = document.querySelector('.monster-grid');
  
  MONSTERS.forEach(monsterData => {
    const card = document.createElement('div');
    card.className = 'monster-card';
    card.innerHTML = `
      <div class="monster-preview"></div>
      <div class="monster-name">${monsterData.name}</div>
      <div class="monster-description">${monsterData.description}</div>
      <div class="monster-stats">
        <div class="stat">
          <span class="stat-label">Speed</span>
          <span class="stat-value">${Math.round(monsterData.speed * 100)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Strength</span>
          <span class="stat-value">${monsterData.strength}</span>
        </div>
      </div>
      <div class="monster-ability">
        <span class="stat-label">Special Ability:</span>
        <span class="stat-value">${monsterData.ability}</span>
      </div>
      <button class="select-button">Select Monster</button>
    `;

    // Add preview renderer
    const preview = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    preview.setSize(200, 200);
    const previewScene = new THREE.Scene();
    const previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    previewCamera.position.set(0, 0, 5);
    
    // Add lighting to preview
    const previewLight = new THREE.DirectionalLight(0xffffff, 1);
    previewLight.position.set(1, 1, 1);
    previewScene.add(previewLight);
    
    // Create mini version of monster for preview
    const previewMonster = createPreviewMonster(monsterData);
    previewScene.add(previewMonster);
    
    // Animate preview
    function animatePreview() {
      if (card.isConnected) {
        previewMonster.rotation.y += 0.01;
        preview.render(previewScene, previewCamera);
        requestAnimationFrame(animatePreview);
      }
    }
    animatePreview();
    
    card.querySelector('.monster-preview').appendChild(preview.domElement);

    card.querySelector('.select-button').addEventListener('click', () => {
      selectedMonster = monsterData;
      document.getElementById('monster-select').style.display = 'none';
      document.getElementById('game-container').style.display = 'block';
      
      // Start the game with selected monster
      init();
      animate();
      
      // Play background music
      try {
        backgroundMusic.play().catch(error => {
          console.log("Audio autoplay failed:", error);
        });
      } catch (e) {
        console.log("Audio playback error:", e);
      }
    });

    monsterGrid.appendChild(card);
  });
});

function createPreviewMonster(monsterData) {
  const previewMonster = new THREE.Group();
  
  // Basic body shape
  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshPhongMaterial({
      color: monsterData.color,
      emissive: monsterData.emissive,
      shininess: 0,
      flatShading: true
    })
  );
  previewMonster.add(body);
  
  // Add basic features (similar to main monster but simplified)
  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 8, 8),
    new THREE.MeshPhongMaterial({
      color: monsterData.color,
      emissive: monsterData.emissive,
      flatShading: true
    })
  );
  skull.position.z = 0.5;
  previewMonster.add(skull);
  
  // Scale the preview monster
  previewMonster.scale.setScalar(0.8);
  
  return previewMonster;
}

function selectRandomObjectives() {
  const availableObjectives = [...POSSIBLE_OBJECTIVES];
  currentObjectives = [];
  
  // Randomly select objectives
  for (let i = 0; i < OBJECTIVES_NEEDED; i++) {
    const randomIndex = Math.floor(Math.random() * availableObjectives.length);
    currentObjectives.push(availableObjectives.splice(randomIndex, 1)[0]);
  }
  
  // Initialize collection tracking
  itemsCollected = {};
  currentObjectives.forEach(obj => {
    itemsCollected[obj.id] = 0;
  });
}

function createGameItems() {
  gameItems = [];
  
  currentObjectives.forEach(objective => {
    let geometry;
    
    switch(objective.geometry) {
      case 'box':
        geometry = new THREE.BoxGeometry(...objective.dimensions);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(...objective.dimensions);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(...objective.dimensions);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(...objective.dimensions);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(...objective.dimensions);
        break;
    }
    
    const material = new THREE.MeshPhongMaterial({
      color: objective.itemColor,
      emissive: objective.emissiveColor,
      emissiveIntensity: 0.5
    });
    
    for (let i = 0; i < objective.itemCount; i++) {
      const item = new THREE.Mesh(geometry, material);
      
      // Find valid position within maze
      let validPosition = false;
      let attempts = 0;
      let maxAttempts = 100;
      
      while (!validPosition && attempts < maxAttempts) {
        const x = (Math.random() - 0.5) * (MAZE_SIZE * CELL_SIZE - 4);
        const z = (Math.random() - 0.5) * (MAZE_SIZE * CELL_SIZE - 4);
        item.position.set(x, 1, z);
        
        // Check if position collides with walls
        validPosition = !checkWallCollision(item.position);
        attempts++;
      }
      
      if (!validPosition) {
        console.warn('Could not find valid position for item');
        continue;
      }
      
      // Add floating animation
      const startY = item.position.y;
      const rotSpeed = Math.random() * 0.02 + 0.01;
      const floatSpeed = Math.random() * 0.002 + 0.001;
      const floatHeight = Math.random() * 0.3 + 0.2;
      
      item.userData.animate = () => {
        item.rotation.y += rotSpeed;
        item.position.y = startY + Math.sin(Date.now() * floatSpeed) * floatHeight;
      };
      
      item.objectiveId = objective.id;
      gameItems.push(item);
      scene.add(item);
    }
  });
}

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.05);
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = 2;
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('game-container').appendChild(renderer.domElement);
  
  // Enhanced lighting with dimmer ambient
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3); 
  scene.add(ambientLight);
  
  const moonLight = new THREE.DirectionalLight(0x6666ff, 0.3); 
  moonLight.position.set(50, 50, 50);
  moonLight.castShadow = true;
  scene.add(moonLight);
  
  // Flashlight setup
  flashlight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI/4, 0.5, 1);
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, 0, -1);
  flashlight.castShadow = true;
  camera.add(flashlight);
  camera.add(flashlight.target);
  flashlight.visible = false;
  scene.add(camera);

  // Controls
  controls = new PointerLockControls(camera, renderer.domElement);
  
  renderer.domElement.addEventListener('click', () => {
    if (!gameOver && !won) controls.lock();
  });
  
  // Select random objectives
  selectRandomObjectives();
  
  // Generate maze
  generateMaze();
  
  // Create game objects
  monster = createMonster(selectedMonster);
  
  // Create game items
  createGameItems();
  
  // Update objectives UI
  updateObjectivesUI();
  
  // Event listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onWindowResize);
  
  // Add music controls
  document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM') {
      if (backgroundMusic.paused) {
        backgroundMusic.play();
      } else {
        backgroundMusic.pause();
      }
    }
  });
  
  backgroundMusic = document.getElementById('background-music');
}

function updateObjectivesUI() {
  const objectivesList = document.getElementById('objectives-list');
  objectivesList.innerHTML = ''; // Clear existing objectives
  
  // Add random objectives
  currentObjectives.forEach(objective => {
    const div = document.createElement('div');
    div.className = 'objective';
    div.id = `obj-${objective.id}`;
    const isComplete = itemsCollected[objective.id] >= objective.itemCount;
    if (isComplete) {
      div.className += ' completed';
    }
    div.innerHTML = `
      <span class="checkbox${isComplete ? ' checked' : ''}">
        ${isComplete ? '✓' : ''}
      </span>
      <span>${objective.name} (${itemsCollected[objective.id]}/${objective.itemCount})</span>
    `;
    objectivesList.appendChild(div);
  });
  
  // Add exit objective (always last)
  const exitDiv = document.createElement('div');
  exitDiv.className = 'objective';
  exitDiv.id = 'obj-reach-exit';
  if (exit) {
    exitDiv.className += ' available';
  }
  const exitComplete = won;
  if (exitComplete) {
    exitDiv.className += ' completed';
  }
  exitDiv.innerHTML = `
    <span class="checkbox${exitComplete ? ' checked' : ''}">
      ${exitComplete ? '✓' : ''}
    </span>
    <span>Reach the exit door${!exit ? ' (Complete objectives first)' : ''}</span>
  `;
  objectivesList.appendChild(exitDiv);
}

function generateMaze() {
  maze = new THREE.Group();
  mazeWalls = []; 
  
  // Grass textured floor
  const textureLoader = new THREE.TextureLoader();
  const grassTexture = new THREE.DataTexture(generateGrassTexture(), 256, 256);
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(MAZE_SIZE * 2, MAZE_SIZE * 2);
  grassTexture.needsUpdate = true;
  
  const floorGeometry = new THREE.PlaneGeometry(MAZE_SIZE * CELL_SIZE, MAZE_SIZE * CELL_SIZE);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1; // Slightly lower the ground
  maze.add(floor);

  // Create a grid for maze generation
  const grid = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(0));
  
  // Generate maze layout using a simple algorithm
  for (let i = 0; i < MAZE_SIZE; i++) {
    for (let j = 0; j < MAZE_SIZE; j++) {
      if (i === 0 || j === 0 || i === MAZE_SIZE-1 || j === MAZE_SIZE-1) {
        grid[i][j] = 1; // Border walls
      } else if (Math.random() < 0.3) {
        grid[i][j] = 1; // Random walls
      }
    }
  }

  // Create better connected walls
  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    roughness: 0.7,
    metalness: 0.3
  });

  // Function to add wall segments
  const addWallSegment = (x, z, rotated = false) => {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(
      (x - MAZE_SIZE/2) * CELL_SIZE,
      WALL_HEIGHT/2,
      (z - MAZE_SIZE/2) * CELL_SIZE
    );
    if (rotated) {
      wall.rotation.y = Math.PI / 2;
    }
    wall.castShadow = true;
    wall.receiveShadow = true;
    maze.add(wall);
    mazeWalls.push(wall);
  };

  // Create walls with better connections
  for (let i = 0; i < MAZE_SIZE; i++) {
    for (let j = 0; j < MAZE_SIZE; j++) {
      if (grid[i][j] === 1) {
        // Add wall posts at corners
        if (i > 0 && j > 0 && grid[i-1][j] === 1 && grid[i][j-1] === 1) {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE/2, WALL_HEIGHT, CELL_SIZE/2),
            wallMaterial
          );
          post.position.set(
            (i - MAZE_SIZE/2) * CELL_SIZE - CELL_SIZE/4,
            WALL_HEIGHT/2,
            (j - MAZE_SIZE/2) * CELL_SIZE - CELL_SIZE/4
          );
          maze.add(post);
          mazeWalls.push(post);
        }

        // Add horizontal wall segment
        if (i < MAZE_SIZE-1 && grid[i+1][j] === 1) {
          addWallSegment(i, j);
        }
        // Add vertical wall segment
        if (j < MAZE_SIZE-1 && grid[i][j+1] === 1) {
          addWallSegment(i, j, true);
        }
      }
    }
  }

  scene.add(maze);
}

// Helper function to generate a simple grass texture
function generateGrassTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 3);
  
  for(let i = 0; i < size * size; i++) {
    const stride = i * 3;
    const shade = Math.random() * 25 + 30; // Varying shades of dark green
    data[stride] = shade; // R
    data[stride + 1] = shade + 50 + Math.random() * 20; // G
    data[stride + 2] = shade; // B
  }
  
  return data;
}

// Wall collision detection
function checkWallCollision(position) {
  const playerBoundingBox = new THREE.Box3().setFromCenterAndSize(
    position,
    new THREE.Vector3(PLAYER_RADIUS * 2, PLAYER_HEIGHT, PLAYER_RADIUS * 2)
  );

  for (const wall of mazeWalls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (playerBoundingBox.intersectsBox(wallBox)) {
      return true;
    }
  }
  return false;
}

function tryMove(moveVector) {
  const newPosition = camera.position.clone().add(moveVector);
  
  // Keep player at constant height
  newPosition.y = PLAYER_HEIGHT;
  
  // Check for wall collisions
  if (!checkWallCollision(newPosition)) {
    camera.position.copy(newPosition);
  }
}

function createMonster(monsterType) {
  const monsterGroup = new THREE.Group();
  
  // Scale the monster based on type
  monsterGroup.scale.setScalar(monsterType.scale);
  monsterSpeed = monsterType.speed;

  // Create monster based on its model parts
  monsterType.modelParts.forEach(part => {
    switch(part.type) {
      case 'core':
        const geometry = getGeometryByType(part.geometry);
        const core = new THREE.Mesh(
          geometry,
          new THREE.MeshPhongMaterial({
            color: monsterType.color,
            emissive: monsterType.emissive,
            shininess: 0,
            flatShading: true
          })
        );
        core.scale.set(...part.scale);
        monsterGroup.add(core);
        break;

      case 'spikes':
        for(let i = 0; i < part.count; i++) {
          const spike = createSpike(part.length, monsterType.color);
          spike.rotation.y = (i / part.count) * Math.PI * 2;
          monsterGroup.add(spike);
        }
        break;

      case 'tentacles':
        for(let i = 0; i < part.count; i++) {
          const tentacle = createTentacle(part.length, monsterType.color);
          tentacle.rotation.y = (i / part.count) * Math.PI * 2;
          monsterGroup.add(tentacle);
        }
        break;

      case 'flames':
        monsterGroup.add(createFlameEffect(part.count, part.height));
        break;

      case 'antenna':
        for(let i = 0; i < part.count; i++) {
          const antenna = createAntenna(part.height, monsterType.color);
          antenna.rotation.y = (i / part.count) * Math.PI * 2;
          monsterGroup.add(antenna);
        }
        break;
    }
  });

  // Add robot hands with claws
  addRobotHands(monsterGroup, monsterType.color);

  // Add fire trail
  addFireTrail(monsterGroup);

  // Add ability functionality
  monsterGroup.userData.ability = {
    name: monsterType.ability,
    duration: monsterType.abilityDuration,
    cooldown: monsterType.cooldown,
    active: false,
    use: () => useAbility(monsterGroup, monsterType)
  };

  monsterGroup.position.set(
    -MAZE_SIZE * CELL_SIZE/2 + 2,
    2,
    -MAZE_SIZE * CELL_SIZE/2 + 2
  );

  // Add the monster to the scene and assign it to the global monster variable
  scene.add(monsterGroup);
  monster = monsterGroup;
  return monsterGroup;
}

function getGeometryByType(type) {
  switch(type) {
    case 'sphere': return new THREE.SphereGeometry(1, 16, 16);
    case 'box': return new THREE.BoxGeometry(1, 1, 1);
    case 'icosahedron': return new THREE.IcosahedronGeometry(1, 1);
    case 'octahedron': return new THREE.OctahedronGeometry(1);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(1);
    default: return new THREE.SphereGeometry(1, 16, 16);
  }
}

function useAbility(monster, monsterType) {
  if (!canUseAbility) return;

  canUseAbility = false;
  monster.userData.ability.active = true;
  
  // Show ability cooldown UI
  const cooldownUI = document.querySelector('.ability-cooldown');
  const timerDisplay = document.querySelector('.cooldown-timer');
  cooldownUI.style.display = 'block';
  
  // Handle specific ability effects
  switch(monsterType.id) {
    case 'shadow-stalker':
      monster.material.opacity = 0.2;
      monster.material.transparent = true;
      break;
    case 'flame-hunter':
      createFlameBarrier(monster);
      break;
    case 'cyber-sentinel':
      // Implement tactical scan visualization
      break;
    case 'bio-horror':
      monsterSpeed *= 1.5;
      break;
    case 'quantum-wraith':
      monster.userData.canPhase = true;
      break;
    case 'doom-mech':
      createSeismicWave(monster);
      break;
  }

  // Set ability duration
  setTimeout(() => {
    monster.userData.ability.active = false;
    resetAbilityEffects(monster, monsterType);
  }, monsterType.abilityDuration);

  // Handle cooldown
  let cooldownRemaining = monsterType.cooldown / 1000;
  cooldownTimer = setInterval(() => {
    cooldownRemaining--;
    timerDisplay.textContent = cooldownRemaining;
    if (cooldownRemaining <= 0) {
      clearInterval(cooldownTimer);
      canUseAbility = true;
      cooldownUI.style.display = 'none';
    }
  }, 1000);
}

function resetAbilityEffects(monster, monsterType) {
  switch(monsterType.id) {
    case 'shadow-stalker':
      monster.material.opacity = 1;
      monster.material.transparent = false;
      break;
    case 'bio-horror':
      monsterSpeed = monsterType.speed;
      break;
    case 'quantum-wraith':
      monster.userData.canPhase = false;
      break;
  }
}

// Add keyboard listener for ability activation
document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyQ' && monster && monster.userData.ability) {
    monster.userData.ability.use();
  }
});

function createSpike(length, color) {
  const geometry = new THREE.ConeGeometry(0.1, length, 4);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    flatShading: true
  });
  const spike = new THREE.Mesh(geometry, material);
  spike.position.y = length / 2;
  return spike;
}

function createTentacle(length, color) {
  const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 16);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    flatShading: true
  });
  const tentacle = new THREE.Mesh(geometry, material);
  tentacle.position.y = length / 2;
  return tentacle;
}

function createFlameEffect(count, height) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(0xff4400),
        emissive: new THREE.Color(0xff2200),
        transparent: true,
        opacity: 0.8
      })
    );
    flame.position.y = Math.random() * height;
    group.add(flame);
  }
  return group;
}

function createAntenna(height, color) {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, height, 16);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    flatShading: true
  });
  const antenna = new THREE.Mesh(geometry, material);
  antenna.position.y = height / 2;
  return antenna;
}

function addRobotHands(monster, color) {
  const handGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.3);
  const handMaterial = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    metalness: 0.8,
    roughness: 0.2
  });

  // Create claws for each hand
  function createClaw() {
    const clawGroup = new THREE.Group();
    const clawGeometry = new THREE.ConeGeometry(0.1, 0.4, 4);
    const clawMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      emissive: 0x222222,
      metalness: 1,
      roughness: 0.2
    });

    const positions = [
      { x: 0.1, y: 0.2, z: 0, rx: 0, ry: 0, rz: -0.3 },
      { x: -0.1, y: 0.2, z: 0, rx: 0, ry: 0, rz: 0.3 },
      { x: 0, y: 0.2, z: 0.1, rx: -0.3, ry: 0, rz: 0 }
    ];

    positions.forEach(pos => {
      const claw = new THREE.Mesh(clawGeometry, clawMaterial);
      claw.position.set(pos.x, pos.y, pos.z);
      claw.rotation.set(pos.rx, pos.ry, pos.rz);
      clawGroup.add(claw);
    });

    return clawGroup;
  }

  // Left hand
  const leftHand = new THREE.Mesh(handGeometry, handMaterial);
  leftHand.position.set(-2, 0, 0);
  const leftClaws = createClaw();
  leftHand.add(leftClaws);
  monster.add(leftHand);

  // Right hand
  const rightHand = new THREE.Mesh(handGeometry, handMaterial);
  rightHand.position.set(2, 0, 0);
  const rightClaws = createClaw();
  rightHand.add(rightClaws);
  monster.add(rightHand);
}

function addFireTrail(monster) {
  const fireTrail = new THREE.Group();
  const particleCount = 50;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color(0xff4400),
        emissive: new THREE.Color(0xff2200),
        transparent: true,
        opacity: 0.8
      })
    );
    particles.push({
      mesh: particle,
      life: 0,
      speed: Math.random() * 0.05 + 0.02
    });
    fireTrail.add(particle);
  }

  monster.userData.particles = particles;
  monster.add(fireTrail);

  // Update fire trail in animation
  const updateFireTrail = () => {
    particles.forEach(particle => {
      if (particle.life <= 0) {
        // Reset particle
        particle.mesh.position.copy(monster.position);
        particle.mesh.position.y = 0.5;
        particle.life = 1;
      }

      // Update particle
      particle.life -= particle.speed;
      particle.mesh.position.y += particle.speed;
      particle.mesh.material.opacity = particle.life;
      particle.mesh.scale.multiplyScalar(0.95);
    });
  };

  // Add fire trail update to animation
  const existingAnimate = monster.userData.animate || (() => {});
  monster.userData.animate = () => {
    existingAnimate();
    updateFireTrail();
    
    // Animate hands
    const time = Date.now() * 0.001;
    const leftHand = monster.children[0];
    const rightHand = monster.children[1];
    leftHand.position.y = Math.sin(time * 2) * 0.3 + 1;
    rightHand.position.y = Math.sin(time * 2 + Math.PI) * 0.3 + 1;
  };

  // Start animation
  monster.userData.animate();
}

function createExit() {
  // Only create exit if all objectives are complete
  if (!areObjectivesComplete()) return;
  
  if (!exit) {
    const exitGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const exitMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x006600,
      emissiveIntensity: 2
    });
    exit = new THREE.Mesh(exitGeometry, exitMaterial);
    
    // Find a random valid position in the maze
    let validPosition = false;
    while (!validPosition) {
      const x = (Math.random() - 0.5) * (MAZE_SIZE * CELL_SIZE - 4);
      const z = (Math.random() - 0.5) * (MAZE_SIZE * CELL_SIZE - 4);
      exit.position.set(x, 1.5, z);
      
      // Check if position collides with walls
      validPosition = !checkWallCollision(exit.position);
    }
    
    // Add glowing particles around exit
    const particleCount = 20;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshPhongMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          transparent: true,
          opacity: 0.7
        })
      );
      
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5;
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(i / particleCount * Math.PI * 2) * 0.5 + 1.5,
        Math.sin(angle) * radius
      );
      
      particles.add(particle);
      
      // Animate particles
      const animate = () => {
        particle.position.y += Math.sin(Date.now() * 0.002 + i) * 0.01;
        particle.material.opacity = 0.5 + Math.sin(Date.now() * 0.001 + i) * 0.3;
        requestAnimationFrame(animate);
      };
      animate();
    }
    
    exit.add(particles);
    scene.add(exit);
    
    // Play spawn sound effect
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('path/to/spawn-sound.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setVolume(0.5);
      sound.play();
    });
  }
}

function updateMonster() {
  if (!monster) return; // Add safety check
  
  const direction = new THREE.Vector3();
  direction.subVectors(camera.position, monster.position);
  direction.normalize();
  
  monster.position.x += direction.x * monsterSpeed;
  monster.position.z += direction.z * monsterSpeed;
  
  // Make monster always face the player
  monster.lookAt(camera.position);
  
  if (monster.position.distanceTo(camera.position) < 1.5) {
    gameEnd(false);
  }
}

function onKeyDown(event) {
  if (gameOver || won) return;
  
  switch (event.code) {
    case 'KeyE':
      flashlightOn = !flashlightOn;
      flashlight.visible = flashlightOn;
      break;
    case 'ArrowUp':
    case 'KeyW':
      playerVelocity.z = -moveSpeed;
      break;
    case 'ArrowDown':
    case 'KeyS':
      playerVelocity.z = moveSpeed;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      playerVelocity.x = -moveSpeed;
      break;
    case 'ArrowRight':
    case 'KeyD':
      playerVelocity.x = moveSpeed;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
    case 'ArrowDown':
    case 'KeyS':
      playerVelocity.z = 0;
      break;
    case 'ArrowLeft':
    case 'KeyA':
    case 'ArrowRight':
    case 'KeyD':
      playerVelocity.x = 0;
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function checkCollisions() {
  // Check item collection
  gameItems = gameItems.filter(item => {
    if (camera.position.distanceTo(item.position) < 1.5) {
      scene.remove(item);
      itemsCollected[item.objectiveId]++;
      updateObjectivesUI();
      
      // Check if we should spawn exit after collecting item
      if (areObjectivesComplete() && !exit) {
        createExit();
      }
      return false;
    }
    return true;
  });
}

function areObjectivesComplete() {
  return currentObjectives.every(obj => 
    itemsCollected[obj.id] >= obj.itemCount
  );
}

function updateExitDistance() {
  if (exit) {
    const distance = Math.round(camera.position.distanceTo(exit.position));
    document.getElementById('exit-distance').textContent = distance;
    
    if (distance < 2 && areObjectivesComplete()) {
      gameEnd(true);
    }
  }
}

function gameEnd(isWin) {
  gameOver = !isWin;
  won = isWin;
  controls.unlock();
  
  if (isWin) {
    document.getElementById('win-screen').style.display = 'block';
  } else {
    document.getElementById('game-over').style.display = 'block';
  }
  
  // Fade out music
  const fadeOut = setInterval(() => {
    if (backgroundMusic.volume > 0.1) {
      backgroundMusic.volume -= 0.1;
    } else {
      backgroundMusic.pause();
      backgroundMusic.volume = 1.0;
      clearInterval(fadeOut);
    }
  }, 100);
}

function animate() {
  requestAnimationFrame(animate);
  
  if (!gameOver && !won && controls.isLocked) {
    const moveQuaternion = camera.quaternion.clone();
    const moveVector = new THREE.Vector3(playerVelocity.x, 0, playerVelocity.z);
    moveVector.applyQuaternion(moveQuaternion);
    
    // Try to move with collision detection
    tryMove(moveVector);
    
    if (monster) { // Add safety check
      updateMonster();
      if (monster.userData.animate) {
        monster.userData.animate();
      }
    }
    
    checkCollisions();
    updateObjectivesUI();
    updateExitDistance();
    
    // Animate items
    gameItems.forEach(item => {
      if (item.userData.animate) {
        item.userData.animate();
      }
    });
  }
  
  renderer.render(scene, camera);
}