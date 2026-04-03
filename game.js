// ================================================================
//  SPACE IMPACT 2077 — Vertical shooter
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

// ── PALETTE ──────────────────────────────────────────────────────
const BG     = '#6ab04c';
const BG2    = '#5a9a3c';
const DARK   = '#1a3d0a';
const MID    = '#2d6a1e';
const ACC    = '#4d7c0f';
const BRIGHT = '#adff2f';
const GROUND = '#4a7a34';
const GLINE  = '#3a6228';
const SHIELD_COL = '#00e5ff';
const HEART_COL  = BRIGHT;   // same green palette

// ── SPRITE RENDERER ──────────────────────────────────────────────
function spr(grid, cols, x, y, ps, flipY) {
    const rows = grid.length, cw = grid[0].length;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cw; c++) {
            const v = grid[r][c];
            if (!v) continue;
            ctx.fillStyle = cols[v - 1];
            const px = Math.round(x + c * ps);
            const py = flipY ? Math.round(y + (rows - 1 - r) * ps) : Math.round(y + r * ps);
            ctx.fillRect(px, py, ps, ps);
        }
    }
}

// ── SPRITES ──────────────────────────────────────────────────────
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

// Heart powerup icon  7×7
const H_SPR = [
    [0,1,1,0,1,1,0],
    [1,2,2,1,2,2,1],
    [1,2,2,2,2,2,1],
    [1,2,2,2,2,2,1],
    [0,1,2,2,2,1,0],
    [0,0,1,2,1,0,0],
    [0,0,0,1,0,0,0],
];
const H_COLS = [DARK, HEART_COL];

// Shield powerup icon  7×7
const S_SPR = [
    [0,1,1,1,1,1,0],
    [1,2,2,2,2,2,1],
    [1,2,2,2,2,2,1],
    [1,2,2,2,2,2,1],
    [0,1,2,2,2,1,0],
    [0,0,1,2,1,0,0],
    [0,0,0,1,0,0,0],
];
const S_COLS = [DARK, SHIELD_COL];

// Ammo powerup icon — bullet cartridge shape  5×9
const BU_SPR = [
    [0,1,1,1,0],
    [1,2,3,2,1],
    [1,2,3,2,1],
    [1,1,1,1,1],
    [1,2,2,2,1],
    [1,2,2,2,1],
    [1,2,2,2,1],
    [1,2,2,2,1],
    [0,1,1,1,0],
];
const BU_COLS = [DARK, MID, BRIGHT];

// ── SCROLLING SPACE BACKGROUND ───────────────────────────────────
const bgObjs = [];   // stars + planets
let bgOff = 0;

// planet types: size, ring, colors
const PLANET_TYPES = [
    { r: 18, ring: false, col: MID,    shade: DARK  },  // small dark
    { r: 28, ring: true,  col: ACC,    shade: MID   },  // medium with ring
    { r: 14, ring: false, col: ACC,    shade: DARK  },  // tiny
    { r: 40, ring: true,  col: MID,    shade: DARK  },  // big with ring
    { r: 22, ring: false, col: GROUND, shade: DARK  },  // medium plain
];

function initBG() {
    bgObjs.length = 0;
    // stars
    for (let i = 0; i < 60; i++) {
        bgObjs.push({ type:'star', x: Math.random()*W, y: Math.random()*H,
            sz: Math.random() < 0.7 ? 2 : 3, spd: 0.4 + Math.random()*0.3 });
    }
    // planets spread across screen
    for (let i = 0; i < 6; i++) {
        bgObjs.push(mkPlanet(Math.random() * H));
    }
}

function mkPlanet(y) {
    const t = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
    return { type:'planet', x: Math.random() * W, y,
        r: t.r, ring: t.ring, col: t.col, shade: t.shade,
        spd: 0.15 + Math.random() * 0.2 };
}

