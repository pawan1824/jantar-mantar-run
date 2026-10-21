import { Character, Obstacle, PowerUp, Particle, FloatingText } from '../types';
import { sounds } from '../audio';

export interface GameCallbacks {
  onHealthChange: (hp: number) => void;
  onDistanceChange: (dist: number, totalDist: number) => void;
  onScoreChange: (score: number) => void;
  onTimeChange: (time: number) => void;
  onVanCountChange: (count: number) => void;
  onDetained: () => void;
  onGameOver: (reason: string) => void;
  onVictory: (stats: { time: number; score: number; vans: number; barricadesCleared: number }) => void;
}

export class ProtestGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private character: Character;
  private callbacks: GameCallbacks;

  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Game state
  public totalDistance: number = 1200; // Jantar Mantar to Parliament in meters
  public currentDistance: number = 0;
  public health: number = 100;
  public score: number = 0;
  public elapsedTime: number = 0;
  public vanCount: number = 0;
  public barricadesCleared: number = 0;

  // Player physics
  private playerX: number = 140;
  private playerY: number = 0; // calculated based on ground
  private playerVy: number = 0;
  private isGrounded: boolean = true;
  private isDucking: boolean = false;
  private jumpCount: number = 0;
  private runFrame: number = 0;
  private runFrameTimer: number = 0;
  private invulnerableTimer: number = 0;
  private powerShieldTimer: number = 0;
  private speedBoostTimer: number = 0;
  public shoutEnergy: number = 100;

  // Ground level
  private groundY: number = 0;

  // Inputs
  private keysHeld = {
    left: false,
    right: false,
    up: false,
    down: false,
    shout: false,
  };

  // World objects
  private obstacles: Obstacle[] = [];
  private powerups: PowerUp[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Pacing & Spawning
  private worldSpeed: number = 380; // pixels per second
  private nextObstacleSpawnDist: number = 80;
  private nextPowerupSpawnDist: number = 150;
  private screenShake: number = 0;
  private hitstopTimer: number = 0;

  // Background crowds
  private crowdPeople: Array<{ x: number; height: number; shirtColor: string; skinColor: string; placard?: string; armPhase: number; bounceOffset: number }> = [];

  constructor(canvas: HTMLCanvasElement, character: Character, callbacks: GameCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.character = character;
    this.callbacks = callbacks;

    this.resize();
    this.initCrowd();
  }

  public setCharacter(char: Character) {
    this.character = char;
  }

  public resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    // Ground is at 78% of viewport height
    this.groundY = rect.height * 0.76;
    if (this.isGrounded) {
      this.playerY = this.groundY;
    }
  }

  private initCrowd() {
    const slogans = [
      'AZAADI',
      'EDUCATION NOT HATE',
      'DEMOCRACY',
      'SAMVIDHAN ZINDABAD',
      'ROZGAR DO',
      'PEOPLE POWER',
      'JUSTICE',
      'NO SILENCE',
      'OUR RIGHTS',
      'SAVE DEMOCRACY',
    ];
    const shirtColors = ['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308', '#ef4444', '#14b8a6', '#f43f5e', '#6366f1'];
    const skinColors = ['#e0ac69', '#c68642', '#8d5524', '#f1c27d', '#ffdbac'];

    this.crowdPeople = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      this.crowdPeople.push({
        x: i * 45 + Math.random() * 20,
        height: 60 + Math.random() * 20,
        shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
        skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
        placard: Math.random() > 0.4 ? slogans[Math.floor(Math.random() * slogans.length)] : undefined,
        armPhase: Math.random() * Math.PI * 2,
        bounceOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    sounds.startBeat();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sounds.stopBeat();
  }

  public resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      sounds.startBeat();
      this.loop(this.lastTime);
    }
  }

  public destroy() {
    this.pause();
  }

  // Key / Input bindings
  public handleKeyDown(code: string) {
    if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') {
      if (!this.keysHeld.up) {
        this.triggerJump();
      }
      this.keysHeld.up = true;
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.keysHeld.down = true;
      this.isDucking = true;
    }
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.keysHeld.left = true;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      this.keysHeld.right = true;
    }
    if (code === 'KeyX' || code === 'KeyE') {
      this.triggerShout();
    }
  }

  public handleKeyUp(code: string) {
    if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') {
      this.keysHeld.up = false;
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.keysHeld.down = false;
      this.isDucking = false;
    }
    if (code === 'ArrowLeft' || code === 'KeyA') {
      this.keysHeld.left = false;
    }
    if (code === 'ArrowRight' || code === 'KeyD') {
      this.keysHeld.right = false;
    }
  }

  public setJoystick(x: number, y: number) {
    // x: -1 to 1, y: -1 to 1
    this.keysHeld.left = x < -0.3;
    this.keysHeld.right = x > 0.3;
    this.keysHeld.down = y > 0.4;
    this.isDucking = y > 0.4;

    if (y < -0.5 && !this.keysHeld.up) {
      this.triggerJump();
      this.keysHeld.up = true;
    } else if (y >= -0.3) {
      this.keysHeld.up = false;
    }
  }

  public triggerJump() {
    const jumpStrength = 740 * this.character.jumpMultiplier;
    if (this.isGrounded) {
      this.playerVy = -jumpStrength;
      this.isGrounded = false;
      this.jumpCount = 1;
      sounds.playJump();
      this.spawnDust(this.playerX + 20, this.groundY, 8);
    } else if (this.character.canDoubleJump && this.jumpCount === 1) {
      this.playerVy = -jumpStrength * 0.9;
      this.jumpCount = 2;
      sounds.playDoubleJump();
      this.addFloatingText(this.playerX, this.playerY - 40, 'DOUBLE JUMP!', '#facc15');
      this.spawnDust(this.playerX + 20, this.playerY, 12, '#ffd23f');
    }
  }

  public triggerShout() {
    if (this.shoutEnergy < 50) return;
    this.shoutEnergy = Math.max(0, this.shoutEnergy - 50);
    sounds.playSloganBlast();
    this.screenShake = 14;

    const sloganText = this.character.slogan || 'AZAADI!';
    this.addFloatingText(this.playerX + 30, this.playerY - 80, sloganText, '#f43f5e', 2.0);

    // Shockwave particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.random() - 0.5) * 1.2;
      const speed = 400 + Math.random() * 500;
      this.particles.push({
        x: this.playerX + 40,
        y: this.playerY - 45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.4,
        color: ['#f43f5e', '#fbbf24', '#ffffff', '#38bdf8'][Math.floor(Math.random() * 4)],
        size: 5 + Math.random() * 6,
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        shape: 'circle',
      });
    }

    // Blast away police and obstacles in front!
    this.obstacles.forEach((obs) => {
      if (obs.x > this.playerX && obs.x < this.playerX + 600) {
        if (obs.type === 'police_lathi') {
          obs.hit = true;
          obs.speedX = 650;
          this.score += 100;
          this.addFloatingText(obs.x, obs.y - 20, 'DISPERSED! +100', '#4ade80');
        } else if (obs.type === 'barricade') {
          obs.cleared = true;
          this.score += 50;
          this.spawnSparks(obs.x + 30, obs.y + 20, '#ffd23f');
        }
      }
    });
  }

  public handleReleaseFromVan() {
    // Resume with brief invulnerability after detainment
    this.invulnerableTimer = 3.0;
    this.playerX = 140;
    this.playerY = this.groundY;
    this.isGrounded = true;
    this.isDucking = false;
    this.playerVy = 0;
    this.addFloatingText(this.playerX, this.playerY - 60, 'RELEASED! RESIST!', '#38bdf8', 1.8);
    this.resume();
  }

  // Main game loop
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze effect
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.render();
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.elapsedTime += dt;
    this.callbacks.onTimeChange(this.elapsedTime);

    // Slogan energy regeneration
    if (this.shoutEnergy < 100) {
      this.shoutEnergy = Math.min(100, this.shoutEnergy + dt * 12);
    }

    // Timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.powerShieldTimer > 0) this.powerShieldTimer -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 25);

    // Speed calculation
    let currentSpeed = this.worldSpeed * this.character.speedMultiplier;
    if (this.speedBoostTimer > 0) currentSpeed *= 1.35;
    if (this.keysHeld.right) currentSpeed *= 1.25;
    if (this.keysHeld.left) currentSpeed *= 0.65;

    // Advance distance
    const distDelta = (currentSpeed * dt) / 22; // roughly ~1200m in ~60-70 seconds
    this.currentDistance = Math.min(this.totalDistance, this.currentDistance + distDelta);
    this.callbacks.onDistanceChange(this.currentDistance, this.totalDistance);

    // Score ticks up over distance
    this.score += Math.floor(distDelta * 2);
    this.callbacks.onScoreChange(this.score);

    // Check Victory (Reached Parliament!)
    if (this.currentDistance >= this.totalDistance) {
      this.pause();
      sounds.playVictory();
      this.callbacks.onVictory({
        time: this.elapsedTime,
        score: this.score,
        vans: this.vanCount,
        barricadesCleared: this.barricadesCleared,
      });
      return;
    }

    // Player horizontal nudge within bounds
    if (this.keysHeld.right && this.playerX < 340) {
      this.playerX += 160 * dt;
    } else if (this.keysHeld.left && this.playerX > 80) {
      this.playerX -= 180 * dt;
    }

    // Player vertical physics
    const gravity = 1800;
    if (!this.isGrounded) {
      this.playerVy += gravity * dt;
      this.playerY += this.playerVy * dt;

      // Check bus roof landing (parkour!)
      let onBusRoof = false;
      for (const obs of this.obstacles) {
        if (obs.type === 'police_bus' && !obs.hit) {
          const busTop = this.groundY - obs.height;
          const playerFeet = this.playerY;
          if (
            this.playerX + 35 > obs.x &&
            this.playerX < obs.x + obs.width - 10 &&
            playerFeet >= busTop - 10 &&
            playerFeet <= busTop + 25 &&
            this.playerVy >= 0
          ) {
            this.playerY = busTop;
            this.playerVy = 0;
            this.isGrounded = true;
            this.jumpCount = 0;
            onBusRoof = true;
            break;
          }
        }
      }

      if (!onBusRoof && this.playerY >= this.groundY) {
        this.playerY = this.groundY;
        this.playerVy = 0;
        this.isGrounded = true;
        this.jumpCount = 0;
        this.spawnDust(this.playerX + 20, this.groundY, 4);
      }
    }

    // Animation frame
    this.runFrameTimer += dt * (currentSpeed / 120);
    if (this.runFrameTimer >= 1) {
      this.runFrame = (this.runFrame + 1) % 6;
      this.runFrameTimer = 0;
    }

    // Update Crowd parallax
    this.crowdPeople.forEach((p) => {
      p.armPhase += dt * 5;
      p.x -= currentSpeed * 0.45 * dt;
      if (p.x < -60) {
        p.x = this.canvas.width / (window.devicePixelRatio || 1) + 40 + Math.random() * 40;
      }
    });

    // Spawn Obstacles
    this.nextObstacleSpawnDist -= distDelta;
    if (this.nextObstacleSpawnDist <= 0) {
      this.spawnObstacle();
      // Increase challenge as player gets closer to Parliament!
      const progressRatio = this.currentDistance / this.totalDistance;
      const minGap = Math.max(16, 32 - progressRatio * 18);
      const maxGap = Math.max(26, 52 - progressRatio * 24);
      this.nextObstacleSpawnDist = minGap + Math.random() * (maxGap - minGap);
    }

    // Spawn Powerups
    this.nextPowerupSpawnDist -= distDelta;
    if (this.nextPowerupSpawnDist <= 0) {
      this.spawnPowerup();
      this.nextPowerupSpawnDist = 45 + Math.random() * 45;
    }

    // Update Obstacles & Check Collisions
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const obsSpeed = (obs.speedX || 0) + currentSpeed;
      obs.x -= obsSpeed * dt;

      // Police officers movement
      if (obs.type === 'police_lathi') {
        obs.actionPhase = (obs.actionPhase || 0) + dt * 6;
        obs.x -= 40 * dt; // walks towards player
      }

      // Check collision
      if (!obs.hit && !obs.cleared) {
        this.checkObstacleCollision(obs);
      }

      // Despawn
      if (obs.x < -200 || obs.x > width + 400) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.x -= currentSpeed * dt;
      p.bobOffset = (p.bobOffset || 0) + dt * 4;

      if (!p.collected) {
        const pBox = {
          x: p.x,
          y: p.y + Math.sin(p.bobOffset) * 8,
          w: p.width,
          h: p.height,
        };
        const playerBox = this.getPlayerBox();
        if (this.rectsIntersect(playerBox, pBox)) {
          this.collectPowerup(p);
          this.powerups.splice(i, 1);
          continue;
        }
      }

      if (p.x < -100) {
        this.powerups.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 450 * dt; // gravity
      pt.alpha = 1 - pt.life / pt.maxLife;

      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      ft.y -= 50 * dt;
      ft.alpha = 1 - ft.life / 1.1;
      if (ft.life >= 1.1) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private spawnObstacle() {
    const width = this.canvas.getBoundingClientRect().width;
    const progress = this.currentDistance / this.totalDistance;

    // Pick obstacle type based on game progress
    let type: Obstacle['type'] = 'barricade';
    const rand = Math.random();

    if (progress < 0.25) {
      // Early run: mostly yellow police barricades + occasional cop
      type = rand < 0.7 ? 'barricade' : 'police_lathi';
    } else if (progress < 0.6) {
      // Mid run: barricades, lathi squads, blue police buses
      if (rand < 0.45) type = 'barricade';
      else if (rand < 0.75) type = 'police_lathi';
      else type = 'police_bus';
    } else {
      // Heavy resistance near Parliament: buses, water cannons, lathi charge
      if (rand < 0.3) type = 'barricade';
      else if (rand < 0.6) type = 'police_lathi';
      else if (rand < 0.85) type = 'police_bus';
      else type = 'water_cannon';
    }

    let obsWidth = 55;
    let obsHeight = 60;
    let obsY = this.groundY - obsHeight;

    if (type === 'barricade') {
      obsWidth = 65;
      obsHeight = 55;
      obsY = this.groundY - obsHeight;
    } else if (type === 'police_lathi') {
      obsWidth = 45;
      obsHeight = 75;
      obsY = this.groundY - obsHeight;
    } else if (type === 'police_bus') {
      obsWidth = 175;
      obsHeight = 105;
      obsY = this.groundY - obsHeight;
    } else if (type === 'water_cannon') {
      obsWidth = 75;
      obsHeight = 65;
      obsY = this.groundY - obsHeight;
    }

    this.obstacles.push({
      id: Date.now() + Math.random(),
      x: width + 50,
      y: obsY,
      width: obsWidth,
      height: obsHeight,
      type,
      cleared: false,
      hit: false,
      actionPhase: 0,
    });
  }

  private spawnPowerup() {
    const width = this.canvas.getBoundingClientRect().width;
    const types: PowerUp['type'][] = ['chai', 'chai', 'samosa', 'megaphone', 'constitution'];
    const type = types[Math.floor(Math.random() * types.length)];
    // Can float at ground or jump height
    const isHigh = Math.random() > 0.45;
    const y = isHigh ? this.groundY - 110 : this.groundY - 45;

    this.powerups.push({
      id: Date.now() + Math.random(),
      x: width + 50,
      y,
      width: 32,
      height: 32,
      type,
      collected: false,
      bobOffset: Math.random() * Math.PI,
    });
  }

  private getPlayerBox() {
    const pHeight = this.isDucking ? 38 : 68;
    const pWidth = this.character.isWheelchair ? 52 : 38;
    return {
      x: this.playerX,
      y: this.playerY - pHeight,
      w: pWidth,
      h: pHeight,
    };
  }

  private rectsIntersect(
    r1: { x: number; y: number; w: number; h: number },
    r2: { x: number; y: number; w: number; h: number }
  ) {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  private checkObstacleCollision(obs: Obstacle) {
    const pBox = this.getPlayerBox();
    const oBox = { x: obs.x, y: obs.y, w: obs.width, h: obs.height };

    // Check clean leap over barricade or cop
    if (
      !obs.cleared &&
      this.playerX > obs.x + obs.width &&
      this.playerY < this.groundY - 10
    ) {
      obs.cleared = true;
      this.barricadesCleared++;
      this.score += 50;
      this.callbacks.onScoreChange(this.score);
      sounds.playClearBarricade();
      this.addFloatingText(this.playerX, this.playerY - 40, 'CLEAR! +50', '#ffd23f');
      return;
    }

    if (!this.rectsIntersect(pBox, oBox)) return;

    // If Constitution shield is active, smash through!
    if (this.powerShieldTimer > 0) {
      obs.hit = true;
      obs.speedX = 700;
      this.score += 150;
      this.callbacks.onScoreChange(this.score);
      sounds.playClearBarricade();
      this.screenShake = 8;
      this.addFloatingText(obs.x, obs.y - 30, 'CONSTITUTION SMASH! +150', '#f59e0b', 1.4);
      this.spawnSparks(obs.x + 25, obs.y + 25, '#fbbf24');
      return;
    }

    // Wheelchair turbo can ram through standard barricades!
    if (this.character.isWheelchair && obs.type === 'barricade' && this.keysHeld.right) {
      obs.hit = true;
      obs.speedX = 500;
      this.score += 75;
      this.callbacks.onScoreChange(this.score);
      sounds.playClearBarricade();
      this.addFloatingText(obs.x, obs.y - 20, 'TURBO RAM! +75', '#fb7185');
      this.spawnSparks(obs.x + 20, obs.y + 20, '#fb7185');
      return;
    }

    // Invulnerability check (after detainment or hit)
    if (this.invulnerableTimer > 0) return;

    // Handle collision types
    if (obs.type === 'police_bus') {
      // Detainment by the Delhi Police Blue Bus!
      obs.hit = true;
      this.vanCount++;
      this.callbacks.onVanCountChange(this.vanCount);
      sounds.playSiren();
      this.hitstopTimer = 0.1;
      this.screenShake = 16;
      this.pause();
      this.callbacks.onDetained();
      return;
    }

    if (obs.type === 'police_lathi') {
      obs.hit = true;
      sounds.playLathiHit();
      sounds.playPoliceWhistle();
      this.screenShake = 15;
      this.hitstopTimer = 0.08;
      this.invulnerableTimer = 1.6;

      // 50% damage reduced by character armor multiplier
      const damage = Math.round(50 * this.character.armorMultiplier);
      this.health = Math.max(0, this.health - damage);
      this.callbacks.onHealthChange(this.health);
      this.addFloatingText(this.playerX, this.playerY - 50, `WHACK! −${damage}% जान`, '#ef4444', 1.6);
      this.spawnSparks(this.playerX + 20, this.playerY - 30, '#ef4444');

      if (this.health <= 0) {
        this.pause();
        sounds.playGameOver();
        this.callbacks.onGameOver('Lathi charge drained all your energy! Stand strong, the fight goes on.');
      }
      return;
    }

    if (obs.type === 'barricade') {
      obs.hit = true;
      sounds.playLathiHit();
      this.screenShake = 8;
      this.invulnerableTimer = 1.0;
      const damage = Math.round(15 * this.character.armorMultiplier);
      this.health = Math.max(0, this.health - damage);
      this.callbacks.onHealthChange(this.health);
      this.addFloatingText(this.playerX, this.playerY - 40, `TRIPPED! −${damage}% जान`, '#f59e0b');
      this.spawnSparks(obs.x + 20, obs.y + 20, '#ffd23f');

      if (this.health <= 0) {
        this.pause();
        sounds.playGameOver();
        this.callbacks.onGameOver('Barricades halted the sprint. Regroup and march again!');
      }
      return;
    }

    if (obs.type === 'water_cannon') {
      obs.hit = true;
      this.screenShake = 10;
      this.invulnerableTimer = 1.2;
      const damage = 20;
      this.health = Math.max(0, this.health - damage);
      this.callbacks.onHealthChange(this.health);
      this.addFloatingText(this.playerX, this.playerY - 40, `WATER CANNON! −${damage}% जान`, '#38bdf8');
      this.spawnWaterDrops(this.playerX + 20, this.playerY - 20);

      if (this.health <= 0) {
        this.pause();
        sounds.playGameOver();
        this.callbacks.onGameOver('Water cannon knocked you back. Rise again for justice!');
      }
    }
  }

  private collectPowerup(p: PowerUp) {
    p.collected = true;
    sounds.playChaiChime();

    if (p.type === 'chai') {
      this.health = Math.min(100, this.health + 25);
      this.callbacks.onHealthChange(this.health);
      this.addFloatingText(this.playerX, this.playerY - 60, 'GARAM CHAI! +25% जान', '#10b981', 1.5);
      this.spawnSparks(this.playerX + 20, this.playerY - 40, '#34d399');
    } else if (p.type === 'constitution') {
      this.powerShieldTimer = 6.0;
      this.score += 200;
      this.callbacks.onScoreChange(this.score);
      this.addFloatingText(this.playerX, this.playerY - 70, 'SAMVIDHAN PROTECTION! (6s)', '#f59e0b', 1.8);
      this.spawnSparks(this.playerX + 20, this.playerY - 40, '#f59e0b');
    } else if (p.type === 'megaphone') {
      this.shoutEnergy = 100;
      this.score += 150;
      this.callbacks.onScoreChange(this.score);
      this.addFloatingText(this.playerX, this.playerY - 60, 'MEGAPHONE CHARGED! (X to Shout)', '#38bdf8', 1.5);
    } else if (p.type === 'samosa') {
      this.speedBoostTimer = 5.0;
      this.score += 100;
      this.callbacks.onScoreChange(this.score);
      this.addFloatingText(this.playerX, this.playerY - 60, 'SAMOSA SPRINT! +35% SPEED', '#eab308', 1.5);
    }
  }

  // FX helpers
  private addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      scale,
    });
  }

  private spawnDust(x: number, y: number, count: number, color: string = '#d1d5db') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - Math.random() * 6,
        vx: (Math.random() - 0.5) * 80 - 40,
        vy: -20 - Math.random() * 50,
        color,
        size: 3 + Math.random() * 4,
        alpha: 0.8,
        life: 0,
        maxLife: 0.45,
        shape: 'circle',
      });
    }
  }

  private spawnSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 0.4,
        shape: 'star',
      });
    }
  }

  private spawnWaterDrops(x: number, y: number) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#60a5fa',
        size: 4 + Math.random() * 4,
        alpha: 0.9,
        life: 0,
        maxLife: 0.5,
        shape: 'circle',
      });
    }
  }

  // Canvas Rendering
  private render() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const ctx = this.ctx;

    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Sky & Atmosphere
    this.renderSky(ctx, w, h);

    // 2. Distant Landmarks (Jantar Mantar -> Connaught Place -> Indian Parliament)
    this.renderLandmarks(ctx, w, h);

    // 3. Cheering Protest Crowd with Placards & Tricolors
    this.renderCrowd(ctx, w);

    // 4. Street, Curbs, Divider markings
    this.renderStreet(ctx, w, h);

    // 5. Obstacles (Barricades, Lathi Police, Police Buses)
    this.renderObstacles(ctx);

    // 6. Powerups
    this.renderPowerups(ctx);

    // 7. Player Character with Running Cycle & Slogan Banner
    this.renderPlayer(ctx);

    // 8. Particles (Dust, Sparks, Confetti, Shockwaves)
    this.renderParticles(ctx);

    // 9. Floating Comic Hit Text
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Delhi morning sky gradient: soft orange/rose horizon to crisp blue top
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#5383a8');
    skyGrad.addColorStop(0.5, '#85a8c2');
    skyGrad.addColorStop(0.85, '#eec09e');
    skyGrad.addColorStop(1, '#fde8cd');

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, this.groundY);

    // Sun / Warm Glow
    const sunGrad = ctx.createRadialGradient(w * 0.75, 90, 10, w * 0.75, 90, 80);
    sunGrad.addColorStop(0, 'rgba(255, 245, 220, 0.9)');
    sunGrad.addColorStop(0.5, 'rgba(254, 215, 170, 0.4)');
    sunGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.75, 90, 80, 0, Math.PI * 2);
    ctx.fill();

    // Pigeons flying in sky
    const birdTime = this.elapsedTime * 40;
    ctx.fillStyle = '#374151';
    for (let i = 0; i < 4; i++) {
      const bx = ((birdTime * 2 + i * 160) % (w + 200)) - 80;
      const by = 60 + Math.sin(this.elapsedTime * 2 + i) * 15 + i * 20;
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      const wingY = Math.sin(this.elapsedTime * 12 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by - wingY);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 6, by - wingY);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#374151';
      ctx.stroke();
    }
  }

  private renderLandmarks(ctx: CanvasRenderingContext2D, w: number, _h: number) {
    const progress = this.currentDistance / this.totalDistance;
    const baseGround = this.groundY - 30;

    // Silhouette Color - Terracotta red/ochre Delhi heritage tint
    ctx.fillStyle = '#b45339';
    ctx.strokeStyle = '#1e1b24';
    ctx.lineWidth = 2.5;

    // Section 1: Jantar Mantar (0m - 350m)
    // Iconic triangular Samrat Yantra sundial stairs & curved Ram Yantras
    const jmOffset = -progress * 600;
    if (jmOffset > -400 && jmOffset < w + 200) {
      ctx.save();
      ctx.translate(jmOffset + 40, baseGround);

      // Main giant triangular ramp
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(140, -110);
      ctx.lineTo(140, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Stair cutouts inside ramp
      ctx.fillStyle = '#8b3823';
      for (let s = 1; s < 7; s++) {
        ctx.fillRect(s * 18, -s * 14, 10, s * 14);
      }

      // Curved astronomical semicircle wall
      ctx.fillStyle = '#c65d3b';
      ctx.beginPath();
      ctx.arc(190, 0, 50, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Signboard: "JANTAR MANTAR (START)"
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(-20, -50, 95, 24);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-20, -50, 95, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Bangers, cursive';
      ctx.fillText('JANTAR MANTAR 🚩', -16, -34);

      ctx.restore();
    }

    // Section 2: Connaught Place colonnade pillars & India Gate distance arch (300m - 800m)
    const cpOffset = (w * 0.4) - (progress - 0.3) * 700;
    if (cpOffset > -300 && cpOffset < w + 200) {
      ctx.save();
      ctx.translate(cpOffset, baseGround);

      // White/cream heritage colonnade
      ctx.fillStyle = '#e2d9cc';
      ctx.fillRect(0, -70, 220, 70);
      ctx.strokeRect(0, -70, 220, 70);

      // Pillars
      ctx.fillStyle = '#d4c5b3';
      for (let p = 15; p < 210; p += 32) {
        ctx.fillRect(p, -70, 14, 70);
        ctx.strokeRect(p, -70, 14, 70);
      }
      ctx.fillStyle = '#bfa588';
      ctx.fillRect(-10, -78, 240, 12);
      ctx.strokeRect(-10, -78, 240, 12);

      // Sign: "SANSAD MARG / CONNAUGHT PLACE"
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(40, -100, 140, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Bangers, cursive';
      ctx.fillText('SANSAD MARG ➔', 50, -86);

      ctx.restore();
    }

    // Section 3: The Grand Indian Parliament (संसद भवन) (900m - 1200m)
    // Circular colonnade & National Flag flying high!
    const parlOffset = w - (1 - progress) * 900;
    if (parlOffset > -100) {
      ctx.save();
      ctx.translate(parlOffset, baseGround);

      // Circular colonnade base of Parliament
      ctx.fillStyle = '#c2410c'; // Red sandstone
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.lineTo(-40, -90);
      ctx.lineTo(260, -90);
      ctx.lineTo(260, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Parliament Central Dome
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(110, -90, 55, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Golden dome finial + Flagpole
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(110, -145);
      ctx.lineTo(110, -185);
      ctx.stroke();

      // Indian Tiranga Flag (waving)
      const flagWave = Math.sin(this.elapsedTime * 6) * 5;
      // Saffron
      ctx.fillStyle = '#ff9933';
      ctx.fillRect(112, -185, 34, 9);
      // White
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(112, -176, 34, 9);
      // Ashoka Chakra blue dot
      ctx.fillStyle = '#000088';
      ctx.beginPath();
      ctx.arc(129, -171.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Green
      ctx.fillStyle = '#128807';
      ctx.fillRect(112, -167, 34 + flagWave, 9);

      // Colonnade pillars of Parliament
      ctx.fillStyle = '#fed7aa';
      for (let col = -30; col < 250; col += 24) {
        ctx.fillRect(col, -90, 9, 90);
        ctx.strokeRect(col, -90, 9, 90);
      }

      // Golden signage: "PARLIAMENT HOUSE / संसद भवन"
      ctx.fillStyle = '#1e1b24';
      ctx.fillRect(30, -55, 160, 28);
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, -55, 160, 28);
      ctx.fillStyle = '#ffd23f';
      ctx.font = 'bold 13px Bangers, cursive';
      ctx.fillText('संसद भवन — PARLIAMENT 🏛️', 38, -36);

      ctx.restore();
    }
  }

  private renderCrowd(ctx: CanvasRenderingContext2D, _w: number) {
    const crowdBaseY = this.groundY - 14;

    // Crowd railing along Delhi sidewalk
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, crowdBaseY - 10);
    ctx.lineTo(this.canvas.width, crowdBaseY - 10);
    ctx.stroke();

    // Render protesters behind the railing
    this.crowdPeople.forEach((p) => {
      const bounce = Math.sin(this.elapsedTime * 8 + p.bounceOffset) * 4;
      const py = crowdBaseY + bounce;

      // Body / Torso
      ctx.fillStyle = p.shirtColor;
      ctx.fillRect(p.x - 11, py - 38, 22, 28);
      ctx.strokeStyle = '#1d1424';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x - 11, py - 38, 22, 28);

      // Head
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(p.x, py - 46, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(p.x, py - 50, 8.5, Math.PI, 0);
      ctx.fill();

      // Raised arm / Fist
      const armUp = Math.sin(p.armPhase) > 0;
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x + 8, py - 32);
      ctx.lineTo(p.x + 14, armUp ? py - 56 : py - 44);
      ctx.stroke();

      // Fist
      ctx.fillStyle = p.skinColor;
      ctx.beginPath();
      ctx.arc(p.x + 14, armUp ? py - 58 : py - 46, 4, 0, Math.PI * 2);
      ctx.fill();

      // Placard (if person has one)
      if (p.placard) {
        ctx.save();
        const placardX = p.x - 15;
        const placardY = py - 78;

        // Wooden stick
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.x + 5, py - 30);
        ctx.lineTo(p.x + 5, placardY + 18);
        ctx.stroke();

        // Cardboard placard board
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(placardX, placardY, 70, 22);
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 2;
        ctx.strokeRect(placardX, placardY, 70, 22);

        // Text
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 8.5px Bangers, cursive';
        ctx.fillText(p.placard, placardX + 4, placardY + 15);
        ctx.restore();
      }
    });
  }

  private renderStreet(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const gy = this.groundY;

    // Asphalt road
    ctx.fillStyle = '#26202e';
    ctx.fillRect(0, gy, w, h - gy);

    // Yellow curb barrier strip
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(0, gy - 6, w, 6);
    ctx.strokeStyle = '#1d1424';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, gy - 6, w, 6);

    // Yellow and black curb segments
    const curbStep = 40;
    const offset = (this.elapsedTime * this.worldSpeed * this.character.speedMultiplier) % (curbStep * 2);
    for (let x = -offset; x < w + curbStep; x += curbStep * 2) {
      ctx.fillStyle = '#1d1424';
      ctx.fillRect(x, gy - 6, curbStep, 6);
    }

    // Road dashed lane divider line
    ctx.fillStyle = '#ffffff';
    const dashLength = 50;
    const dashGap = 40;
    const dashTotal = dashLength + dashGap;
    const dashOffset = (this.elapsedTime * this.worldSpeed * this.character.speedMultiplier * 1.1) % dashTotal;

    for (let dx = -dashOffset; dx < w + dashTotal; dx += dashTotal) {
      ctx.fillRect(dx, gy + 32, dashLength, 5);
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    this.obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'barricade') {
        // Authentic Delhi Police Yellow Metal Barricade
        const bw = obs.width;
        const bh = obs.height;

        // Metal frame
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(0, 0, bw, bh);
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, bw, bh);

        // Yellow and black/blue caution stripes on center panel
        ctx.fillStyle = '#1d1424';
        ctx.fillRect(4, 12, bw - 8, 26);

        // "DELHI POLICE" text
        ctx.fillStyle = '#ffd23f';
        ctx.font = 'bold 9px Bangers, cursive';
        ctx.fillText('DELHI POLICE', 6, 28);

        // Support legs and feet
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(8, bh);
        ctx.lineTo(2, bh + 8);
        ctx.moveTo(bw - 8, bh);
        ctx.lineTo(bw - 2, bh + 8);
        ctx.stroke();

        // Top triangular grab handles
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bw * 0.5 - 6, -6, 12, 6);
      } else if (obs.type === 'police_lathi') {
        // Police officer in khaki uniform with lathi
        const phase = obs.actionPhase || 0;
        const legSwing = Math.sin(phase) * 6;
        const lathiSwing = Math.sin(phase * 1.5) * 15;

        // Legs (Khaki trousers)
        ctx.strokeStyle = '#85613c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(16, 44);
        ctx.lineTo(12 - legSwing, 72);
        ctx.moveTo(28, 44);
        ctx.lineTo(32 + legSwing, 72);
        ctx.stroke();

        // Boots (Black)
        ctx.fillStyle = '#111827';
        ctx.fillRect(6 - legSwing, 68, 12, 6);
        ctx.fillRect(26 + legSwing, 68, 12, 6);

        // Torso (Khaki shirt + Police badge)
        ctx.fillStyle = '#a17a4e';
        ctx.fillRect(10, 20, 24, 26);
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 20, 24, 26);

        // Belt with buckle
        ctx.fillStyle = '#1d1424';
        ctx.fillRect(10, 40, 24, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(20, 40, 5, 5);

        // Head & Khaki Police Beret / Cap with Red Cockade
        ctx.fillStyle = '#d4a373';
        ctx.beginPath();
        ctx.arc(22, 12, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Police Beret (Dark Blue / Red top)
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(22, 8, 9, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(25, 4, 3, 5);

        // Whistle cord across chest
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, 22);
        ctx.lineTo(24, 32);
        ctx.stroke();

        // Arm with Lathi (Stick)
        ctx.save();
        ctx.translate(14, 24);
        ctx.rotate((lathiSwing * Math.PI) / 180);

        // Arm
        ctx.strokeStyle = '#a17a4e';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, 14);
        ctx.stroke();

        // Lathi (Bamboo stick)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(-24, -18);
        ctx.stroke();
        ctx.restore();
      } else if (obs.type === 'police_bus') {
        // Iconic Delhi Police Blue Bus (Vajra / Transport van)
        const bw = obs.width;
        const bh = obs.height;

        // Main bus body - Royal Navy Blue
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, bw, bh - 14);
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(0, 0, bw, bh - 14);

        // White roof
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, -6, bw, 8);
        ctx.strokeRect(0, -6, bw, 8);

        // Red & Blue Siren on roof
        const sirenFlash = Math.floor(this.elapsedTime * 6) % 2 === 0;
        ctx.fillStyle = sirenFlash ? '#ef4444' : '#3b82f6';
        ctx.fillRect(bw * 0.35, -16, 26, 10);
        ctx.strokeRect(bw * 0.35, -16, 26, 10);

        // Siren glow
        ctx.fillStyle = sirenFlash ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(bw * 0.35 + 13, -11, 24, 0, Math.PI * 2);
        ctx.fill();

        // Barred Windows
        ctx.fillStyle = '#0f172a';
        for (let win = 20; win < bw - 40; win += 34) {
          ctx.fillRect(win, 12, 26, 32);
          ctx.strokeRect(win, 12, 26, 32);

          // Window bars
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(win + 7, 12);
          ctx.lineTo(win + 7, 44);
          ctx.moveTo(win + 14, 12);
          ctx.lineTo(win + 14, 44);
          ctx.moveTo(win + 21, 12);
          ctx.lineTo(win + 21, 44);
          ctx.stroke();
        }

        // Driver Windshield
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bw - 35, 12, 28, 32);
        ctx.strokeRect(bw - 35, 12, 28, 32);

        // Front Grille & Yellow Headlights
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(bw - 10, bh - 28, 8, 10);
        ctx.strokeRect(bw - 10, bh - 28, 8, 10);

        // Bold text: "DELHI POLICE"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Bangers, cursive';
        ctx.fillText('DELHI POLICE', 30, bh - 25);

        // Wheels
        ctx.fillStyle = '#111827';
        [32, bw - 42].forEach((wx) => {
          ctx.beginPath();
          ctx.arc(wx, bh - 10, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 4;
          ctx.stroke();
          // Rim hub
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(wx, bh - 10, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (obs.type === 'water_cannon') {
        // Water Cannon nozzle barrier
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 10, 45, obs.height - 10);
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 10, 45, obs.height - 10);

        // Water nozzle spraying backward
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(10, 15);
        ctx.lineTo(-30, -5);
        ctx.lineTo(-30, 35);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderPowerups(ctx: CanvasRenderingContext2D) {
    this.powerups.forEach((p) => {
      ctx.save();
      const bob = Math.sin(p.bobOffset || 0) * 6;
      ctx.translate(p.x, p.y + bob);

      // Shimmering aura
      const auraGrad = ctx.createRadialGradient(16, 16, 4, 16, 16, 26);
      auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(16, 16, 26, 0, Math.PI * 2);
      ctx.fill();

      if (p.type === 'chai') {
        // Cutting Chai Glass with warm steam
        ctx.fillStyle = '#d97706'; // Milk tea color
        ctx.fillRect(8, 12, 16, 18);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 12, 16, 18);

        // Rising steam
        const steam = Math.sin(this.elapsedTime * 8) * 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(12 + steam, 10);
        ctx.lineTo(14 - steam, 2);
        ctx.moveTo(18 - steam, 10);
        ctx.lineTo(20 + steam, 2);
        ctx.stroke();
      } else if (p.type === 'constitution') {
        // Samvidhan (Constitution Book with golden Ashok Emblem)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(4, 4, 24, 26);
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(4, 4, 24, 26);

        // Golden insignia
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(16, 17, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'megaphone') {
        // Loudspeaker
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(24, 16);
        ctx.lineTo(8, 6);
        ctx.lineTo(8, 26);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1d1424';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (p.type === 'samosa') {
        // Crispy golden samosa
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(16, 4);
        ctx.lineTo(28, 26);
        ctx.lineTo(4, 26);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.playerX, this.playerY);

    // Invulnerability flashing
    if (this.invulnerableTimer > 0 && Math.floor(this.elapsedTime * 14) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Constitution shield golden forcefield
    if (this.powerShieldTimer > 0) {
      const shieldPulse = Math.sin(this.elapsedTime * 10) * 4;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(20, -35, 42 + shieldPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Speed boost trails
    if (this.speedBoostTimer > 0) {
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-i * 18, -35);
        ctx.lineTo(-i * 35, -35);
        ctx.stroke();
      }
    }

    const isDuck = this.isDucking;
    const legPhase = this.isGrounded ? Math.sin(this.runFrameTimer * Math.PI * 2) * 14 : 6;

    if (this.character.isWheelchair) {
      // PROTESTER (Wheelchair)
      // Wheelchair frame & big spoke wheel
      const wheelRotation = (this.elapsedTime * 12) % (Math.PI * 2);

      // Activist Body
      ctx.fillStyle = '#f43f5e'; // Pink shirt as in image
      ctx.fillRect(8, isDuck ? -36 : -52, 24, isDuck ? 18 : 28);
      ctx.strokeStyle = '#1d1424';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(8, isDuck ? -36 : -52, 24, isDuck ? 18 : 28);

      // Head
      ctx.fillStyle = '#d4a373';
      ctx.beginPath();
      ctx.arc(20, isDuck ? -45 : -62, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair
      ctx.fillStyle = '#1e1b24';
      ctx.beginPath();
      ctx.arc(20, isDuck ? -48 : -65, 9, Math.PI, 0);
      ctx.fill();

      // Wheelchair Seat & Backrest
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(6, isDuck ? -24 : -40);
      ctx.lineTo(6, -16);
      ctx.lineTo(26, -16);
      ctx.stroke();

      // Main Large Wheel with spokes
      ctx.save();
      ctx.translate(18, -16);
      ctx.rotate(wheelRotation);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#94a3b8';
      for (let s = 0; s < 6; s++) {
        const sa = (s * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(sa) * 16, -Math.sin(sa) * 16);
        ctx.lineTo(Math.cos(sa) * 16, Math.sin(sa) * 16);
        ctx.stroke();
      }
      ctx.restore();

      // Front small caster wheel
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(36, -6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Placard held high: "JUSTICE EQUALITY FREEDOM"
      this.renderPlayerPlacard(ctx, 24, isDuck ? -50 : -70, this.character.slogan);
    } else {
      // Walking / Running humanoid characters:
      // Abhijit (Blazer + specs), Deepke (Blue shirt), Dhruv Rathi (Green tee), GenZ (Black hoodie)
      const skinColor = '#d4a373';
      let outfitColor = this.character.color;
      if (this.character.id === 'abhijit') outfitColor = '#1e2029'; // Black blazer
      if (this.character.id === 'deepke') outfitColor = '#2563eb'; // Blue shirt
      if (this.character.id === 'dhruv_rathi') outfitColor = '#16a34a'; // Green tee
      if (this.character.id === 'genz') outfitColor = '#18181b'; // Black hoodie

      // Legs / Pants
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      if (isDuck) {
        // Crouched slide
        ctx.moveTo(10, -18);
        ctx.lineTo(-4, -6);
        ctx.moveTo(22, -18);
        ctx.lineTo(34, -6);
      } else {
        ctx.moveTo(12, -26);
        ctx.lineTo(12 - legPhase, 0);
        ctx.moveTo(24, -26);
        ctx.lineTo(24 + legPhase, 0);
      }
      ctx.stroke();

      // Shoes
      ctx.fillStyle = '#0f172a';
      if (!isDuck) {
        ctx.fillRect(7 - legPhase, -5, 12, 5);
        ctx.fillRect(19 + legPhase, -5, 12, 5);
      }

      // Torso / Shirt
      ctx.fillStyle = outfitColor;
      const bodyH = isDuck ? 22 : 32;
      const bodyY = isDuck ? -38 : -56;
      ctx.fillRect(8, bodyY, 22, bodyH);
      ctx.strokeStyle = '#1d1424';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(8, bodyY, 22, bodyH);

      // GenZ Hoodie text "GENZ"
      if (this.character.id === 'genz') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px Bangers, cursive';
        ctx.fillText('GENZ', 11, bodyY + 16);
      }

      // Head
      ctx.fillStyle = skinColor;
      const headY = isDuck ? -48 : -68;
      ctx.beginPath();
      ctx.arc(19, headY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hair & specific features
      ctx.fillStyle = '#1e1b24';
      if (this.character.id === 'genz') {
        // Hoodie hood over head + headphones
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(19, headY, 11, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.stroke();
        // Headphones around neck
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(19, headY + 8, 8, 0, Math.PI);
        ctx.stroke();
      } else {
        // Standard hair
        ctx.beginPath();
        ctx.arc(19, headY - 3, 9, Math.PI, 0);
        ctx.fill();
      }

      // Abhijit Spectacles
      if (this.character.id === 'abhijit') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(17, headY - 3, 5, 4);
        ctx.strokeRect(23, headY - 3, 5, 4);
        // Beard
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(19, headY + 4, 6, 0, Math.PI);
        ctx.fill();
      }

      // Dhruv Rathi Beard / Mic
      if (this.character.id === 'dhruv_rathi') {
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(19, headY + 4, 5, 0, Math.PI);
        ctx.fill();
      }

      // Placard held high
      this.renderPlayerPlacard(ctx, 22, isDuck ? -56 : -78, this.character.slogan);
    }

    ctx.restore();
  }

  private renderPlayerPlacard(ctx: CanvasRenderingContext2D, handX: number, placardY: number, text: string) {
    ctx.save();

    // Wooden handle pole
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(handX, handX < 0 ? -30 : -35);
    ctx.lineTo(handX + 6, placardY + 12);
    ctx.stroke();

    // Placard Board
    ctx.fillStyle = '#fef3c7';
    const pw = 80;
    const ph = 24;
    const px = handX - 25;
    const py = placardY - ph + 4;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#1d1424';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, py, pw, ph);

    // Text on Placard
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 9px Bangers, cursive';
    ctx.fillText(text, px + 5, py + 16);

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.fillRect(p.x, p.y, p.size * 1.5, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${Math.round(18 * ft.scale)}px Bangers, cursive`;
      // Comic stroke
      ctx.strokeStyle = '#120c18';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
