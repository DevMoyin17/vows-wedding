/**
 * The 3D invitation envelope (React Three Fiber). Everything here is built in
 * code — the paper panels, the hinged flap, the lace, the wax seal with the
 * couple's monogram, the card, pearls and petals — and coloured by the
 * template's theme (themes.js). Scene01Entrance3D drives it with GSAP through
 * `partsRef`.
 */
import { memo, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { envelopeDims, framing, pocketTop, FOV, Z } from "./framing";
import { cardTexture, laceTextures, paperTextures, petalTexture, sealTextures } from "./textures";
import { PROPS } from "./props";

const FONTS = { display: "Cormorant Garamond", body: "DM Sans" };
const V2 = (x, y = x) => new THREE.Vector2(x, y);

// the scene only re-renders when what it shows changes, not with the page's phase
export default memo(EnvelopeCanvas);

function EnvelopeCanvas({ playing, ...props }) {
  return (
    <Canvas
      className="e3d-canvas"
      shadows="percentage"
      dpr={[1, 2]}
      frameloop={playing ? "always" : "demand"}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.05, far: 80, position: [0, 0, 12] }}
    >
      <Suspense fallback={null}>
        <World {...props} />
      </Suspense>
    </Canvas>
  );
}

/* ================================================================ world === */

function World({ G, layoutKey, theme, words, idleShift, partsRef, onReady, onSealTap }) {
  const { size, gl, scene, invalidate } = useThree();
  const d = useMemo(() => envelopeDims(G), [G]);
  const f = useMemo(() => framing(size, G, d, idleShift), [size, G, d, idleShift]);
  const rig = useRef({ s: 1, fx: 0, fy: 0, oy: f.idleY, started: false });
  if (!rig.current.started) rig.current.oy = f.idleY;

  // the camera looks straight down; GSAP moves it through `rig`
  useFrame(({ camera }) => {
    // the flap's paper lags behind as it swings over
    if (flapRef.current) flapU.uBend.value = -0.16 * Math.sin(-flapRef.current.rotation.x);
    const r = rig.current;
    camera.position.set(r.fx + (f.x - r.fx) / r.s, r.fy + (f.y + r.oy - r.fy) / r.s, f.D / r.s);
  });

  // soft studio reflections for the gold, the pearls and the foil
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    pm.dispose();
    invalidate();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene, invalidate]);

  // textures drawn for this theme and couple
  const tx = useMemo(
    () => ({
      paper: paperTextures(theme.paper),
      lace: theme.lace ? laceTextures() : null,
      seal: sealTextures(words.initials, FONTS.display),
      card: cardTexture(theme.card, words, FONTS),
      petal: theme.props.petals ? petalTexture(theme.props.petals) : null,
    }),
    [theme, words],
  );
  useEffect(
    () => () => Object.values(tx).forEach((v) => v && Object.values(v).forEach((t) => t?.isTexture && t.dispose())),
    [tx],
  );

  // the flap's opening and the card's gloss, driven by GSAP
  const flapU = useMemo(
    () => ({
      uBend: { value: 0 },
      uDepth: { value: d.flapDepth },
      uLiner: { value: new THREE.Color(theme.liner.color) },
      uLinerMetal: { value: theme.liner.metalness },
      uLinerRough: { value: theme.liner.roughness },
    }),
    [d, theme],
  );
  const flakes = useRef({ t: 0 });

  const keyRef = useRef();
  const flapRef = useRef();
  const sealRef = useRef();
  const sealWhole = useRef();
  const sealMain = useRef();
  const sealChip = useRef();
  const cardRef = useRef();
  const glossRef = useRef();

  const cardY0 = -d.H / 2 + 0.035 + d.cardH / 2;
  const cardYOut = cardY0 + (pocketTop(d, d.cardW / 2) + 0.06 - (cardY0 - d.cardH / 2));

  // aim the key light's shadow at what the camera sees
  useLayoutEffect(() => {
    const L = keyRef.current;
    if (!L) return;
    L.target.position.set(f.view.x, f.view.y, 0);
    L.position.set(f.view.x - 3.2, f.view.y + 5.2, 6.2);
    scene.add(L.target);
    const cam = L.shadow.camera;
    const half = Math.max(f.view.w, f.view.h) / 2;
    Object.assign(cam, { left: -half, right: half, top: half, bottom: -half, near: 0.5, far: 30 });
    cam.updateProjectionMatrix();
    invalidate();
    return () => scene.remove(L.target);
  }, [f, scene, invalidate]);

  useLayoutEffect(() => {
    partsRef.current = {
      rig: rig.current,
      f,
      d,
      flap: flapRef.current,
      flapU,
      seal: { group: sealRef.current, whole: sealWhole.current, main: sealMain.current, chip: sealChip.current },
      flakes: flakes.current,
      card: cardRef.current,
      cardY0,
      cardYOut,
      gloss: glossRef.current?.material.uniforms,
      invalidate,
    };
    if (import.meta.env.DEV) window.__e3d = { ...partsRef.current, gl, scene };
  });

  // draw once everything has loaded, then tell the page
  useEffect(() => {
    invalidate();
    let a = requestAnimationFrame(() => {
      invalidate();
      a = requestAnimationFrame(() => onReady?.());
    });
    return () => cancelAnimationFrame(a);
  }, [onReady, invalidate, f, tx]);

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight
        ref={keyRef}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={6}
        shadow-bias={-0.0003}
        shadow-normalBias={0.003}
      />
      <directionalLight position={[3, -2, 6]} intensity={0.3} />

      <Satin theme={theme} f={f} />
      <Props layoutKey={layoutKey} theme={theme} d={d} tx={tx} />

      <Envelope d={d} theme={theme} tx={tx} flapU={flapU} onSealTap={onSealTap} refs={{ flapRef, sealRef, sealWhole, sealMain, sealChip }} />
      <Flakes state={flakes.current} d={d} theme={theme} />

      <group ref={cardRef} position={[0, cardY0, Z.card]}>
        <Card d={d} theme={theme} tx={tx} glossRef={glossRef} />
      </group>
    </>
  );
}