function drawPlanet(cx, cy, r, col, shadeCol, hasRing) {
    cx = Math.round(cx); cy = Math.round(cy);

    // draw ring BEHIND planet first
    if (hasRing) {
        const rw = Math.round(r * 2.6);
        const rh = Math.round(r * 0.45);
        ctx.save();
        ctx.globalAlpha = 0.5;
        // outer ring
        ctx.fillStyle = shadeCol;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
        ctx.fill();
        // inner ring gap (cut with planet base color)
        ctx.fillStyle = '#0a1a05';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw * 0.6, rh * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // planet body — filled circle
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // crescent shadow on right side (NOT a quadrant, just a partial arc)
    ctx.fillStyle = shadeCol;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(cx + r * 0.25, cy, r * 0.82, 0, Math.PI * 2);
    ctx.arc(cx, cy, r, Math.PI * 2, 0, true); // subtract planet circle
    ctx.fill();

    // small bright highlight dot top-left
    ctx.fillStyle = '#adff2f';
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // draw ring IN FRONT of planet (lower half only) to give depth
    if (hasRing) {
        const rw = Math.round(r * 2.6);
        const rh = Math.round(r * 0.45);
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = shadeCol;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI);  // bottom half only
        ctx.fill();
    }
    ctx.restore();
}

function drawBG() {
    ctx.fillStyle = '#0a1a05';
    ctx.fillRect(0, 0, W, H);

    bgObjs.forEach(o => {
        o.y += o.spd;
        if (o.y > H + (o.r || 5) * 2 + 60) {
            if (o.type === 'star') Object.assign(o, { x: Math.random()*W, y: -4 });
            else                   Object.assign(o, mkPlanet(-(o.r * 2 + 60)));
        }

        if (o.type === 'star') {
            // twinkle: only update alpha every few frames
            ctx.globalAlpha = 0.4 + (Math.sin(Date.now() * 0.003 + o.x) * 0.5 + 0.5) * 0.5;
            ctx.fillStyle = BRIGHT;
            ctx.fillRect(o.x, o.y, o.sz, o.sz);
            ctx.globalAlpha = 1;
        } else {
            drawPlanet(o.x, o.y, o.r, o.col, o.shade, o.ring);
        }
    });

    // scrolling ground stripe
    bgOff = (bgOff + 0.8) % 80;
    ctx.fillStyle = '#0f2208';
    ctx.fillRect(0, H - 12, W, 12);
    ctx.fillStyle = '#1a3d0a';
    for (let x = -bgOff; x < W; x += 80) {
        ctx.fillRect(x, H - 9, 28, 3);
        ctx.fillRect(x + 44, H - 5, 14, 2);
    }
}

// ── SOUND ────────────────────────────────────────────────────────
function loadAudio(src, vol, loop) {
    const a = new Audio(src);
    a.volume = vol || 1; a.loop = !!loop;
    return a;
}
// Pool-based play: reuse finished audio instances instead of creating new ones
const _pools = new Map();
function playClone(audio) {
    try {
        if (!_pools.has(audio.src)) _pools.set(audio.src, []);
        const pool = _pools.get(audio.src);
        let inst = pool.find(a => a.paused || a.ended);
        if (!inst) {
            inst = new Audio(audio.src);
            inst.volume = audio.volume;
            pool.push(inst);
        }
        inst.currentTime = 0;
        inst.play().catch(() => {});
    } catch(_) {}
}
const SND = {
    _shot:      loadAudio('Asset/Shot.wav',            0.5),
    _eshot:     loadAudio('Asset/crash.wav',           0.18), // enemy shoot: quiet crash
    _crash:     loadAudio('Asset/crash.wav',           0.7),
    _waveDone:  loadAudio('Asset/wave pass.wav',       0.6),
    _health:    loadAudio('Asset/Health Loaded.wav',   0.7),
    _bossEntry: loadAudio('Asset/Final Boss Entry.wav',0.8),
    _lobby:     loadAudio('Asset/Lobby.wav',           0.35, true),

    shoot:      function() { playClone(this._shot); },
    eShoot:     function() { playClone(this._eshot); },
    hit:        function() { playClone(this._crash); },
    explode:    function() { playClone(this._crash); },
    bossHit:    function() { playClone(this._crash); },
    bossShoot:  function() { playClone(this._shot); },
    bossEntry:  function() { playClone(this._bossEntry); },
    waveDone:   function() { playClone(this._waveDone); },
    pickup:     function() { playClone(this._health); },

    startMusic: function() { this._lobby.currentTime = 0; this._lobby.play().catch(() => {}); },
    stopMusic:  function() { this._lobby.pause(); this._lobby.currentTime = 0; },
};

