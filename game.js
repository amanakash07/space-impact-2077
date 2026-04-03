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
const SHIELD_COL = BRIGHT;   // lime green shield
const HEART_COL  = BRIGHT;

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
// Player — 12 wide × 14 tall — proper fighter jet, sharp nose, wide delta wings
// 1=dark outline  2=body  3=cockpit/highlight
const P_SPR = [
    [0,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,1,2,2,1,0,0,0,0],
    [0,0,0,0,1,3,3,1,0,0,0,0],
    [0,0,0,1,1,2,2,1,1,0,0,0],
    [0,0,1,1,2,2,2,2,1,1,0,0],
    [0,1,1,2,2,2,2,2,2,1,1,0],
    [1,1,2,2,2,2,2,2,2,2,1,1],
    [1,2,2,1,2,2,2,2,1,2,2,1],
    [1,1,2,1,1,2,2,1,1,2,1,1],
    [0,1,1,1,1,2,2,1,1,1,1,0],
    [0,0,0,1,1,2,2,1,1,0,0,0],
    [0,0,0,0,1,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0],
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

// Laser enemy — 8 wide × 8 tall — sleek narrow, front cannon
// 1=dark  2=body  3=laser emitter (bright)
const EL_SPR = [
    [0,0,1,1,1,1,0,0],
    [0,1,2,3,3,2,1,0],
    [1,1,2,2,2,2,1,1],
    [1,2,3,2,2,3,2,1],
    [1,2,3,2,2,3,2,1],
    [1,1,2,2,2,2,1,1],
    [0,0,1,2,2,1,0,0],
    [0,0,0,1,1,0,0,0],
];
const EL_COLS = [DARK, ACC, BRIGHT];

// Fire enemy — 10 wide × 9 tall — fat hulk with flame vents
// 1=dark  2=body  3=mid  4=fire orange
const EF_SPR = [
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,1,2,3,2,2,3,2,1,0],
    [1,2,4,4,2,2,4,4,2,1],
    [1,2,4,4,2,2,4,4,2,1],
    [1,2,3,2,2,2,2,3,2,1],
    [0,1,2,2,2,2,2,2,1,0],
    [0,1,1,2,2,2,2,1,1,0],
    [0,0,1,1,0,0,1,1,0,0],
];
const EF_COLS = [DARK, MID, ACC, '#cc5500'];

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
        // bright orange-red — clearly visible against any background
        ctx.fillStyle = '#ff5500'; ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#ffaa00'; ctx.fillRect(this.x+1, this.y, this.w-2, 4);
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
        this.bulletPower = false;
        this.bulletTimer = 0;
        this.ammo    = 60;   // starts full
        this.maxAmmo = 60;
    }
    tick(inp) {
        let dx = 0;
        if (inp.left)  dx = -1;
        if (inp.right) dx =  1;
        this.x = Math.max(0, Math.min(W - this.w, this.x + dx * this.spd));

        this.sCool--;
        const canFire = this.bulletPower || this.ammo > 0; // endless during power
        if (inp.fire && this.sCool <= 0 && canFire) {
            if (this.bulletPower) {
                this.bullets.push(new PBullet(this.x + this.w/2, this.y, true));
                this.bullets.push(new PBullet(this.x + this.w/2 - 14, this.y + 8, true));
                this.bullets.push(new PBullet(this.x + this.w/2 + 14, this.y + 8, true));
                // no ammo drain during power mode
            } else {
                this.bullets.push(new PBullet(this.x + this.w/2, this.y, false));
                this.ammo = Math.max(0, this.ammo - 1); // drain ammo
            }
            SND.shoot();
            this.sCool = 10;
        }
        this.bullets = this.bullets.filter(b => { b.tick(); return b.alive(); });
        if (this.inv > 0) this.inv--;
        if (this.shieldTimer > 0) this.shieldTimer--;
        else this.shield = false;
        if (this.bulletTimer > 0) {
            this.bulletTimer--;
        } else if (this.bulletPower) {
            // power just expired — refill ammo to full
            this.bulletPower = false;
            this.ammo = this.maxAmmo;
            floatText(this.cx(), this.y - 20, 'AMMO FULL', BRIGHT);
        }
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
        if (this.hp <= 0) SND.hit();  // crash sound only on death
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
        this.bulletPower = true; this.bulletTimer = 400;
        this.ammo = this.maxAmmo; // also refills ammo
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

        // health pickup — 3 glowing + signs gently rising above ship
        if (this.plusAnim > 0) {
            const prog = this.plusAnim / 80;
            ctx.globalAlpha = prog;
            ctx.fillStyle = HEART_COL;
            const offsets = [-18, 0, 18];
            offsets.forEach(ox => {
                const px = this.cx() + ox;
                const py = this.y - 10 - (1 - prog) * 30; // rise upward
                ctx.fillRect(px - 5, py - 1, 10, 3);
                ctx.fillRect(px - 1, py - 5, 3, 10);
            });
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
        this.vy  = 0.9 + Math.random() * 0.7 + wave * 0.10;
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

// ── MINI ENEMY (spawned alongside boss — looks like tiny boss) ───
class MiniEnemy {
    constructor(wave) {
        this.ps  = Math.max(1, Math.floor(Math.min(W, H) / 160)); // tiny boss scale
        this.pw  = B_SPR[0].length;
        this.ph  = B_SPR.length;
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
        spr(B_SPR, B_COLS, this.x, this.y, this.ps, true);
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
        this.hp = 80 + wave * 20;
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
        this.burstMax   = 3;     // 3 shots then pause
        this.pauseTimer = 0;
        this.PAUSE_DUR  = 120;   // ~2 sec full pause — clear dodge window
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
            const rate = this.phase === 2 ? 35 : 55; // slower fire rate inside burst
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
        const spd = 3.5; // slower = more time to dodge
        if (this.phase === 2) {
            // enraged: 3-way with BIG gaps (0.55 rad each side) — player fits between
            for (let i = 0; i < 3; i++) {
                const a = (Math.PI / 2) + (i - 1) * 0.55;
                this.bullets.push(new EBullet(cx, cy, Math.cos(a) * spd, Math.sin(a) * spd));
            }
        } else {
            // normal: single aimed shot — dodge left or right
            const [vx, vy] = aimed(cx, cy, px, py, spd);
            this.bullets.push(new EBullet(cx, cy, vx, vy));
        }
        
    }
    hit() {
        this.hp--; this.flash = 7;
        if (Math.random() < 0.35)
            boom(this.x + this.w * Math.random(), this.y + this.h * Math.random(), false);
        
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

// ── LASER BULLET — thin fast beam ───────────────────────────────
class LaserBullet {
    constructor(x, y) { this.x = x - 1; this.y = y; this.w = 3; this.h = 28; this.vy = 9; }
    tick() { this.y += this.vy; }
    draw() {
        ctx.fillStyle = BRIGHT;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#d4f06b';
        ctx.fillRect(this.x - 1, this.y, this.w + 2, 4);
        ctx.globalAlpha = 1;
    }
    alive() { return this.y < H + 30; }
}

// ── FIRE BULLET — wide slow fire blob ────────────────────────────
class FireBullet {
    constructor(x, y) {
        this.x = x - 8; this.y = y; this.w = 16; this.h = 16; this.vy = 2.5; this.t = 0;
    }
    tick() { this.y += this.vy; this.t++; }
    draw() {
        ctx.globalAlpha = 0.85 + Math.sin(this.t * 0.4) * 0.15;
        ctx.fillStyle = '#cc5500';
        ctx.fillRect(this.x + 3, this.y, this.w - 6, this.h);
        ctx.fillRect(this.x, this.y + 4, this.w, this.h - 8);
        ctx.fillStyle = BRIGHT;
        ctx.fillRect(this.x + 5, this.y + 4, this.w - 10, this.h - 8);
        ctx.globalAlpha = 1;
    }
    alive() { return this.y < H + 20; }
}

// ── LASER ENEMY — drops heart on kill ────────────────────────────
class LaserEnemy {
    constructor(wave) {
        this.ps  = Math.max(2, Math.floor(Math.min(W, H) / 90));
        this.pw  = EL_SPR[0].length;
        this.ph  = EL_SPR.length;
        this.w   = this.pw * this.ps;
        this.h   = this.ph * this.ps;
        this.x   = 10 + Math.random() * (W - this.w - 20);
        this.y   = -this.h - 5;
        this.vy  = 0.9 + Math.random() * 0.6 + wave * 0.08;
        this.hp  = 2 + Math.floor(wave / 4);
        this.maxHp = this.hp;
        this.sTmr  = 50 + Math.random() * 80;
        this.sRate = Math.max(70, 130 - wave * 3);
        this.bullets = [];
        this.flash = 0;
    }
    tick() {
        this.y += this.vy;
        this.sTmr++;
        if (this.sTmr >= this.sRate) {
            this.bullets.push(new LaserBullet(this.cx(), this.cy()));
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
            ctx.fillRect(this.x, this.y, this.w, this.h); ctx.globalAlpha = 1;
        }
        spr(EL_SPR, EL_COLS, this.x, this.y, this.ps, true);
        for (let i = 0; i < this.maxHp; i++) {
            ctx.fillStyle = i < this.hp ? BRIGHT : DARK;
            ctx.fillRect(this.x + i * 7, this.y - 7, 6, 3);
        }
        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
}

// ── FIRE ENEMY — drops ammo on kill ──────────────────────────────
class FireEnemy {
    constructor(wave) {
        this.ps  = Math.max(2, Math.floor(Math.min(W, H) / 85));
        this.pw  = EF_SPR[0].length;
        this.ph  = EF_SPR.length;
        this.w   = this.pw * this.ps;
        this.h   = this.ph * this.ps;
        this.x   = 10 + Math.random() * (W - this.w - 20);
        this.y   = -this.h - 5;
        this.vy  = 0.8 + Math.random() * 0.5 + wave * 0.06;
        this.hp  = 3 + Math.floor(wave / 3);
        this.maxHp = this.hp;
        this.sTmr  = 40 + Math.random() * 70;
        this.sRate = Math.max(80, 150 - wave * 4);
        this.bullets = [];
        this.flash = 0;
        this.flameT = 0;
    }
    tick() {
        this.y += this.vy; this.flameT++;
        this.sTmr++;
        if (this.sTmr >= this.sRate) {
            this.bullets.push(new FireBullet(this.cx(), this.cy()));
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
            ctx.fillRect(this.x, this.y, this.w, this.h); ctx.globalAlpha =1;
        }
        // flame flicker below ship
        ctx.globalAlpha = 0.7 + Math.sin(this.flameT * 0.3) * 0.2;
        ctx.fillStyle = '#cc5500';
        const fw = this.w * 0.3, fx1 = this.x + this.w * 0.1, fx2 = this.x + this.w * 0.62;
        const fh = (this.flameT % 6 < 3) ? this.ps * 3 : this.ps * 2;
        ctx.fillRect(fx1, this.y + this.h, fw, fh);
        ctx.fillRect(fx2, this.y + this.h, fw, fh);
        ctx.globalAlpha = 1;
        spr(EF_SPR, EF_COLS, this.x, this.y, this.ps, true);
        for (let i = 0; i < this.maxHp; i++) {
            ctx.fillStyle = i < this.hp ? BRIGHT : DARK;
            ctx.fillRect(this.x + i * 7, this.y - 7, 6, 3);
        }
        this.bullets.forEach(b => b.draw());
    }
    cx() { return this.x + this.w / 2; }
    cy() { return this.y + this.h / 2; }
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

    // ── All bars at the TOP, centered ──────────────────────────────
    const bw = 140, bh = 11, bx = W/2 - bw/2;
    const gap = 16; // vertical gap between bars
    let barY = 34;  // start just below score row

    function drawBar(label, frac, col, warn) {
        ctx.fillStyle = '#0a1a05';
        ctx.fillRect(bx, barY, bw, bh);
        ctx.fillStyle = warn ? '#cc3300' : col;
        ctx.fillRect(bx, barY, Math.round(bw * Math.max(0, frac)), bh);
        ctx.strokeStyle = DARK; ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, barY, bw, bh);
        ctx.fillStyle = DARK; ctx.font = 'bold 8px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(label, W/2, barY + bh - 2);
        ctx.textAlign = 'left';
        barY += gap;
    }

    // HP bar — always shown
    drawBar('HP', player.hp / player.maxHp, BRIGHT, player.hp <= 2);

    // AMMO bar — always shown; flashes red when low
    const ammoFrac = player.bulletPower ? 1 : player.ammo / player.maxAmmo;
    const ammoLow  = !player.bulletPower && player.ammo <= 10;
    drawBar(player.bulletPower ? 'ENDLESS' : 'AMMO', ammoFrac, player.bulletPower ? '#d4f06b' : BRIGHT, ammoLow);

    // SHIELD timer bar — only when active
    if (player.shield) {
        drawBar('SHIELD', player.shieldTimer / 300, SHIELD_COL, false);
    }

    // POWER timer bar — only when active
    if (player.bulletPower) {
        drawBar('POWER', player.bulletTimer / 400, '#d4f06b', false);
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

let player, enemies, lasers, fires, minis, boss, powerups, spawnT, lSpawnT, fSpawnT;

function initGame() {
    player   = new Player();
    enemies  = []; lasers = []; fires = []; minis = []; boss = null; powerups = [];
    parts.length = 0; floats.length = 0;
    score    = 0; wave = 1; kills = 0; time = 0;
    bossMode = false; bossTimer = 0; spawnT = 0; lSpawnT = 0; fSpawnT = 0;
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

    // spawn enemies — enforce min 80px gap between ships
    if (!bossMode) {
        // regular jet
        spawnT++;
        const rate = Math.max(50, 90 - wave * 3);
        if (spawnT >= rate) {
            const newE = new Enemy(wave);
            if (!enemies.some(e => Math.abs(e.x - newE.x) < 80)) enemies.push(newE);
            if (wave >= 3 && Math.random() < 0.25) {
                const e2 = new Enemy(wave);
                if (!enemies.some(e => Math.abs(e.x - e2.x) < 80)) enemies.push(e2);
            }
            spawnT = 0;
        }
        // laser enemy — spawns from wave 2
        if (wave >= 2) {
            lSpawnT++;
            if (lSpawnT >= Math.max(180, 320 - wave * 15)) {
                lasers.push(new LaserEnemy(wave)); lSpawnT = 0;
            }
        }
        // fire enemy — spawns from wave 3
        if (wave >= 3) {
            fSpawnT++;
            if (fSpawnT >= Math.max(220, 380 - wave * 15)) {
                fires.push(new FireEnemy(wave)); fSpawnT = 0;
            }
        }
        bossTimer++;
        if (bossTimer >= BOSS_INT) {
            enemies = []; lasers = []; fires = [];
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

    // ── laser enemy logic ──
    for (let i = lasers.length - 1; i >= 0; i--) {
        const e = lasers[i];
        e.tick();
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], e)) {
                player.bullets.splice(j, 1);
                if (e.hit()) {
                    boom(e.cx(), e.cy(), false);
                    powerups.push(new Powerup(e.cx() - 14, e.cy(), 'heart')); // guaranteed heart
                    lasers.splice(i, 1); score += 200 * wave; kills++;
                    if (kills % 8 === 0) { wave++; SND.waveDone(); }
                }
                break;
            }
        }
        if (i >= lasers.length) continue;
        const le = lasers[i]; if (!le) continue;
        for (let j = le.bullets.length - 1; j >= 0; j--) {
            if (rects(le.bullets[j], player)) {
                le.bullets.splice(j, 1);
                if (player.hit()) { gameOver(); return; }
                break;
            }
        }
        if (lasers[i] && rects(lasers[i], player)) { if (player.hit()) { gameOver(); return; } }
        if (lasers[i] && lasers[i].gone()) lasers.splice(i, 1);
    }

    // ── fire enemy logic ──
    for (let i = fires.length - 1; i >= 0; i--) {
        const e = fires[i];
        e.tick();
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], e)) {
                player.bullets.splice(j, 1);
                if (e.hit()) {
                    boom(e.cx(), e.cy(), false);
                    powerups.push(new Powerup(e.cx() - 14, e.cy(), 'bullet')); // guaranteed ammo
                    fires.splice(i, 1); score += 200 * wave; kills++;
                    if (kills % 8 === 0) { wave++; SND.waveDone(); }
                }
                break;
            }
        }
        if (i >= fires.length) continue;
        const fe = fires[i]; if (!fe) continue;
        for (let j = fe.bullets.length - 1; j >= 0; j--) {
            if (rects(fe.bullets[j], player)) {
                fe.bullets.splice(j, 1);
                if (player.hit()) { gameOver(); return; }
                break;
            }
        }
        if (fires[i] && rects(fires[i], player)) { if (player.hit()) { gameOver(); return; } }
        if (fires[i] && fires[i].gone()) fires.splice(i, 1);
    }

    // ── mini enemy logic (during boss) ──
    for (let i = minis.length - 1; i >= 0; i--) {
        const m = minis[i];
        m.tick();
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            if (rects(player.bullets[j], m)) {
                player.bullets.splice(j, 1);
                boom(m.cx(), m.cy(), false);
                // Always drop bullet pack during boss fight; every 3rd mini also drops a heart
                powerups.push(new Powerup(m.cx() - 14, m.cy(), 'bullet'));
                if (score % 3 === 0) powerups.push(new Powerup(m.cx() + 4, m.cy(), 'heart'));
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
                    lasers = []; fires = [];
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
    lasers.forEach(e => e.draw());
    fires.forEach(e => e.draw());
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
