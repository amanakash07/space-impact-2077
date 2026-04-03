// ================================================================
//  PIXEL STRIKE — Vertical shooter
//  Player at bottom, enemies fly down from top, boss every ~20s
//  Green monochrome pixel-art (Space Impact / Galaga style)
// ================================================================

const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

let W, H;
function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── PALETTE ─────────────────────────────────────────────────────
const BG     = '#6ab04c';
const BG2    = '#5a9a3c';
const DARK   = '#1a3d0a';
const MID    = '#2d6a1e';
const ACC    = '#4d7c0f';
const LIGHT  = '#8dc63f';
const BRIGHT = '#adff2f';
const GROUND = '#4a7a34';
const GLINE  = '#3a6228';

// ── PIXEL ART: draw a 2-D array at position (x,y) with pixel size ps
// color index 1 → cols[0], 2 → cols[1], etc.; 0 = transparent
function spr(grid, cols, x, y, ps, flipY) {
    const rows = grid.length, cols_ = grid[0].length;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols_; c++) {
            const v = grid[r][c];
            if (!v) continue;
            ctx.fillStyle = cols[v - 1];
            const px = Math.round(x + c * ps);
            const py = flipY
                ? Math.round(y + (rows - 1 - r) * ps)
                : Math.round(y + r * ps);
            ctx.fillRect(px, py, ps, ps);
        }
    }
}

// ── SPRITES ─────────────────────────────────────────────────────
// Player ship  10 wide × 12 tall  (nose points UP)
const P_SPR = [
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,1,2,2,2,1,0,0,0],
    [0,0,1,2,3,2,1,0,0,0],
    [0,1,1,2,2,2,1,1,0,0],
    [1,1,2,2,2,2,2,1,1,0],
    [1,2,2,2,2,2,2,2,1,0],
    [1,2,2,2,2,2,2,2,1,0],
    [1,1,2,1,2,2,1,2,1,1],
    [0,1,1,1,2,2,1,1,1,0],
    [0,0,0,1,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
];
const P_COLS = [DARK, MID, BRIGHT];

// Enemy jet  10 wide × 8 tall  (nose points DOWN, flipY=true to render)
const E_SPR = [
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,1,2,2,2,1,0,0,0],
    [0,1,1,2,3,2,1,1,0,0],
    [1,1,2,2,2,2,2,1,1,0],
    [1,2,2,2,2,2,2,2,1,0],
    [1,1,2,1,2,2,1,2,1,0],
    [0,0,1,1,2,2,1,1,0,0],
    [0,0,0,0,1,1,0,0,0,0],
];
const E_COLS = [DARK, MID, ACC];

// Boss alien  16 wide × 14 tall
const B_SPR = [
    [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,1,0,0,0,0],
    [0,1,2,2,3,2,2,2,2,3,2,2,1,0,0,0],
    [1,2,2,4,4,4,2,2,4,4,4,2,2,1,0,0],
    [1,2,2,4,5,4,2,2,4,5,4,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,1,1,2,2,1,2,2,1,2,2,1,1,0,0,0],
    [0,0,2,2,1,1,2,2,1,1,2,2,0,0,0,0],
    [0,2,2,0,1,2,2,2,2,1,0,2,2,0,0,0],
    [2,2,0,0,1,2,2,2,2,1,0,0,2,2,0,0],
    [0,0,0,0,1,1,2,2,1,1,0,0,0,0,0,0],
];
const B_COLS = [DARK, MID, ACC, '#cc5500', '#d4f06b'];

// ── SCROLLING BACKGROUND ────────────────────────────────────────
const clouds = [];
let bgOff = 0;