// ── PARTICLES ────────────────────────────────────────────────────
const parts = [];
function boom(x, y, big) {
    const n = big ? 16 : 8;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = 1.5 + Math.random() * (big ? 4 : 2.5);
        parts.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
            life: 20 + Math.random()*25, max: 45, sz: big ? 7 : 4,
            col: Math.random() > 0.5 ? BRIGHT : ACC });
    }
    SND.explode();
}

// Floating text particles (for +++ pickup effect)
const floats = [];
function floatText(x, y, text, col) {
    floats.push({ x, y, text, col, life: 70, max: 70, vy: -1.2 });
}
function tickFloats() {
    for (let i = floats.length - 1; i >= 0; i--) {
        const f = floats[i];
        f.y += f.vy; f.life--;
        if (f.life <= 0) { floats.splice(i, 1); continue; }
        ctx.globalAlpha = f.life / f.max;
        ctx.fillStyle = f.col;
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
        ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
}

function tickParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / p.max;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x - p.sz/2, p.y - p.sz/2, p.sz, p.sz);
    }
    ctx.globalAlpha = 1;
}

// ── HELPERS ──────────────────────────────────────────────────────
function rects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}
function aimed(ox, oy, tx, ty, spd) {
    const dx = tx - ox, dy = ty - oy;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    return [dx/d * spd, dy/d * spd];
}

// ── BULLETS ──────────────────────────────────────────────────────
class PBullet {
    constructor(x, y, big) {
        this.big = !!big;
        this.w = big ? 10 : 6;
        this.h = big ? 22 : 18;
        this.x = x - this.w/2; this.y = y;
        this.vy = big ? -11 : -13;
    }
    tick() { this.y += this.vy; }
    draw() {
        ctx.fillStyle = this.big ? '#d4f06b' : BRIGHT;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.big ? BRIGHT : '#d4f06b';
        ctx.fillRect(this.x+1, this.y, this.w-2, this.big ? 7 : 5);
    }
    alive() { return this.y + this.h > 0; }
}

class EBullet {
    constructor(x, y, vx, vy) {
        this.x = x-3; this.y = y; this.w = 6; this.h = 12;
        this.vx = vx; this.vy = vy;
    }
    tick() { this.x += this.vx; this.y += this.vy; }
    draw() {
        ctx.fillStyle = DARK; ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = MID;  ctx.fillRect(this.x+1, this.y+this.h-5, this.w-2, 5);
    }
    alive() { return this.y < H+20 && this.x > -20 && this.x < W+20; }
}

// ── POWERUP ──────────────────────────────────────────────────────
class Powerup {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.type = type; // 'heart' or 'shield'
        this.ps = 4;
        this.w = 7 * this.ps;
        this.h = 7 * this.ps;
        this.vy = 1.8;
        this.t  = 0;
    }
    tick() { this.y += this.vy; this.t++; }
    gone() { return this.y > H + 20; }
    draw() {
        // bob up/down slightly
        const bob = Math.sin(this.t * 0.1) * 3;
        const dy = this.y + bob;
        // glow ring
        ctx.globalAlpha = 0.3 + Math.sin(this.t * 0.12) * 0.2;
        ctx.fillStyle = this.type === 'heart' ? HEART_COL : SHIELD_COL;
        ctx.fillRect(this.x - 4, dy - 4, this.w + 8, this.h + 8);
        ctx.globalAlpha = 1;
        if (this.type === 'heart')        spr(H_SPR,  H_COLS,  this.x, dy, this.ps, false);
        else if (this.type === 'shield')   spr(S_SPR,  S_COLS,  this.x, dy, this.ps, false);
        else                               spr(BU_SPR, BU_COLS, this.x, dy, this.ps, false);
    }
}

