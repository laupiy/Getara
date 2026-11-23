// Helper proyeksi isometrik untuk ilustrasi SVG (tanpa library).
// Koordinat dunia: x ke kanan-bawah, y ke kiri-bawah, z ke atas. Satuan = "unit".

export const ISO = { s: 20, ox: 212, oy: 8 };
const C30 = 0.866;

export function iso(x, y, z = 0, o = ISO) {
  return [o.ox + (x - y) * o.s * C30, o.oy + (x + y) * o.s * 0.5 - z * o.s];
}

export const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/** Tiga sisi kotak yang terlihat: atas, kiri-depan (y = y+d), kanan-depan (x = x+w). */
export function box(x, y, z, w, d, h) {
  return {
    top: pts([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]),
    left: pts([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]),
    right: pts([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)]),
  };
}

/** Transform SVG untuk menggambar di bidang tegak y = konstan (u → x, v → z). */
export function planeY(x, y, z, o = ISO) {
  const [e, f] = iso(x, y, z, o);
  return `matrix(${C30 * o.s} ${0.5 * o.s} 0 ${-o.s} ${e} ${f})`;
}

function ring(x, y, z, r, n = 48) {
  const out = [];
  for (let i = 0; i <= n; i += 1) {
    const t = (i / n) * 2 * Math.PI;
    out.push(iso(x, y + r * Math.cos(t), z + r * Math.sin(t)));
  }
  return out;
}

/** Path lingkaran pada bidang x = konstan (dipakai untuk lintasan animasi). */
export function ringPath(x, y, z, r) {
  const p = ring(x, y, z, r);
  return `M${p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L')}Z`;
}

/** Silinder dengan sumbu sejajar x (badan motor, poros, piringan). */
export function cylinderX(x0, x1, y, z, r) {
  const back = ring(x0, y, z, r);
  const front = ring(x1, y, z, r);
  const proj = (p) => -0.5 * p[0] + C30 * p[1]; // tegak lurus arah sumbu di layar
  let lo = 0;
  let hi = 0;
  back.forEach((p, i) => {
    if (proj(p) < proj(back[lo])) lo = i;
    if (proj(p) > proj(back[hi])) hi = i;
  });
  return {
    back: pts(back),
    body: pts([back[lo], front[lo], front[hi], back[hi]]),
    front: pts(front),
  };
}