function initBG() {
    clouds.length = 0;
    for (let i = 0; i < 18; i++) clouds.push(mkCloud(Math.random() * H));
}
function mkCloud(y) {
    const big = Math.random() > 0.5;
    return {
        x: Math.random() * W,
        y,
        w: (big ? 40 : 16) + Math.random() * 30,
        h: (big ? 14 : 6)  + Math.random() * 10,
        spd: 0.3 + Math.random() * 0.5,
        type: big ? 'cloud' : 'dot',
    };
}
function drawBG() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // subtle darker lower half
    ctx.fillStyle = BG2;
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);
    ctx.globalAlpha = 1;

    clouds.forEach(cl => {
        cl.y += cl.spd;
        if (cl.y > H + cl.h) Object.assign(cl, mkCloud(-cl.h - 5));
        if (cl.type === 'cloud') {
            ctx.fillStyle = ACC;
            ctx.globalAlpha = 0.28;
            ctx.fillRect(cl.x, cl.y, cl.w, cl.h);
            ctx.fillRect(cl.x + cl.w * 0.15, cl.y - cl.h * 0.45, cl.w * 0.55, cl.h * 0.55);
        } else {
            ctx.fillStyle = DARK;
            ctx.globalAlpha = 0.18;
            ctx.fillRect(cl.x, cl.y, cl.w * 0.35, cl.h * 0.35);
        }
        ctx.globalAlpha = 1;
    });

    // scrolling ground stripe at bottom
    bgOff = (bgOff + 1.2) % 80;
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, H - 12, W, 12);
    ctx.fillStyle = GLINE;
    for (let x = -bgOff; x < W; x += 80) {
        ctx.fillRect(x, H - 9, 28, 3);
        ctx.fillRect(x + 44, H - 5, 14, 2);
    }
}

// ── SOUND ───────────────────────────────────────────────────────
function loadAudio(src, vol, loop) {
    const a = new Audio(src);
    a.volume = vol || 1;
    a.loop   = !!loop;
    return a;
}
function playClone(audio) {
    try {
        const c = new Audio(audio.src);
        c.volume = audio.volume;
        c.play().catch(() => {});
    } catch(_) {}
}

const SND = {
    _shot:      loadAudio('Asset/Shot.wav',            0.5),
    _crash:     loadAudio('Asset/crash.wav',           0.7),
    _waveDone:  loadAudio('Asset/wave pass.wav',       0.6),
    _scoreTime: loadAudio('Asset/Score Time.wav',      0.4),
    _health:    loadAudio('Asset/Health Loaded.wav',   0.6),
    _bossEntry: loadAudio('Asset/Final Boss Entry.wav',0.8),
    _lobby:     loadAudio('Asset/Lobby.wav',           0.35, true),

    shoot:     function() { playClone(this._shot); },
    eShoot:    function() { playClone(this._shot); },
    hit:       function() { playClone(this._crash); },
    explode:   function() { playClone(this._crash); },
    bossHit:   function() { playClone(this._crash); },
    bossShoot: function() { playClone(this._shot); },
    bossEntry: function() { playClone(this._bossEntry); },
    waveDone:  function() { playClone(this._waveDone); },

    startMusic: function() {
        this._lobby.currentTime = 0;
        this._lobby.play().catch(() => {});
    },
    stopMusic: function() {
        this._lobby.pause();
        this._lobby.currentTime = 0;
    },
};

// ── PARTICLES ───────────────────────────────────────────────────
const parts = [];
function boom(x, y, big) {
    const n = big ? 16 : 8;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = 1.5 + Math.random() * (big ? 4 : 2.5);
        parts.push({
            x, y,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            life: 20 + Math.random() * 25,
            max: 45,
            sz: big ? 7 : 4,
            col: Math.random() > 0.5 ? BRIGHT : ACC,
        });
    }
    SND.explode();
}
function tickParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / p.max;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
    }
    ctx.globalAlpha = 1;
}

// ── HELPERS ─────────────────────────────────────────────────────
function rects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}
function aimed(ox, oy, tx, ty, spd) {
    const dx = tx - ox, dy = ty - oy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / d * spd, dy / d * spd];
}

// ── BULLET CLASSES ───────────────────────────────────────────────
class PBullet {
    constructor(x, y) {
        this.x = x - 3; this.y = y;
        this.w = 6; this.h = 18;
        this.vy = -13;
    }
    tick() { this.y += this.vy; }
    draw() {
        ctx.fillStyle = BRIGHT;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#d4f06b';
        ctx.fillRect(this.x + 1, this.y, this.w - 2, 5);
    }
    alive() { return this.y + this.h > 0; }
}