/* ================================================================ satin === */

/**
 * Satin: deep, smooth folds (a warped height field lit like a glossy weave —
 * soft shading in the valleys, bright crests), with the Figma satin photo's
 * luminance laid in for the fine shimmer. Coloured by the theme's ramp, so
 * any satin colour keeps the same folds.
 */
function Satin({ theme, f }) {
  const luma = useLoader(THREE.TextureLoader, "/assets/three/satin-luma.webp");
  const { w, h, x, y } = f.view;
  const T = 820 / 864;
  const dispW = Math.max(w, h * T);
  const uniforms = useMemo(
    () => ({
      uLuma: { value: luma },
      uScale: { value: V2(1) },
      uSize: { value: V2(1) },
      uCenter: { value: V2(0) },
      c0: { value: new THREE.Color() },
      c1: { value: new THREE.Color() },
      c2: { value: new THREE.Color() },
    }),
    [luma],
  );
  uniforms.uScale.value.set(w / dispW, h / (dispW / T));
  uniforms.uSize.value.set(w, h);
  uniforms.uCenter.value.set(x, y);
  uniforms.c0.value.set(theme.satin[0]);
  uniforms.c1.value.set(theme.satin[1]);
  uniforms.c2.value.set(theme.satin[2]);

  const shadowColor = useMemo(() => new THREE.Color(theme.satin[0]).multiplyScalar(0.55), [theme]);

  return (
    <group position={[x, y, Z.satin]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <shaderMaterial
          uniforms={uniforms}
          toneMapped={false}
          vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={SATIN_FRAG}
        />
      </mesh>
      {/* shadows only, so the satin keeps its own shading */}
      <mesh position={[0, 0, 0.0005]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <shadowMaterial color={shadowColor} opacity={0.42} />
      </mesh>
    </group>
  );
}

const SATIN_FRAG = /* glsl */ `
  uniform sampler2D uLuma; uniform vec2 uScale; uniform vec2 uSize; uniform vec2 uCenter;
  uniform vec3 c0; uniform vec3 c1; uniform vec3 c2;
  varying vec2 vUv;

  // the cloth's height: a few broad folds running mostly on the diagonal,
  // bent into S-curves by a slow warp (world units; the envelope is 3 wide)
  float fold(vec2 p) {
    vec2 q = p + 0.55 * vec2(sin(p.y * 0.62 + 1.3) + 0.5 * sin(p.y * 1.3 + 4.0), sin(p.x * 0.55 + 0.4));
    float h = 0.0;
    h += 0.60 * sin(dot(q, vec2(0.86, 0.50)) * 1.55 + 0.3);
    h += 0.34 * sin(dot(q, vec2(-0.38, 0.92)) * 2.25 + 1.7);
    h += 0.20 * sin(dot(q, vec2(0.97, -0.24)) * 3.3 + 4.1);
    h += 0.08 * sin(dot(q, vec2(0.55, 0.83)) * 6.1 + 2.2);
    // satin drapes: crests a little sharper than the troughs
    return h - 0.12 * h * h;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize + uCenter;
    float e = 0.01;
    float h0 = fold(p);
    vec2 g = vec2(fold(p + vec2(e, 0.0)) - h0, fold(p + vec2(0.0, e)) - h0) / e;
    vec3 n = normalize(vec3(-g * 0.42, 1.0));
    vec3 L = normalize(vec3(-0.45, 0.62, 0.65));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float nh = clamp(dot(n, H), 0.0, 1.0);
    float sheen = pow(nh, 26.0) * 0.2 + pow(nh, 6.0) * 0.07;

    // the photo's fine shimmer
    float photo = texture2D(uLuma, (vUv - 0.5) * uScale + 0.5).r;

    float t = clamp(0.12 + 0.9 * (diff - 0.4) / 0.6, 0.0, 1.0);
    t = clamp(t + (photo - 0.62) * 0.18, 0.0, 1.0);
    vec3 col = t < 0.5 ? mix(c0, c1, t * 2.0) : mix(c1, c2, (t - 0.5) * 2.0);
    col += sheen * mix(c2, vec3(1.0), 0.25);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ============================================================= envelope === */

function paperMaterial(theme, tx, extra = {}) {
  const P = theme.paper.sheen ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const m = new P({
    map: tx.paper.map,
    normalMap: tx.paper.normalMap,
    normalScale: V2(0.35),
    roughness: theme.paper.roughness,
    metalness: 0,
    ...extra,
  });
  if (theme.paper.sheen) Object.assign(m, { sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(theme.paper.sheen) });
  return m;
}

/** the flap: paper outside, the liner inside (back face), and a soft bend */
function flapMaterial(theme, tx, U) {
  const m = paperMaterial(theme, tx, { side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uBend; uniform float uDepth;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n{ float t = clamp(-position.y / uDepth, 0.0, 1.0); transformed.z += uBend * t * t; }",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uLiner; uniform float uLinerMetal; uniform float uLinerRough;")
      .replace("#include <color_fragment>", "#include <color_fragment>\nif (!gl_FrontFacing) diffuseColor.rgb = uLiner;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nif (!gl_FrontFacing) roughnessFactor = uLinerRough;")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nif (!gl_FrontFacing) metalnessFactor = uLinerMetal;");
  };
  return m;
}

/** lace trim, trimmed to the paper it is stitched to (|x| ≤ maxX, y ≤ maxY) */
const trimLace = (maxX, maxY, bendU) => (sh) => {
  sh.uniforms.uMax = { value: V2(maxX, maxY) };
  if (bendU) Object.assign(sh.uniforms, { uBend: bendU.uBend, uDepth: bendU.uDepth });
  sh.vertexShader = sh.vertexShader
    .replace("#include <common>", `#include <common>\nvarying vec2 vLocal;${bendU ? "\nuniform float uBend; uniform float uDepth;" : ""}`)
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>\nvLocal = position.xy;${
        bendU ? "\n{ float t = clamp(-position.y / uDepth, 0.0, 1.0); transformed.z += uBend * t * t; }" : ""
      }`,
    );
  sh.fragmentShader = sh.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying vec2 vLocal; uniform vec2 uMax;")
    .replace(
      "#include <clipping_planes_fragment>",
      "#include <clipping_planes_fragment>\nif (abs(vLocal.x) > uMax.x || vLocal.y > uMax.y) discard;",
    );
};

function laceDepthMaterial(tx, maxX, maxY, bendU) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: tx.lace.alphaMap, alphaTest: 0.35 });
  m.onBeforeCompile = trimLace(maxX, maxY, bendU);
  return m;
}

function laceMaterial(theme, tx, maxX, maxY, bendU) {
  const m = new THREE.MeshStandardMaterial({
    color: theme.lace.color,
    map: tx.lace.map,
    alphaMap: tx.lace.alphaMap,
    normalMap: tx.lace.normalMap,
    normalScale: V2(1.4),
    transparent: true,
    alphaTest: 0.04,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });
  m.onBeforeCompile = trimLace(maxX, maxY, bendU);
  m.customProgramCacheKey = () => (bendU ? "lace-bend" : "lace");
  return m;
}

/**
 * A lace band along the edge p0 → p1. The band's heading lies on the paper
 * (to the left of the direction of travel) and its scallops hang over the
 * edge, as in the Figma photography.
 */
function laceStrip(p0, p1, band, aspect, overhang = 0.32, zAt = () => 0, rows = 6) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux; // inward
  const seg = Math.max(2, Math.ceil(len / 0.03));
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= seg; i++) {
    const s = i / seg;
    const bx = p0[0] + dx * s;
    const by = p0[1] + dy * s;
    const u = (s * len) / (band * aspect);
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      const off = band * (v - overhang);
      const x = bx + nx * off;
      const y = by + ny * off;
      pos.push(x, y, zAt(x, y));
      uv.push(u, v);
    }
    if (i < seg)
      for (let r = 0; r < rows; r++) {
        const a = i * (rows + 1) + r;
        const b = a + rows + 1;
        idx.push(a, b, b + 1, a, b + 1, a + 1);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const merge = (geos) => {
  const pos = [];
  const uv = [];
  const idx = [];
  let base = 0;
  for (const g of geos) {
    pos.push(...g.attributes.position.array);
    uv.push(...g.attributes.uv.array);
    idx.push(...g.index.array.map((i) => i + base));
    base += g.attributes.position.count;
    g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/**
 * A triangle of paper, tessellated so it can bend and gently domed (paper
 * over a card is never flat; the dome is what makes the folds read).
 * Base edge on y = 0, tip at y = −depth (pass a negative depth to point up).
 */
const domeAt = (W, depth, dome) => (x, y) => {
  const t = Math.min(1, Math.max(0, -y / depth));
  const half = (W / 2) * (1 - t);
  if (half <= 1e-6) return 0;
  const j = Math.min(1, Math.max(0, (x / half + 1) / 2));
  return dome * Math.sin(Math.PI * j) * Math.sin(Math.PI * t) ** 0.8;
};

function flapGeometry(W, depth, dome = 0, rows = 28, cols = 28) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const y = -t * depth;
    for (let j = 0; j <= cols; j++) {
      const x = (j / cols - 0.5) * W * (1 - t);
      pos.push(x, y, dome * Math.sin(Math.PI * (j / cols)) * Math.sin(Math.PI * t) ** 0.8);
      uv.push(x, y);
    }
  }
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + 1;
      const c = a + cols + 1;
      if (depth > 0) idx.push(a, c, b, b, c, c + 1);
      else idx.push(a, b, c, b, c + 1, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** a soft, blurred shadow pooled under the envelope (contact shadow) */
function contactShadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; // alphaMap reads colour, not canvas alpha
  g.fillRect(0, 0, 256, 256);
  // the shadow of an off-canvas rectangle, so the blur works everywhere
  g.shadowColor = "#fff";
  g.shadowBlur = 34;
  g.shadowOffsetX = 1000;
  g.fillStyle = "#fff";
  g.fillRect(52 - 1000, 52, 152, 152);
  return new THREE.CanvasTexture(c);
}

const FLAP_DOME = 0.01;

const extrude = (pts, depth) =>
  new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => V2(x, y))), { depth, bevelEnabled: false });

function Envelope({ d, theme, tx, flapU, refs, onSealTap }) {
  const { W, H } = d;
  const m = useMemo(() => {
    const paper = paperMaterial(theme, tx);
    const liner = new THREE.MeshStandardMaterial({
      color: theme.liner.color,
      normalMap: tx.paper.normalMap,
      normalScale: V2(0.3),
      roughness: theme.liner.roughness,
      metalness: theme.liner.metalness,
    });
    const flap = flapMaterial(theme, tx, flapU);
    const laceFlap = theme.lace ? laceMaterial(theme, tx, W / 2, 0, flapU) : null;
    const laceMouth = theme.lace ? laceMaterial(theme, tx, W / 2, H / 2) : null;
    const laceFlapDepth = theme.lace ? laceDepthMaterial(tx, W / 2, 0, flapU) : null;
    const laceMouthDepth = theme.lace ? laceDepthMaterial(tx, W / 2, H / 2) : null;
    return { paper, liner, flap, laceFlap, laceMouth, laceFlapDepth, laceMouthDepth };
  }, [theme, tx, flapU, W, H]);

  const g = useMemo(() => {
    const e = 0.004; // keep stacked panels' edges apart
    const back = new THREE.BoxGeometry(W, H, 0.004);
    const pocket = extrude([[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2 - e], [0, d.vY], [-W / 2, H / 2 - e]], 0.004);
    const bottom = flapGeometry(W - 2 * e, -(d.bottomApexY + H / 2 - e), 0.012);
    const flap = flapGeometry(W, d.flapDepth, FLAP_DOME);
    let laceFlap = null;
    let laceMouth = null;
    if (tx.lace) {
      const a = tx.lace.aspect;
      // the lace lies on the domed paper, a hair above it
      const dome = domeAt(W, d.flapDepth, FLAP_DOME);
      const zAt = (x, y) => dome(x, y) + 0.0016;
      // trimmed on both faces, as in the Figma "Card reveal" open flap
      const zIn = (x, y) => dome(x, y) - 0.0016;
      laceFlap = merge([
        laceStrip([-W / 2, 0], [0, -d.flapDepth], d.lace, a, 0.4, zAt),
        laceStrip([0, -d.flapDepth], [W / 2, 0], d.lace, a, 0.4, zAt),
        laceStrip([-W / 2, 0], [0, -d.flapDepth], d.lace, a, 0.4, zIn),
        laceStrip([0, -d.flapDepth], [W / 2, 0], d.lace, a, 0.4, zIn),
      ]);
      laceMouth = merge([
        laceStrip([0, d.vY], [-W / 2, H / 2], d.lace * 0.9, a, 0.28),
        laceStrip([W / 2, H / 2], [0, d.vY], d.lace * 0.9, a, 0.28),
      ]);
    }
    return { back, pocket, bottom, flap, laceFlap, laceMouth };
  }, [W, H, d, tx]);
  useEffect(() => () => Object.values(g).forEach((x) => x?.dispose()), [g]);

  const shadowTex = useMemo(contactShadowTexture, []);
  return (
    <group>
      <mesh position={[0.04, -0.07, Z.satin + 0.0008]} scale={[W * 1.3, H * 1.42, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#4a2224" alphaMap={shadowTex} transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* back panel: its inside (+z) is lined */}
      <mesh geometry={g.back} position={[0, 0, Z.back + 0.002]} material={[m.paper, m.paper, m.paper, m.paper, m.liner, m.paper]} receiveShadow />
      <mesh geometry={g.pocket} position={[0, 0, Z.pocket]} material={m.paper} castShadow receiveShadow />
      <mesh geometry={g.bottom} position={[0, -H / 2 + 0.004, Z.bottomFlap]} material={m.paper} castShadow receiveShadow />
      {g.laceMouth && <mesh geometry={g.laceMouth} position={[0, 0, Z.bottomFlap + 0.0034]} material={m.laceMouth} customDepthMaterial={m.laceMouthDepth} castShadow receiveShadow />}

      {/* the flap, hinged along the top edge */}
      <group ref={refs.flapRef} position={[0, H / 2, Z.hinge]}>
        <mesh geometry={g.flap} position={[0, 0, Z.flapR]} material={m.flap} castShadow receiveShadow />
        {g.laceFlap && <mesh geometry={g.laceFlap} position={[0, 0, Z.flapR]} material={m.laceFlap} customDepthMaterial={m.laceFlapDepth} castShadow receiveShadow />}
      </group>

      {/* the seal is a button too: tap it to break it */}
      <group
        ref={refs.sealRef}
        position={[0, d.sealY, Z.hinge + Z.flapR + 0.0026]}
        onClick={(e) => {
          e.stopPropagation();
          if (refs.sealRef.current) refs.sealRef.current.userData.opened = true;
          document.body.style.cursor = "";
          onSealTap?.();
        }}
        onPointerOver={() => {
          if (!refs.sealRef.current?.userData.opened) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <Seal d={d} theme={theme} tx={tx} refs={refs} />
      </group>
    </group>
  );
}

/* ================================================================= seal === */

/** an irregular wax puddle, split by a jagged crack into the seal and a chip */
function sealShapes(R) {
  const rad = (a) => R * (1 + 0.05 * Math.sin(6 * a + 0.4) + 0.028 * Math.sin(11 * a + 1.3) + 0.014 * Math.sin(17 * a + 2.1));
  const at = (a) => [Math.cos(a) * rad(a), Math.sin(a) * rad(a)];
  const arc = (a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => at(a0 + ((a1 - a0) * i) / n));
  const aA = (58 * Math.PI) / 180;
  const aB = (-52 * Math.PI) / 180;
  const A = at(aA);
  const B = at(aB);
  const jag = [0.07, -0.06, 0.05, -0.08, 0.04, -0.05];
  const crack = jag.map((j, i) => {
    const t = (i + 1) / (jag.length + 1);
    return [A[0] + (B[0] - A[0]) * t + j * R, A[1] + (B[1] - A[1]) * t];
  });
  const whole = arc(0, Math.PI * 2, 140).slice(0, -1);
  const main = [...arc(aA, aB + Math.PI * 2, 110), ...crack.slice().reverse()];
  const chip = [...arc(aB, aA, 40), ...crack];
  return { whole, main, chip };
}

function Seal({ d, theme, tx, refs }) {
  const bevel = { t: 0.024, s: 0.032 };
  const g = useMemo(() => {
    const sh = sealShapes(d.sealR - bevel.s);
    const opts = { depth: 0.018, bevelEnabled: true, bevelThickness: bevel.t, bevelSize: bevel.s, bevelSegments: 7, curveSegments: 4 };
    const make = (pts) => new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => V2(x, y))), opts);
    return { whole: make(sh.whole), main: make(sh.main), chip: make(sh.chip) };
  }, [d.sealR, bevel.s, bevel.t]);
  useEffect(() => () => Object.values(g).forEach((x) => x.dispose()), [g]);

  const mats = useMemo(() => {
    const S = tx.seal.coverage * d.sealR; // the stamp canvas covers ±S
    const n = tx.seal.normalMap;
    n.repeat.set(1 / (2 * S), 1 / (2 * S));
    n.offset.set(0.5, 0.5);
    const base = { color: theme.seal.color, metalness: theme.seal.metalness, clearcoat: 0.35, clearcoatRoughness: 0.22 };
    const stamp = new THREE.MeshPhysicalMaterial({ ...base, roughness: theme.seal.roughness, normalMap: n, normalScale: V2(1.15) });
    const side = new THREE.MeshPhysicalMaterial({ ...base, roughness: theme.seal.roughness + 0.04 });
    return [stamp, side];
  }, [theme, tx, d.sealR]);

  const z = bevel.t; // seat the puddle on the paper
  return (
    <>
      <mesh ref={refs.sealWhole} geometry={g.whole} material={mats} position={[0, 0, z]} castShadow receiveShadow />
      {/* the broken pieces wait at zero size (not hidden) so they are drawn
          — and their shaders compiled — before the seal cracks */}
      <mesh ref={refs.sealMain} geometry={g.main} material={mats} position={[0, 0, z]} scale={0.0001} castShadow receiveShadow />
      <group ref={refs.sealChip}>
        <mesh geometry={g.chip} material={mats} position={[0, 0, z]} scale={0.0001} castShadow receiveShadow />
      </group>
    </>
  );
}

/** gold wax crumbs thrown from the crack */
function Flakes({ state, d, theme }) {
  const ref = useRef();
  const N = 34;
  const seeds = useMemo(() => {
    let s = 3;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: N }, () => ({
      a: -1.1 + r() * 2.2,
      dist: 0.12 + r() * 0.55,
      h: 0.08 + r() * 0.3,
      spin: (r() - 0.5) * 14,
      size: 0.6 + r() * 0.9,
    }));
  }, []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: theme.seal.color, metalness: theme.seal.metalness, roughness: 0.3 }),
    [theme],
  );
  const o = new THREE.Object3D();
  useFrame(() => {
    const t = state.t;
    const m = ref.current;
    if (!m) return;
    const ox = 0.42 * d.sealR;
    const oy = d.sealY;
    const oz = Z.hinge + Z.flapR + 0.06;
    seeds.forEach((p, i) => {
      const e = 1 - (1 - t) ** 2;
      o.position.set(ox + Math.cos(p.a) * p.dist * e, oy + Math.sin(p.a) * p.dist * e, oz + p.h * 4 * t * (1 - t));
      o.rotation.set(p.spin * t, p.spin * 0.7 * t, p.spin * 0.4 * t);
      const k = t <= 0 ? 0 : t < 0.8 ? 1 : Math.max(0, (1 - t) / 0.2);
      o.scale.setScalar(k * p.size);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, mat, N]} castShadow frustumCulled={false}>
      <boxGeometry args={[0.016, 0.011, 0.004]} />
    </instancedMesh>
  );
}

/* ================================================================= card === */

function Card({ d, theme, tx, glossRef }) {
  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: theme.card.paper, roughness: 0.9 });
    const front = new THREE.MeshStandardMaterial({ map: tx.card.map, roughness: 0.78 });
    const back = new THREE.MeshStandardMaterial({ color: theme.card.paper, roughness: 0.9, normalMap: tx.paper.normalMap, normalScale: V2(0.25) });
    return [edge, edge, edge, edge, front, back];
  }, [theme, tx]);
  const gloss = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uP: { value: -1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float uP; varying vec2 vUv;
          void main(){ float x = vUv.x * 0.8 + vUv.y * 0.55 - uP; float a = exp(-x * x / 0.006) * 0.22; gl_FragColor = vec4(vec3(1.0, 0.98, 0.94) * a, a); }`,
      }),
    [],
  );
  return (
    <>
      <mesh material={mats} castShadow receiveShadow>
        <boxGeometry args={[d.cardW, d.cardH, 0.003]} />
      </mesh>
      <mesh material={gloss} ref={glossRef} position={[0, 0, 0.0018]}>
        <planeGeometry args={[d.cardW, d.cardH]} />
      </mesh>
    </>
  );
}