// ── PLAYER ───────────────────────────────────────────────────────
class Player {
    constructor() {
        this.ps  = Math.max(2, Math.floor(Math.min(W, H) / 80));
        this.pw  = P_SPR[0].length;
        this.ph  = P_SPR.length;
        this.w   = this.pw * this.ps;
        this.h   = this.ph * this.ps;
        this.x   = W / 2 - this.w / 2;
        const ctrlH = window.matchMedia('(pointer:coarse)').matches ? 160 : 20;
        this.y   = H - this.h - ctrlH;
        this.spd = 5;
        this.hp  = 5; this.maxHp = 5;
        this.inv = 0;
        this.bullets = [];
        this.sCool = 0;
        this.thrA  = 0;
        this.shield      = false;
        this.shieldTimer = 0;
        this.plusAnim    = 0;
        this.bulletPower = false;  // spread big bullets
        this.bulletTimer = 0;
    }
    tick(inp) {
        let dx = 0;
        if (inp.left)  dx = -1;
        if (inp.right) dx =  1;
        this.x = Math.max(0, Math.min(W - this.w, this.x + dx * this.spd));

        this.sCool--;
        if (inp.fire && this.sCool <= 0) {
            if (this.bulletPower) {
                // 3-way spread, bigger bullets
                this.bullets.push(new PBullet(this.x + this.w/2, this.y, true));
                this.bullets.push(new PBullet(this.x + this.w/2 - 14, this.y + 8, true));
                this.bullets.push(new PBullet(this.x + this.w/2 + 14, this.y + 8, true));
            } else {
                this.bullets.push(new PBullet(this.x + this.w/2, this.y, false));
            }
            SND.shoot();
            this.sCool = 10;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
        if (this.inv > 0) this.inv--;
        if (this.shieldTimer > 0) this.shieldTimer--;
        else this.shield = false;
        if (this.bulletTimer > 0) this.bulletTimer--;
        else this.bulletPower = false;
        if (this.plusAnim > 0) this.plusAnim--;
        this.thrA = (this.thrA + 1) % 8;
    }
    hit() {
        if (this.inv > 0) return false;
        // shield absorbs one hit
        if (this.shield) {
            this.shield = false; this.shieldTimer = 0;
            this.inv = 40;
            floatText(this.cx(), this.y - 10, 'SHIELD!', SHIELD_COL);
            return false;
        }
        this.hp--; this.inv = 55;
        boom(this.cx(), this.cy(), false);
        SND.hit();
        return this.hp <= 0;
    }
    addHeart() {
        this.hp = Math.min(this.hp + 1, this.maxHp + 2);
        if (this.hp > this.maxHp) this.maxHp = this.hp;
        this.plusAnim = 80;
        SND.pickup();
        floatText(this.cx() - 18, this.y - 15, '+', HEART_COL);
        floatText(this.cx(),      this.y - 22, '+', HEART_COL);
        floatText(this.cx() + 18, this.y - 15, '+', HEART_COL);
    }
    addShield() {
        this.shield = true; this.shieldTimer = 300;
        this.inv = 20;
        SND.pickup();
        floatText(this.cx(), this.y - 20, 'SHIELD!', SHIELD_COL);
    }
    addBulletPack() {
        this.bulletPower = true; this.bulletTimer = 400; // ~6 sec
        SND.pickup();
        floatText(this.cx(), this.y - 20, 'POWER UP!', BRIGHT);
    }
    draw() {
        // shield bubble
        if (this.shield) {
            const pulse = 0.5 + 0.5 * Math.sin(this.shieldTimer * 0.15);
            ctx.globalAlpha = 0.35 + pulse * 0.25;
            ctx.fillStyle = SHIELD_COL;
            const r = this.w * 0.75;
            ctx.beginPath();
            ctx.arc(this.cx(), this.cy(), r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.7 + pulse * 0.3;
            ctx.strokeStyle = SHIELD_COL;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.cx(), this.cy(), r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // +++ health anim — pixel plus signs orbiting ship
        if (this.plusAnim > 0) {
            const a = this.plusAnim;
            ctx.globalAlpha = Math.min(1, a / 40);
            ctx.fillStyle = HEART_COL;
            const r = this.w * 0.9 + (80 - a) * 0.3;
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2 + a * 0.06;
                const px = this.cx() + Math.cos(ang) * r;
                const py = this.cy() + Math.sin(ang) * r;
                // draw small "+" shape
                ctx.fillRect(px - 5, py - 1, 10, 3);
                ctx.fillRect(px - 1, py - 5, 3, 10);
            }
            ctx.globalAlpha = 1;
        }

        if (this.inv > 0 && Math.floor(this.inv / 5) % 2) return;
        spr(P_SPR, P_COLS, this.x, this.y, this.ps, false);

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

// ── ENEMY JET (straight down, same lane always) ───────────────────
class Enemy {
    constructor(wave, forcedX) {
        this.ps  = Math.max(2, Math.floor(Math.min(W, H) / 90));
        this.pw  = E_SPR[0].length;
        this.ph  = E_SPR.length;
        this.w   = this.pw * this.ps;
        this.h   = this.ph * this.ps;
        // forcedX lets boss spawn minions at specific positions
        this.x   = forcedX !== undefined ? forcedX : 10 + Math.random() * (W - this.w - 20);
        this.y   = -this.h - 5;
        this.vy  = 1.2 + Math.random() * 0.9 + wave * 0.12;
        this.hp  = 1 + Math.floor(wave / 5);
        this.maxHp = this.hp;
        this.sTmr  = 60 + Math.random() * 100;  // longer initial delay before first shot
        this.sRate = Math.max(80, 140 - wave * 4); // slower fire rate = more gap between bullets
        this.bullets = [];
        this.flash = 0;
    }
    tick() {
        // straight down — no x movement, no lane change
        this.y += this.vy;
        this.sTmr++;
        if (this.sTmr >= this.sRate) {
            this.bullets.push(new EBullet(this.cx(), this.cy(), 0, 3.5)); // slower bullet = easier to dodge
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
            ctx.globalAlpha = 0.55; ctx.fillStyle = BRIGHT;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
        spr(E_SPR, E_COLS, this.x, this.y, this.ps, true);
        for (let i = 0; i < this.maxHp; i++) {
            ctx.fillStyle = i < this.hp ? BRIGHT : DARK;
            ctx.fillRect(this.x + i * 7, this.y - 7, 6, 3);
        }
        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
}

// ── MINI ENEMY (spawned alongside boss) ──────────────────────────
class MiniEnemy {
    constructor(wave) {
        this.ps  = Math.max(1, Math.floor(Math.min(W, H) / 140)); // smaller
        this.pw  = E_SPR[0].length;
        this.ph  = E_SPR.length;
        this.w   = this.pw * this.ps;
        this.h   = this.ph * this.ps;
        this.x   = 10 + Math.random() * (W - this.w - 20);
        this.y   = -this.h - 5;
        this.vy  = 1.5 + Math.random() * 1.0 + wave * 0.1;
        this.hp  = 1;
        this.sTmr  = 40 + Math.random() * 60;
        this.sRate = Math.max(60, 100 - wave * 3);
        this.bullets = [];
        this.flash = 0;
    }
    tick() {
        this.y += this.vy;
        this.sTmr++;
        if (this.sTmr >= this.sRate) {
            this.bullets.push(new EBullet(this.cx(), this.cy(), 0, 4.0));
            SND.eShoot();
            this.sTmr = 0;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
        if (this.flash > 0) this.flash--;
    }
    hit() { this.flash = 5; return true; } // one-shot
    gone() { return this.y > H + 10; }
    draw() {
        if (this.flash > 0) {
            ctx.globalAlpha = 0.6; ctx.fillStyle = BRIGHT;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
        spr(E_SPR, E_COLS, this.x, this.y, this.ps, true);
        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
}

// ── BOSS ─────────────────────────────────────────────────────────
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
        this.sTmr   = 0;
        this.sPhase = 0;
        this.mDir   = 1;
        this.mTmr   = 0;
        this.phase  = 0;
        this.flash  = 0;
        this.t      = 0;
        this.miniSpawnT = 0;
        // burst-pause pattern
        this.burstCount = 0;
        this.burstMax   = 4;     // 4 shots per burst
        this.pauseTimer = 0;
        this.PAUSE_DUR  = 80;    // ~1.3 sec pause
    }
    tick(px, py) {
        this.t++; if (this.flash > 0) this.flash--;

        if (this.phase === 0) {
            this.y += 3;
            if (this.y >= this.targetY) { this.y = this.targetY; this.phase = 1; }
            return null;
        }
        if (this.hp < this.maxHp * 0.4 && this.phase < 2) this.phase = 2;

        this.mTmr++;
        if (this.mTmr > 75) { this.mDir *= -1; this.mTmr = 0; }
        this.x += this.mDir * 1.5;
        this.x = Math.max(0, Math.min(W - this.w, this.x));

        // burst-pause shoot logic
        if (this.pauseTimer > 0) {
            this.pauseTimer--;
        } else {
            this.sTmr++;
            const rate = this.phase === 2 ? 22 : 38;
            if (this.sTmr >= rate) {
                this.shoot(px, py); this.sTmr = 0; this.sPhase++;
                this.burstCount++;
                if (this.burstCount >= this.burstMax) {
                    this.burstCount = 0;
                    this.pauseTimer = this.PAUSE_DUR; // pause after burst
                }
            }
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });

        // spawn mini enemy every ~100 frames
        this.miniSpawnT++;
        if (this.miniSpawnT >= 100) { this.miniSpawnT = 0; return 'spawnMini'; }
        return null;
    }
    shoot(px, py) {
        const cx = this.cx(), cy = this.y + this.h;
        const spd = 4.5;
        if (this.phase === 2) {
            // enraged: 5-way fan, all pointing downward, spaced 0.22 rad
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI / 2) + (i - 2) * 0.22;
                this.bullets.push(new EBullet(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd));
            }
        } else {
            // normal: aimed double-shot (slight left/right offset)
            const [vx, vy] = aimed(cx, cy, px, py, spd);
            this.bullets.push(new EBullet(cx - 6, cy, vx, vy));
            this.bullets.push(new EBullet(cx + 6, cy, vx, vy));
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
            ctx.globalAlpha = 0.5; ctx.fillStyle = BRIGHT;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
        spr(B_SPR, B_COLS, this.x, this.y, this.ps, true);

        const bw = this.w, bh = 10;
        ctx.fillStyle = DARK; ctx.fillRect(this.x, this.y - 16, bw, bh);
        const frac = Math.max(0, this.hp / this.maxHp);
        ctx.fillStyle = frac > 0.5 ? BRIGHT : frac > 0.25 ? '#cc8800' : '#cc3300';
        ctx.fillRect(this.x, this.y - 16, Math.round(bw * frac), bh);
        ctx.strokeStyle = DARK; ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - 16, bw, bh);

        ctx.fillStyle = DARK;
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('ALIEN BOSS', this.cx(), this.y - 20);
        ctx.textAlign = 'left';

        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
}

// ── HUD ──────────────────────────────────────────────────────────
const hScore   = document.getElementById('hScore');
const hBest    = document.getElementById('hBest');
const hWave    = document.getElementById('hWave');
const overlay  = document.getElementById('overlay');
const startPn  = document.getElementById('startPanel');
const overPn   = document.getElementById('overPanel');
const oScore   = document.getElementById('oScore');
const oBest    = document.getElementById('oBest');
const bossWarn = document.getElementById('bossWarn');

function drawHUD(score, wave, player) {
    hScore.textContent = 'SCORE: ' + String(score).padStart(5, '0');
    hWave.textContent  = 'WAVE: '  + wave;
    if (!player) return;

    // HP bar bottom-center
    const bw = 120, bh = 12;
    const bx = W/2 - bw/2, by = H - bh - 6;
    ctx.fillStyle = DARK; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = player.hp > 2 ? BRIGHT : '#cc3300';
    ctx.fillRect(bx, by, Math.round(bw * player.hp / player.maxHp), bh);
    ctx.strokeStyle = DARK; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = DARK; ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center'; ctx.fillText('HP', W/2, by + bh - 2); ctx.textAlign = 'left';

    // shield timer bar
    if (player.shield) {
        const sw = Math.round(bw * player.shieldTimer / 300);
        ctx.fillStyle = DARK; ctx.fillRect(bx, by - 18, bw, 10);
        ctx.fillStyle = SHIELD_COL; ctx.fillRect(bx, by - 18, sw, 10);
        ctx.strokeStyle = DARK; ctx.strokeRect(bx, by - 18, bw, 10);
        ctx.fillStyle = DARK; ctx.font = 'bold 7px Courier New';
        ctx.textAlign = 'center'; ctx.fillText('SHIELD', W/2, by - 10); ctx.textAlign = 'left';
    }
    // bullet power timer bar
    if (player.bulletPower) {
        const barY = player.shield ? by - 34 : by - 18;
        const pw = Math.round(bw * player.bulletTimer / 400);
        ctx.fillStyle = DARK; ctx.fillRect(bx, barY, bw, 10);
        ctx.fillStyle = BRIGHT; ctx.fillRect(bx, barY, pw, 10);
        ctx.strokeStyle = DARK; ctx.strokeRect(bx, barY, bw, 10);
        ctx.fillStyle = DARK; ctx.font = 'bold 7px Courier New';
        ctx.textAlign = 'center'; ctx.fillText('POWER', W/2, barY + 8); ctx.textAlign = 'left';
    }
}

// ── GAME STATE ───────────────────────────────────────────────────
let running   = false;
let score     = 0;
let wave      = 1;
let kills     = 0;
let time      = 0;
let hiScore   = parseInt(localStorage.getItem('psHi') || '0');
let bossMode  = false;
let bossTimer = 0;
const BOSS_INT = 1200;

let player, enemies, minis, boss, powerups, spawnT, miniSpawnT;

function initGame() {
    player   = new Player();
    enemies  = []; minis = []; boss = null; powerups = [];
    parts.length = 0; floats.length = 0;
    score    = 0; wave = 1; kills = 0; time = 0;
    bossMode = false; bossTimer = 0; spawnT = 0; miniSpawnT = 0;
    running  = true;
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

const tL = document.getElementById('touchLeft');
const tR = document.getElementById('touchRight');
const tF = document.getElementById('touchFire');
tL.addEventListener('touchstart', e => { e.preventDefault(); inp.left  = true;  if (!running) startGame(); }, {passive:false});
tL.addEventListener('touchend',   e => { e.preventDefault(); inp.left  = false; }, {passive:false});
tR.addEventListener('touchstart', e => { e.preventDefault(); inp.right = true;  if (!running) startGame(); }, {passive:false});
tR.addEventListener('touchend',   e => { e.preventDefault(); inp.right = false; }, {passive:false});
tF.addEventListener('touchstart', e => { e.preventDefault(); inp.fire  = true;  if (!running) startGame(); }, {passive:false});
tF.addEventListener('touchend',   e => { e.preventDefault(); inp.fire  = false; }, {passive:false});
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
window.startGame = startGame;

function gameOver() {
    running = false;
    SND.stopMusic();
    if (score > hiScore) { hiScore = score; localStorage.setItem('psHi', hiScore); }
    hBest.textContent  = 'BEST: ' + String(hiScore).padStart(5, '0');
    oScore.textContent = 'SCORE: ' + score;
    oBest.textContent  = 'BEST: '  + hiScore;
    startPn.style.display = 'none';
    overPn.style.display  = 'block';
    overlay.classList.remove('hidden');
}

// ── POWERUP DROP ─────────────────────────────────────────────────
function tryDropPowerup(x, y) {
    const r = Math.random();
    if (r < 0.12)       powerups.push(new Powerup(x - 14, y, 'heart'));
    else if (r < 0.20)  powerups.push(new Powerup(x - 14, y, 'shield'));
    else if (r < 0.30)  powerups.push(new Powerup(x - 14, y, 'bullet'));
}

// ── MAIN LOOP ────────────────────────────────────────────────────
function loop() {
    requestAnimationFrame(loop);
    drawBG();
    if (!running) return;

    time++; score++;

    // spawn regular enemies — enforce min horizontal gap between ships
    if (!bossMode) {
        spawnT++;
        const rate = Math.max(50, 90 - wave * 3); // slower spawn = more gaps
        if (spawnT >= rate) {
            const newE = new Enemy(wave);
            // check min spacing of 80px from existing enemies
            const tooClose = enemies.some(e => Math.abs(e.x - newE.x) < 80);
            if (!tooClose) enemies.push(newE);
            if (wave >= 3 && Math.random() < 0.25) {
                const e2 = new Enemy(wave);
                if (!enemies.some(e => Math.abs(e.x - e2.x) < 80)) enemies.push(e2);
            }
            spawnT = 0;
        }
        bossTimer++;
        if (bossTimer >= BOSS_INT) {
            enemies = [];
            boss = new Boss(wave);
            bossMode = true; bossTimer = 0;
            bossWarn.style.display = 'block';
            setTimeout(() => { bossWarn.style.display = 'none'; }, 2500);
            SND.stopMusic(); SND.bossEntry();
        }
    }

    player.tick(inp);

    // ── powerup collisions ──
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.tick();
        if (rects(p, player)) {
            if (p.type === 'heart')        player.addHeart();
            else if (p.type === 'shield')  player.addShield();
            else                           player.addBulletPack();
            powerups.splice(i, 1);
        } else if (p.gone()) {
            powerups.splice(i, 1);
        }
    }

    // ── regular enemy logic ──
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.tick();

        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], e)) {
                player.bullets.splice(j, 1);
                if (e.hit()) {
                    boom(e.cx(), e.cy(), false);
                    tryDropPowerup(e.cx(), e.cy());
                    enemies.splice(i, 1);
                    score += 100 * wave; kills++;
                    if (kills % 8 === 0) { wave++; SND.waveDone(); }
                }
                break;
            }
        }
        if (i >= enemies.length) continue;
        const en = enemies[i]; if (!en) continue;
        for (let j = en.bullets.length - 1; j >= 0; j--) {
            if (rects(en.bullets[j], player)) {
                en.bullets.splice(j, 1);
                if (player.hit()) { gameOver(); return; }
                break;
            }
        }
        if (enemies[i] && rects(enemies[i], player)) {
            if (player.hit()) { gameOver(); return; }
        }
        if (enemies[i] && enemies[i].gone()) enemies.splice(i, 1);
    }

