// Vector dimension drawings for each product type.
// drawProduct(p, row, showValues) returns an <svg> string. Shapes are drawn
// roughly to scale from the row's own numbers; labels carry the exact values.
(function(){
let UID = 0;
const num = v => (v==null || v==='') ? null : parseFloat(v);
const boltDia = b => { const m = /M\s*([\d.]+)/i.exec(b||''); return m ? parseFloat(m[1]) : null; };
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v*10)/10;

function Ctx(show){ this.id = ++UID; this.show = show; this.out = []; }
Ctx.prototype.add = function(s){ this.out.push(s); };
Ctx.prototype.lbl = function(letter, val){
  if (this.show && val != null) return `<tspan class="dl">${letter} = </tspan><tspan class="dv">${val}</tspan>`;
  return `<tspan class="dv">${letter}</tspan>`;
};
Ctx.prototype.text = function(x, y, html, anchor){
  this.add(`<text class="t" x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor||'middle'}" dominant-baseline="middle">${html}</text>`);
};
// horizontal dimension: arrows between x1..x2 at height y, extension lines from object points
Ctx.prototype.hdim = function(x1, x2, y, html, y1obj, y2obj, textBelow){
  if (y1obj != null) this.add(`<line class="ex" x1="${r1(x1)}" y1="${r1(y1obj)}" x2="${r1(x1)}" y2="${r1(y + (y>y1obj?6:-6))}"/>`);
  if (y2obj != null) this.add(`<line class="ex" x1="${r1(x2)}" y1="${r1(y2obj)}" x2="${r1(x2)}" y2="${r1(y + (y>y2obj?6:-6))}"/>`);
  this.add(`<line class="dm" x1="${r1(x1)}" y1="${r1(y)}" x2="${r1(x2)}" y2="${r1(y)}" marker-start="url(#ar${this.id})" marker-end="url(#ar${this.id})"/>`);
  this.text((x1+x2)/2, textBelow ? y+17 : y-15, html);
};
// vertical dimension at x between y1..y2; text on 'left' or 'right' of the line
Ctx.prototype.vdim = function(x, y1, y2, html, side, x1obj, x2obj){
  if (x1obj != null) this.add(`<line class="ex" x1="${r1(x1obj)}" y1="${r1(y1)}" x2="${r1(x + (x>x1obj?6:-6))}" y2="${r1(y1)}"/>`);
  if (x2obj != null) this.add(`<line class="ex" x1="${r1(x2obj)}" y1="${r1(y2)}" x2="${r1(x + (x>x2obj?6:-6))}" y2="${r1(y2)}"/>`);
  this.add(`<line class="dm" x1="${r1(x)}" y1="${r1(y1)}" x2="${r1(x)}" y2="${r1(y2)}" marker-start="url(#ar${this.id})" marker-end="url(#ar${this.id})"/>`);
  const tx = side === 'right' ? x + 8 : x - 8;
  this.text(tx, (y1+y2)/2, html, side === 'right' ? 'start' : 'end');
};
// wall-thickness dimension: arrows point inward from outside at a and b (small gap between them)
Ctx.prototype.tdim = function(vertical, at, a, b, html, textX, textY, anchor){
  const L = 24, ar = `marker-end="url(#ar${this.id})"`;
  if (vertical){
    this.add(`<line class="dm" x1="${r1(at)}" y1="${r1(a-L)}" x2="${r1(at)}" y2="${r1(a)}" ${ar}/>`);
    this.add(`<line class="dm" x1="${r1(at)}" y1="${r1(b+L)}" x2="${r1(at)}" y2="${r1(b)}" ${ar}/>`);
  } else {
    this.add(`<line class="dm" x1="${r1(a-L)}" y1="${r1(at)}" x2="${r1(a)}" y2="${r1(at)}" ${ar}/>`);
    this.add(`<line class="dm" x1="${r1(b+L)}" y1="${r1(at)}" x2="${r1(b)}" y2="${r1(at)}" ${ar}/>`);
  }
  this.text(textX, textY, html, anchor||'start');
};
const wallTxt = r => { const w = (parseFloat(r.C) - parseFloat(r.A)) / 2; return isFinite(w) ? String(Math.round(w*100)/100) : null; };
Ctx.prototype.svg = function(w, h, caption){
  const cap = caption ? `<text class="cap" x="${r1(w/2)}" y="${r1(h-12)}" text-anchor="middle">${caption}</text>` : '';
  return `<svg class="dwg" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dimension drawing">`+
    `<defs><marker id="ar${this.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" class="arw"/></marker></defs>`+
    this.out.join('') + cap + `</svg>`;
};

// ---------------- Tube terminal (lug), front + side view ----------------
function lug(p, r, show){
  const c = new Ctx(show);
  const D=num(r.D), C=num(r.C), A=num(r.A), F=num(r.F), B=num(r.B), K=num(r.K), J=num(r.J);
  const G=num(r.G), H=num(r.H), GH = num(r.GH) != null ? num(r.GH) : (G!=null && H!=null ? G+H : null);
  const isSolder = p.kind === 'solder';
  const holeMm = isSolder ? num(r.E) : boltDia(r.bolt);
  const s = 430 / J;
  const Dw = Math.max(D*s, 50), Cw = Math.max(C*s, 30), Aw = Math.min(A*s, Cw-8), Fw = clamp(F*s, 5, 40);
  const Dmax = Math.max(Dw, Cw);
  const xv = 126, cx = xv + 34 + Dmax/2;
  const y0 = 64, y1 = y0 + GH*s, y2 = y1 + K*s, y3 = y2 + B*s;
  let yHole = G != null ? y0 + G*s : y0 + Math.min(Dw/2, GH*s*0.45);
  const ry = Math.min(Dw/2, yHole - y0);
  const hr = holeMm ? Math.min(holeMm*s/2, Dw*0.36, (y1-yHole)*0.7, (yHole-y0)*0.85) : Math.min(Dw*0.25, (yHole-y0)*0.7);
  // body
  c.add(`<path class="body" d="M${r1(cx-Dw/2)},${r1(y1)} L${r1(cx-Dw/2)},${r1(y0+ry)} A${r1(Dw/2)},${r1(ry)} 0 0 1 ${r1(cx+Dw/2)},${r1(y0+ry)} L${r1(cx+Dw/2)},${r1(y1)} L${r1(cx+Cw/2)},${r1(y2)} L${r1(cx+Cw/2)},${r1(y3)} L${r1(cx-Cw/2)},${r1(y3)} L${r1(cx-Cw/2)},${r1(y2)} Z"/>`);
  c.add(`<line class="thin" x1="${r1(cx-Dw/2)}" y1="${r1(y1)}" x2="${r1(cx+Dw/2)}" y2="${r1(y1)}"/>`);
  c.add(`<line class="thin" x1="${r1(cx-Cw/2)}" y1="${r1(y2)}" x2="${r1(cx+Cw/2)}" y2="${r1(y2)}"/>`);
  // bore (hidden lines)
  const yb = y2 - K*s*0.6;
  c.add(`<path class="hid" d="M${r1(cx-Aw/2)},${r1(y3)} L${r1(cx-Aw/2)},${r1(yb)} M${r1(cx+Aw/2)},${r1(y3)} L${r1(cx+Aw/2)},${r1(yb)}"/>`);
  // hole + centre lines
  c.add(`<circle class="hole" cx="${r1(cx)}" cy="${r1(yHole)}" r="${r1(hr)}"/>`);
  c.add(`<path class="ctr" d="M${r1(cx-Dw/2-10)},${r1(yHole)} L${r1(cx+Dw/2+10)},${r1(yHole)} M${r1(cx)},${r1(y0-10)} L${r1(cx)},${r1(y3+10)}"/>`);
  const holeTxt = isSolder ? c.lbl('øE', r.E) : c.lbl('E', r.bolt || (show ? '—' : null));
  c.text(cx, Math.min(yHole + hr + 18, y1 - 10), holeTxt);
  // dims: D on top
  c.hdim(cx-Dw/2, cx+Dw/2, 30, c.lbl('D', r.D), y0+ry, y0+ry);
  // chain on the left
  const xl = cx - Dmax/2;
  if (G != null && H != null){
    c.vdim(xv, y0, yHole, c.lbl('G', r.G), 'left', cx, null);
    c.vdim(xv, yHole, y1, c.lbl('H', r.H), 'left', null, cx-Dw/2);
  } else {
    c.vdim(xv, y0, y1, c.lbl('G+H', r.GH), 'left', cx, cx-Dw/2);
  }
  c.vdim(xv, y1, y2, c.lbl('K', r.K), 'left', null, cx-Cw/2);
  c.vdim(xv, y2, y3, c.lbl('B', r.B), 'left', null, cx-Cw/2);
  // total J on the right
  const xj = cx + Dmax/2 + 26;
  c.vdim(xj, y0, y3, c.lbl('J', r.J), 'right', cx, cx+Cw/2);
  // diameters below
  c.hdim(cx-Cw/2, cx+Cw/2, y3+34, c.lbl('øC', r.C), y3, y3);
  c.hdim(cx-Aw/2, cx+Aw/2, y3+78, c.lbl('øA', r.A), y3, y3);
  // side view
  const sx = xj + 140;
  c.add(`<path class="body" d="M${r1(sx)},${r1(y0+Fw/2)} A${r1(Fw/2)},${r1(Fw/2)} 0 0 1 ${r1(sx+Fw)},${r1(y0+Fw/2)} L${r1(sx+Fw)},${r1(y1)} L${r1(sx+Cw)},${r1(y2)} L${r1(sx+Cw)},${r1(y3)} L${r1(sx)},${r1(y3)} Z"/>`);
  const sa = sx + (Cw-Aw)/2;
  c.add(`<path class="hid" d="M${r1(sa)},${r1(y3)} L${r1(sa)},${r1(yb)} M${r1(sa+Aw)},${r1(y3)} L${r1(sa+Aw)},${r1(yb)}"/>`);
  c.add(`<line class="thin" x1="${r1(sx)}" y1="${r1(y2)}" x2="${r1(sx+Cw)}" y2="${r1(y2)}"/>`);
  c.hdim(sx, sx+Fw, 30, c.lbl('F', r.F), y0+Fw/2, y0+Fw/2);
  c.text(cx, y3+112, '<tspan class="vw">FRONT VIEW</tspan>');
  c.text(sx+Cw/2, y3+112, '<tspan class="vw">SIDE VIEW</tspan>');
  // wall thickness at barrel mouth (side view)
  c.add(`<line class="ex" x1="${r1(sa+Aw)}" y1="${r1(y3)}" x2="${r1(sa+Aw)}" y2="${r1(y3+44)}"/><line class="ex" x1="${r1(sx+Cw)}" y1="${r1(y3)}" x2="${r1(sx+Cw)}" y2="${r1(y3+44)}"/>`);
  c.tdim(false, y3+38, sa+Aw, sx+Cw, c.lbl('T', wallTxt(r)), sx+Cw+30, y3+38);
  return c.svg(Math.max(sx + Cw + 140, sx + Fw/2 + 80), y3 + 134);
}

// ---------------- In-line connector (plain tube) ----------------
function inline(p, r, show){
  const c = new Ctx(show);
  const C=num(r.C), A=num(r.A), J=num(r.J);
  const s = 420 / J;
  const Cw = clamp(C*s, 46, 170), Aw = Cw * A / C;
  const x0 = 30, L = J*s, ym = 40 + Cw/2;
  c.add(`<rect class="body" x="${x0}" y="${r1(ym-Cw/2)}" width="${r1(L)}" height="${r1(Cw)}"/>`);
  c.add(`<path class="hid" d="M${x0},${r1(ym-Aw/2)} L${r1(x0+L)},${r1(ym-Aw/2)} M${x0},${r1(ym+Aw/2)} L${r1(x0+L)},${r1(ym+Aw/2)}"/>`);
  c.add(`<line class="ctr" x1="${x0-12}" y1="${r1(ym)}" x2="${r1(x0+L+12)}" y2="${r1(ym)}"/>`);
  c.vdim(x0 + L*0.22, ym-Aw/2, ym+Aw/2, c.lbl('øA', r.A), 'right');
  c.vdim(x0 + L + 26, ym-Cw/2, ym+Cw/2, c.lbl('øC', r.C), 'right', x0+L, x0+L);
  const xt = x0 + L*0.62;
  c.tdim(true, xt, ym+Aw/2, ym+Cw/2, c.lbl('T', wallTxt(r)), xt + 10, ym + Cw/2 + 15);
  c.hdim(x0, x0+L, ym + Cw/2 + 46, c.lbl('J', r.J), ym+Cw/2, ym+Cw/2, true);
  return c.svg(x0 + L + 150, ym + Cw/2 + 92);
}

// ---------------- Reducer (barrel + pin) ----------------
function reducer(p, r, show){
  const c = new Ctx(show);
  const C=num(r.C), A=num(r.A), D=num(r.D), D1=num(r.D1), B=num(r.B), K=num(r.K), GH=num(r.GH), J=num(r.J);
  const s = 400 / J;
  const Cw = clamp(C*s, 46, 150), k = Cw / C, Aw = A*k, Dw = D*k;
  const x0 = 136, ym = 46 + Cw/2;
  const xb = x0 + B*s, xk = xb + K*s, xe = xk + GH*s;
  c.add(`<path class="body" d="M${x0},${r1(ym-Cw/2)} L${r1(xb)},${r1(ym-Cw/2)} L${r1(xk)},${r1(ym-Dw/2)} L${r1(xe)},${r1(ym-Dw/2)} L${r1(xe)},${r1(ym+Dw/2)} L${r1(xk)},${r1(ym+Dw/2)} L${r1(xb)},${r1(ym+Cw/2)} L${x0},${r1(ym+Cw/2)} Z"/>`);
  c.add(`<path class="thin" d="M${r1(xb)},${r1(ym-Cw/2)} L${r1(xb)},${r1(ym+Cw/2)} M${r1(xk)},${r1(ym-Dw/2)} L${r1(xk)},${r1(ym+Dw/2)}"/>`);
  c.add(`<path class="hid" d="M${x0},${r1(ym-Aw/2)} L${r1(xb+K*s*0.3)},${r1(ym-Aw/2)} M${x0},${r1(ym+Aw/2)} L${r1(xb+K*s*0.3)},${r1(ym+Aw/2)}"/>`);
  c.add(`<line class="ctr" x1="${x0-10}" y1="${r1(ym)}" x2="${r1(xe+10)}" y2="${r1(ym)}"/>`);
  c.vdim(x0 - 24, ym-Cw/2, ym+Cw/2, c.lbl('øC', r.C), 'left', x0, x0);
  c.vdim(x0 + B*s*0.3, ym-Aw/2, ym+Aw/2, c.lbl('øA', r.A), 'right');
  const xt = x0 + B*s*0.72;
  c.tdim(true, xt, ym+Aw/2, ym+Cw/2, c.lbl('T', wallTxt(r)), xt + 8, ym + Cw/2 + 14, 'start');
  const yc = ym + Cw/2 + 44;
  c.hdim(x0, xb, yc, c.lbl('B', r.B), ym+Cw/2, ym+Cw/2, true);
  c.hdim(xb, xk, yc + 44, c.lbl('K', r.K), ym+Cw/2, ym+Dw/2, true);
  c.hdim(xk, xe, yc, c.lbl('G+H', r.GH), ym+Dw/2, ym+Dw/2, true);
  c.hdim(x0, xe, yc + 92, c.lbl('J', r.J), yc+6, yc+6, true);
  // pin section with flat
  const R = Math.max(Dw/2, 22), kk = R / (D/2), px = xe + 70 + R, py = ym;
  const xo = R - (D - D1) * kk, h = Math.sqrt(Math.max(R*R - xo*xo, 0));
  c.add(`<path class="body hatch" d="M${r1(px-xo)},${r1(py-h)} A${r1(R)},${r1(R)} 0 1 1 ${r1(px-xo)},${r1(py+h)} Z"/>`);
  c.vdim(px + R + 22, py-R, py+R, c.lbl('øD', r.D), 'right', px, px);
  c.hdim(px-xo, px+R, py + R + 30, c.lbl('D-1', r.D1), py+h, py, true);
  c.text(px, py - R - 16, '<tspan class="vw">PIN SECTION</tspan>');
  return c.svg(px + R + 130, yc + 92 + 50);
}

// ---------------- Pin terminal ----------------
function pin(p, r, show){
  const c = new Ctx(show);
  const C=num(r.C), A=num(r.A), D=num(r.D), B=num(r.B), J=num(r.J);
  const s = 420 / J;
  const Cw = clamp(C*s, 50, 150), k = Cw / C, Aw = A*k, Dw = Math.max(D*k, 8);
  const x0 = 136, ym = 40 + Cw/2, xb = x0 + B*s, xt = xb + Math.min(10, (J-B)*s*0.15), xe = x0 + J*s;
  c.add(`<path class="body" d="M${x0},${r1(ym-Cw/2)} L${r1(xb)},${r1(ym-Cw/2)} L${r1(xt)},${r1(ym-Dw/2)} L${r1(xe)},${r1(ym-Dw/2)} L${r1(xe)},${r1(ym+Dw/2)} L${r1(xt)},${r1(ym+Dw/2)} L${r1(xb)},${r1(ym+Cw/2)} L${x0},${r1(ym+Cw/2)} Z"/>`);
  c.add(`<path class="hid" d="M${x0},${r1(ym-Aw/2)} L${r1(xb)},${r1(ym-Aw/2)} M${x0},${r1(ym+Aw/2)} L${r1(xb)},${r1(ym+Aw/2)}"/>`);
  c.add(`<line class="ctr" x1="${x0-10}" y1="${r1(ym)}" x2="${r1(xe+10)}" y2="${r1(ym)}"/>`);
  c.vdim(x0 - 24, ym-Cw/2, ym+Cw/2, c.lbl('øC', r.C), 'left', x0, x0);
  c.vdim(x0 + B*s*0.35, ym-Aw/2, ym+Aw/2, c.lbl('øA', r.A), 'right');
  c.vdim(xe + 24, ym-Dw/2, ym+Dw/2, c.lbl('D', r.D), 'right', xe, xe);
  const xw = x0 + B*s*0.75;
  c.tdim(true, xw, ym+Aw/2, ym+Cw/2, c.lbl('T', wallTxt(r)), xw + 8, ym + Cw/2 + 14, 'start');
  const yc = ym + Cw/2 + 44;
  c.hdim(x0, xb, yc, c.lbl('B', r.B), ym+Cw/2, ym+Cw/2, true);
  c.hdim(x0, xe, yc + 46, c.lbl('J', r.J), yc+6, ym+Dw/2, true);
  return c.svg(xe + 130, yc + 96);
}

// ---------------- Ring / fork terminal ----------------
// Catalogue convention: G = ring top to hole centre, L-1 = hole centre to barrel end.
// Sheet thickness for ring / fork terminals. The catalogue does not print it.
// Where the insulated version's øC is given, øC = øA + 2 x thickness, so T = (øC − øA) / 2.
// Otherwise an approximate standard value by cable size is used.
const RING_T_APPROX = {'1':0.8,'1.5':0.8,'2.5':0.8,'4.6':1.0,'4-6':1.0,'10':1.0,'16':1.2,'25':1.5,'35':1.5,'50':2.0,'70':2.0,'95':2.5,'120':2.5,'150':3.0};
window.ringThick = function(r){
  const A = num(r.A), C = num(r.C);
  if (A != null && C != null && C > A) return {t: Math.round((C - A) / 2 * 100) / 100, src: 'cat'};
  const t = RING_T_APPROX[r.size];
  return t == null ? null : {t, src: 'approx'};
};
function ring(p, r, show){
  const c = new Ctx(show);
  const fork = p.id === 'cu-fork';
  const A=num(r.A), D=num(r.D), B=num(r.B), G=num(r.G), L=num(r.L1);
  const th = window.ringThick(r), T = th ? th.t : A*0.25, OD = A + 2*T;
  const tTxt = th ? String(th.t) : null, odTxt = th ? String(Math.round(OD*100)/100) : null;
  const s = 420 / (G + L);
  const Dw = Math.max(D*s, 60), R = Dw/2;
  const Bw = Math.min(Math.max(OD*s, 30), Dw*0.9), Aw = Bw * A / OD, Tw = Math.max(T*s, 5);
  const xv = 126, cx = xv + 44 + R, y0 = 70, yc = y0 + G*s, yEnd = yc + L*s, yB = yEnd - B*s;
  const bm = boltDia(r.bolt), hr = Math.min(bm ? (bm+0.3)*s/2 : R*0.5, R*0.62);
  const ry = Math.min(R, yc - y0);
  let body;
  if (fork) {
    const sw = hr;
    body = `M${r1(cx-Bw/2)},${r1(yEnd)} L${r1(cx-Bw/2)},${r1(yB)} L${r1(cx-R)},${r1(yc)} L${r1(cx-R)},${r1(y0)} L${r1(cx-sw)},${r1(y0)} L${r1(cx-sw)},${r1(yc)} A${r1(sw)},${r1(sw)} 0 0 0 ${r1(cx+sw)},${r1(yc)} L${r1(cx+sw)},${r1(y0)} L${r1(cx+R)},${r1(y0)} L${r1(cx+R)},${r1(yc)} L${r1(cx+Bw/2)},${r1(yB)} L${r1(cx+Bw/2)},${r1(yEnd)} Z`;
  } else {
    body = `M${r1(cx-Bw/2)},${r1(yEnd)} L${r1(cx-Bw/2)},${r1(yB)} L${r1(cx-R)},${r1(yc)} A${r1(R)},${r1(ry)} 0 0 1 ${r1(cx+R)},${r1(yc)} L${r1(cx+Bw/2)},${r1(yB)} L${r1(cx+Bw/2)},${r1(yEnd)} Z`;
  }
  c.add(`<path class="body" d="${body}"/>`);
  if (!fork) c.add(`<circle class="hole" cx="${r1(cx)}" cy="${r1(yc)}" r="${r1(hr)}"/>`);
  c.add(`<line class="thin" x1="${r1(cx-Bw/2)}" y1="${r1(yB)}" x2="${r1(cx+Bw/2)}" y2="${r1(yB)}"/>`);
  c.add(`<path class="hid" d="M${r1(cx-Aw/2)},${r1(yEnd)} L${r1(cx-Aw/2)},${r1(yB)} M${r1(cx+Aw/2)},${r1(yEnd)} L${r1(cx+Aw/2)},${r1(yB)}"/>`);
  c.add(`<path class="ctr" d="M${r1(cx-R-12)},${r1(yc)} L${r1(cx+R+40)},${r1(yc)} M${r1(cx)},${r1(y0-10)} L${r1(cx)},${r1(yEnd+10)}"/>`);
  c.hdim(cx-R, cx+R, 32, c.lbl('D', r.D), yc, yc);
  c.vdim(xv, y0, yc, c.lbl('G', r.G), 'left', cx, cx-R);
  c.vdim(xv, yB, yEnd, c.lbl('B', r.B), 'left', cx-Bw/2, cx-Bw/2);
  const xl = cx + R + 30;
  c.vdim(xl, yc, yEnd, c.lbl('L-1', r.L1), 'right', null, cx+Bw/2);
  c.hdim(cx-Aw/2, cx+Aw/2, yEnd + 36, c.lbl('øA', r.A), yEnd, yEnd, true);
  c.text(cx, fork ? (y0 + yc)/2 : yc, c.lbl('E', r.bolt));
  // side view: flat sheet (thickness T) bending into the barrel (outer dia OD)
  const sx = xl + 150;
  c.add(`<path class="body" d="M${r1(sx)},${r1(y0)} L${r1(sx+Tw)},${r1(y0)} L${r1(sx+Tw)},${r1(Math.max(yB-Bw*0.5, y0+10))} Q${r1(sx+Tw)},${r1(yB)} ${r1(sx+Bw)},${r1(yB)} L${r1(sx+Bw)},${r1(yEnd)} L${r1(sx)},${r1(yEnd)} Z"/>`);
  const sa = sx + (Bw-Aw)/2;
  c.add(`<path class="hid" d="M${r1(sa)},${r1(yEnd)} L${r1(sa)},${r1(yB)} M${r1(sa+Aw)},${r1(yEnd)} L${r1(sa+Aw)},${r1(yB)}"/>`);
  c.add(`<line class="ex" x1="${r1(sx)}" y1="${r1(y0)}" x2="${r1(sx)}" y2="${r1(26)}"/><line class="ex" x1="${r1(sx+Tw)}" y1="${r1(y0)}" x2="${r1(sx+Tw)}" y2="${r1(26)}"/>`);
  c.tdim(false, 32, sx, sx+Tw, c.lbl('T', tTxt ? tTxt + ' ≈' : null), sx+Tw+30, 32);
  c.hdim(sx, sx+Bw, yEnd + 36, c.lbl('øOD', odTxt ? odTxt + ' ≈' : null), yEnd, yEnd, true);
  c.text(cx, yEnd + 92, '<tspan class="vw">FRONT VIEW</tspan>');
  c.text(sx + Bw/2, yEnd + 92, '<tspan class="vw">SIDE VIEW</tspan>');
  return c.svg(sx + Math.max(Bw, Tw + 150) + 40, yEnd + 112);
}

const KIND = {lug, solder: lug, inline, reducer, pin, ring, ringbig: ring};
// Pick a mid-range row for the generic (letters-only) drawing.
window.drawProduct = function(p, row, show){
  const r = row || p.rows[Math.floor(p.rows.length * 0.45)];
  return KIND[p.kind](p, r, !!(show && row));
};
})();