/* ================================================================ props === */

function Props({ layoutKey, theme, d, tx }) {
  const P = PROPS[layoutKey];
  const pearlR = P.pearlR * d.k;
  const pearls = useMemo(() => {
    if (!theme.props.pearls) return [];
    const out = [];
    for (const strand of P.pearls) {
      const curve = new THREE.CatmullRomCurve3(strand.map(([x, y]) => new THREE.Vector3(...d.toW(x, y), 0)));
      const n = Math.floor(curve.getLength() / (pearlR * 2.08));
      for (let i = 0; i <= n; i++) {
        const p = curve.getPointAt(i / n);
        out.push([p.x, p.y]);
      }
    }
    return out;
  }, [P, d, pearlR, theme]);

  const pearlRef = useRef();
  useLayoutEffect(() => {
    const m = pearlRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    pearls.forEach(([x, y], i) => {
      o.position.set(x, y, Z.satin + pearlR * 0.92);
      o.scale.setScalar(pearlR * (0.96 + ((i * 37) % 9) / 100));
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pearls, pearlR]);

  const pearlMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: theme.props.pearls || "#ffffff",
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.55,
        iridescenceIOR: 1.5,
        sheen: 0.35,
        sheenColor: new THREE.Color("#ffffff"),
      }),
    [theme],
  );

  const petalGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 12, 12);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      p.setZ(i, 0.42 * x * x + 0.1 * (y + 0.5) ** 2);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const petalMat = useMemo(
    () =>
      tx.petal &&
      new THREE.MeshPhysicalMaterial({
        map: tx.petal,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        roughness: 0.55,
        sheen: 1,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#ffffff"),
      }),
    [tx],
  );

  return (
    <>
      {pearls.length > 0 && (
        <instancedMesh ref={pearlRef} args={[undefined, pearlMat, pearls.length]} castShadow frustumCulled={false}>
          <sphereGeometry args={[1, 28, 18]} />
        </instancedMesh>
      )}
      {petalMat &&
        P.petals.map(([x, y, s, rot], i) => {
          const [wx, wy] = d.toW(x, y);
          return (
            <mesh
              key={i}
              geometry={petalGeo}
              material={petalMat}
              position={[wx, wy, Z.satin + 0.004]}
              rotation={[0, 0, (rot * Math.PI) / 180]}
              scale={[s * d.k, s * d.k, s * d.k]}
              castShadow
            />
          );
        })}
    </>
  );
}