class EBullet {
    constructor(x, y, vx, vy) {
        this.x = x - 3; this.y = y;
        this.w = 6; this.h = 12;
        this.vx = vx; this.vy = vy;
    }
    tick() { this.x += this.vx; this.y += this.vy; }
    draw() {
        ctx.fillStyle = DARK;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = MID;
        ctx.fillRect(this.x + 1, this.y + this.h - 5, this.w - 2, 5);
    }
    alive() { return this.y < H + 20 && this.x > -20 && this.x < W + 20; }
}

// ── PLAYER ──────────────────────────────────────────────────────
class Player {
    constructor() {
        this.ps = Math.max(2, Math.floor(Math.min(W, H) / 80));
        this.pw = P_SPR[0].length;
        this.ph = P_SPR.length;
        this.w  = this.pw * this.ps;
        this.h  = this.ph * this.ps;
        this.x  = W / 2 - this.w / 2;
        // on touch devices push player above the 160px control strip at the bottom
        const ctrlH = window.matchMedia('(pointer:coarse)').matches ? 160 : 20;
        this.y  = H - this.h - ctrlH;
        this.spd = 5;
        this.hp = 5; this.maxHp = 5;
        this.inv = 0;
        this.bullets = [];
        this.sCool = 0;
        this.thrA = 0;
    }
    tick(inp) {
        // move
        let dx = 0;
        if (inp.left)  dx = -1;
        if (inp.right) dx =  1;
        this.x = Math.max(0, Math.min(W - this.w, this.x + dx * this.spd));

        // shoot
        this.sCool--;
        if (inp.fire && this.sCool <= 0) {
            this.bullets.push(new PBullet(this.x + this.w / 2, this.y));
            SND.shoot();
            this.sCool = 10;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
        if (this.inv > 0) this.inv--;
        this.thrA = (this.thrA + 1) % 8;
    }
    hit() {
        if (this.inv > 0) return false;
        this.hp--; this.inv = 55;
        boom(this.x + this.w / 2, this.y + this.h / 2, false);
        SND.hit();
        return this.hp <= 0;
    }
    draw() {
        // blink while invincible
        if (this.inv > 0 && Math.floor(this.inv / 5) % 2) return;
        spr(P_SPR, P_COLS, this.x, this.y, this.ps, false);

        // engine flame below ship
        const fh = this.thrA < 4 ? this.ps * 2 : this.ps * 3;
        ctx.fillStyle = BRIGHT;
        ctx.fillRect(this.x + this.w * 0.25, this.y + this.h, this.ps, fh);
        ctx.fillRect(this.x + this.w * 0.65, this.y + this.h, this.ps, fh);
        ctx.fillStyle = '#d4f06b';
        ctx.fillRect(this.x + this.w * 0.25, this.y + this.h, this.ps, this.ps);
        ctx.fillRect(this.x + this.w * 0.65, this.y + this.h, this.ps, this.ps);

        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
}

// ── ENEMY JET ───────────────────────────────────────────────────
class Enemy {
    constructor(wave) {
        this.ps = Math.max(2, Math.floor(Math.min(W, H) / 90));
        this.pw = E_SPR[0].length;
        this.ph = E_SPR.length;
        this.w  = this.pw * this.ps;
        this.h  = this.ph * this.ps;
        this.x  = 10 + Math.random() * (W - this.w - 20);
        this.y  = -this.h - 5;
        this.startX = this.x;
        this.vy = 1.2 + Math.random() * 0.9 + wave * 0.12;
        this.hp = 1 + Math.floor(wave / 5);
        this.maxHp = this.hp;
        this.sTmr  = 30 + Math.random() * 80;
        this.sRate = Math.max(50, 110 - wave * 4);
        this.bullets = [];
        this.pat   = Math.floor(Math.random() * 3);  // 0=straight, 1=sine, 2=zigzag
        this.t     = 0;
        this.flash = 0;
    }
    tick() {
        this.t++;
        this.y += this.vy;
        if (this.pat === 1) this.x = this.startX + Math.sin(this.t * 0.06) * 60;
        if (this.pat === 2) this.x = this.startX + Math.sin(this.t * 0.04) * 90;
        this.x = Math.max(0, Math.min(W - this.w, this.x));

        this.sTmr++;
        if (this.sTmr >= this.sRate) {
            this.bullets.push(new EBullet(this.cx(), this.cy(), 0, 4.5));
            SND.eShoot();
            this.sTmr = 0;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
        if (this.flash > 0) this.flash--;
    }
    hit() { this.hp--; this.flash = 6; return this.hp <= 0; }
    gone() { return this.y > H + 10; }
    draw() {
        if (this.flash > 0) {
            ctx.globalAlpha = 0.55;
            ctx.fillStyle = BRIGHT;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
        // flipY=true so nose points down
        spr(E_SPR, E_COLS, this.x, this.y, this.ps, true);
        // HP pips
        for (let i = 0; i < this.maxHp; i++) {
            ctx.fillStyle = i < this.hp ? BRIGHT : DARK;
            ctx.fillRect(this.x + i * 7, this.y - 7, 6, 3);
        }
        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
}

// ── BOSS ────────────────────────────────────────────────────────
class Boss {
    constructor(wave) {
        this.ps = Math.max(3, Math.floor(Math.min(W, H) / 55));
        this.pw = B_SPR[0].length;
        this.ph = B_SPR.length;
        this.w  = this.pw * this.ps;
        this.h  = this.ph * this.ps;
        this.x  = W / 2 - this.w / 2;
        this.y  = -this.h;
        this.targetY = 40;
        this.hp = 20 + wave * 8;
        this.maxHp = this.hp;
        this.bullets = [];
        this.sTmr  = 0;
        this.sPhase = 0;
        this.mDir  = 1;
        this.mTmr  = 0;
        this.phase = 0; // 0=enter, 1=fight, 2=rage
        this.flash = 0;
        this.t     = 0;
    }
    tick(px, py) {
        this.t++; if (this.flash > 0) this.flash--;

        if (this.phase === 0) {
            this.y += 3;
            if (this.y >= this.targetY) { this.y = this.targetY; this.phase = 1; }
            return;
        }
        if (this.hp < this.maxHp * 0.4 && this.phase < 2) this.phase = 2;

        // side drift
        this.mTmr++;
        if (this.mTmr > 75) { this.mDir *= -1; this.mTmr = 0; }
        this.x += this.mDir * 1.5;
        this.x = Math.max(0, Math.min(W - this.w, this.x));

        // shoot
        this.sTmr++;
        const rate = this.phase === 2 ? 22 : 40;
        if (this.sTmr >= rate) {
            this.shoot(px, py); this.sTmr = 0; this.sPhase++;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
    }
    shoot(px, py) {
        const cx = this.cx(), cy = this.y + this.h;
        const spd = 5;
        if (this.phase === 2) {
            // enraged: 5-way downward fan (no backwards shots)
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI / 2) + (i - 2) * 0.28;
                this.bullets.push(new EBullet(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd));
            }
        } else {
            // normal: aimed + tight 3-way spread
            const [vx, vy] = aimed(cx, cy, px, py, spd);
            this.bullets.push(new EBullet(cx, cy, vx, vy));
            this.bullets.push(new EBullet(cx, cy, vx - 1.0, vy + 0.5));
            this.bullets.push(new EBullet(cx, cy, vx + 1.0, vy + 0.5));
        }
        SND.bossShoot();
    }
    hit() {
        this.hp--; this.flash = 7;
        if (Math.random() < 0.35)
            boom(this.x + this.w * Math.random(), this.y + this.h * Math.random(), false);
        SND.bossHit();
        return this.hp <= 0;
    }
    draw() {
        if (this.flash > 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = BRIGHT;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
        // flipY=true so body faces down
        spr(B_SPR, B_COLS, this.x, this.y, this.ps, true);

        // health bar
        const bw = this.w, bh = 10;
        ctx.fillStyle = DARK;
        ctx.fillRect(this.x, this.y - 16, bw, bh);
        const frac = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = frac > 0.5 ? BRIGHT : frac > 0.25 ? '#cc8800' : '#cc3300';
        ctx.fillRect(this.x, this.y - 16, Math.round(bw * frac), bh);
        ctx.strokeStyle = DARK; ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - 16, bw, bh);

        ctx.fillStyle = DARK;
        ctx.font = `bold ${Math.round(12)}px 'Courier New',monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('ALIEN BOSS', this.cx(), this.y - 20);
        ctx.textAlign = 'left';

        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
}

// ── HUD DOM ──────────────────────────────────────────────────────
const hScore  = document.getElementById('hScore');
const hBest   = document.getElementById('hBest');
const hWave   = document.getElementById('hWave');
const overlay = document.getElementById('overlay');
const startPn = document.getElementById('startPanel');
const overPn  = document.getElementById('overPanel');
const oScore  = document.getElementById('oScore');
const oBest   = document.getElementById('oBest');
const bossWarn = document.getElementById('bossWarn');

function drawHUD(score, wave, player) {
    hScore.textContent = 'SCORE: ' + String(score).padStart(5, '0');
    hWave.textContent  = 'WAVE: '  + wave;

    if (!player) return;
    // HP bar bottom-center
    const bw = 120, bh = 12;
    const bx = W / 2 - bw / 2, by = H - bh - 6;
    ctx.fillStyle = DARK;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = player.hp > 2 ? BRIGHT : '#cc3300';
    ctx.fillRect(bx, by, Math.round(bw * player.hp / player.maxHp), bh);
    ctx.strokeStyle = DARK; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = DARK;
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('HP', W / 2, by + bh - 2);
    ctx.textAlign = 'left';
}

// ── GAME STATE ───────────────────────────────────────────────────
let running  = false;
let score    = 0;
let wave     = 1;
let kills    = 0;
let time     = 0;
let hiScore  = parseInt(localStorage.getItem('psHi') || '0');
let bossMode = false;
let bossTimer = 0;
const BOSS_INT = 1200; // ~20 sec at 60fps

let player, enemies, boss, spawnT;

function initGame() {
    player    = new Player();
    enemies   = [];
    boss      = null;
    parts.length = 0;
    score     = 0; wave = 1; kills = 0; time = 0;
    bossMode  = false; bossTimer = 0;
    spawnT    = 0;
    running   = true;
    clouds.length = 0; initBG();
    SND.startMusic();
}

// ── INPUT ────────────────────────────────────────────────────────
const inp = { left: false, right: false, fire: false };

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') inp.left  = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        inp.fire = true; e.preventDefault();
    }
    if (!running) startGame();
});
window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') inp.left  = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.right = false;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inp.fire = false;
});

// Touch controls
const tL = document.getElementById('touchLeft');
const tR = document.getElementById('touchRight');
const tF = document.getElementById('touchFire');

tL.addEventListener('touchstart', e => { e.preventDefault(); inp.left = true;  if (!running) startGame(); }, {passive:false});
tL.addEventListener('touchend',   e => { e.preventDefault(); inp.left = false; }, {passive:false});
tR.addEventListener('touchstart', e => { e.preventDefault(); inp.right = true; if (!running) startGame(); }, {passive:false});
tR.addEventListener('touchend',   e => { e.preventDefault(); inp.right = false;}, {passive:false});
tF.addEventListener('touchstart', e => { e.preventDefault(); inp.fire = true;  if (!running) startGame(); }, {passive:false});
tF.addEventListener('touchend',   e => { e.preventDefault(); inp.fire = false; }, {passive:false});
tF.addEventListener('touchcancel',() => { inp.fire = false; });

// ── START / OVER ─────────────────────────────────────────────────
document.getElementById('btnStart').addEventListener('click', startGame);
document.getElementById('btnRestart').addEventListener('click', startGame);

function startGame() {
    if (running) return;
    overlay.classList.add('hidden');
    bossWarn.style.display = 'none';
    initGame();
}
window.startGame = startGame;  // for HTML onclick fallback

function gameOver() {
    running = false;
    SND.stopMusic();
    if (score > hiScore) { hiScore = score; localStorage.setItem('psHi', hiScore); }
    hBest.textContent = 'BEST: ' + String(hiScore).padStart(5, '0');
    oScore.textContent = 'SCORE: ' + score;
    oBest.textContent  = 'BEST: '  + hiScore;
    startPn.style.display = 'none';
    overPn.style.display  = 'block';
    overlay.classList.remove('hidden');
}

// ── MAIN LOOP ────────────────────────────────────────────────────
function loop() {
    requestAnimationFrame(loop);
    drawBG();

    if (!running) return;

    time++;
    score++;

    // spawn enemies
    if (!bossMode) {
        spawnT++;
        const rate = Math.max(28, 72 - wave * 3);
        if (spawnT >= rate) {
            enemies.push(new Enemy(wave));
            if (wave >= 3 && Math.random() < 0.35) enemies.push(new Enemy(wave));
            if (wave >= 6 && Math.random() < 0.2)  enemies.push(new Enemy(wave));
            spawnT = 0;
        }

        bossTimer++;
        if (bossTimer >= BOSS_INT) {
            enemies = [];
            boss = new Boss(wave);
            bossMode = true;
            bossTimer = 0;
            bossWarn.style.display = 'block';
            setTimeout(() => { bossWarn.style.display = 'none'; }, 2500);
            SND.stopMusic();
            SND.bossEntry();
        }
    }

    player.tick(inp);

    // ── enemy logic ──
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.tick();

        // player bullets → enemy
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], e)) {
                player.bullets.splice(j, 1);
                if (e.hit()) {
                    boom(e.cx(), e.cy(), false);
                    enemies.splice(i, 1);
                    score += 100 * wave;
                    kills++;
                    if (kills % 8 === 0) { wave++; SND.waveDone(); }
                }
                break;
            }
        }
        if (i >= enemies.length) continue;

        // enemy bullets → player
        const en = enemies[i];
        if (!en) continue;
        for (let j = en.bullets.length - 1; j >= 0; j--) {
            if (rects(en.bullets[j], player)) {
                en.bullets.splice(j, 1);
                if (player.hit()) { gameOver(); return; }
                break;
            }
        }

        // enemy body → player
        if (enemies[i] && rects(enemies[i], player)) {
            if (player.hit()) { gameOver(); return; }
        }

        if (enemies[i] && enemies[i].gone()) enemies.splice(i, 1);
    }

    // ── boss logic ──
    if (bossMode && boss) {
        boss.tick(player.cx(), player.cy());

        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], boss)) {
                player.bullets.splice(j, 1);
                if (boss.hit()) {
                    boom(boss.cx(), boss.y + boss.h / 2, true);
                    boom(boss.cx() - 30, boss.y + boss.h * 0.3, true);
                    boom(boss.cx() + 30, boss.y + boss.h * 0.6, true);
                    score += 1500 * wave;
                    wave++;
                    SND.waveDone();
                    SND.startMusic();
                    bossMode = false;
                    boss = null;
                }
                break;
            }
        }
        if (boss) {
            for (let j = boss.bullets.length - 1; j >= 0; j--) {
                if (rects(boss.bullets[j], player)) {
                    boss.bullets.splice(j, 1);
                    if (player.hit()) { gameOver(); return; }
                    break;
                }
            }
        }
    }

    // ── draw ──
    enemies.forEach(e => e.draw());
    if (boss) boss.draw();
    tickParts();
    player.draw();
    drawHUD(score, wave, player);

    hBest.textContent = 'BEST: ' + String(hiScore).padStart(5, '0');
}

// ── BOOT ─────────────────────────────────────────────────────────
initBG();
loop();