    // ── mini enemy logic (during boss) ──
    for (let i = minis.length - 1; i >= 0; i--) {
        const m = minis[i];
        m.tick();
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], m)) {
                player.bullets.splice(j, 1);
                boom(m.cx(), m.cy(), false);
                tryDropPowerup(m.cx(), m.cy());
                minis.splice(i, 1);
                score += 50 * wave;
                break;
            }
        }
        if (i >= minis.length) continue;
        const mn = minis[i]; if (!mn) continue;
        for (let j = mn.bullets.length - 1; j >= 0; j--) {
            if (rects(mn.bullets[j], player)) {
                mn.bullets.splice(j, 1);
                if (player.hit()) { gameOver(); return; }
                break;
            }
        }
        if (minis[i] && rects(minis[i], player)) {
            if (player.hit()) { gameOver(); return; }
        }
        if (minis[i] && minis[i].gone()) minis.splice(i, 1);
    }

    // ── boss logic ──
    if (bossMode && boss) {
        const result = boss.tick(player.cx(), player.cy());
        if (result === 'spawnMini') minis.push(new MiniEnemy(wave));

        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], boss)) {
                player.bullets.splice(j, 1);
                if (boss.hit()) {
                    boom(boss.cx(), boss.y + boss.h/2, true);
                    boom(boss.cx() - 30, boss.y + boss.h*0.3, true);
                    boom(boss.cx() + 30, boss.y + boss.h*0.6, true);
                    score += 1500 * wave; wave++;
                    SND.waveDone(); SND.startMusic();
                    bossMode = false; boss = null; minis = [];
                    // drop a guaranteed heart on boss kill
                    powerups.push(new Powerup(W/2 - 14, 100, 'heart'));
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
    powerups.forEach(p => p.draw());
    enemies.forEach(e => e.draw());
    minis.forEach(m => m.draw());
    if (boss) boss.draw();
    tickParts();
    tickFloats();
    player.draw();
    drawHUD(score, wave, player);
    hBest.textContent = 'BEST: ' + String(hiScore).padStart(5, '0');
}

// ── BOOT ─────────────────────────────────────────────────────────
initBG();
loop();
