'use client';

import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface GlowCursorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: string;
  secondaryColor?: string;
  intensity?: number;
  trailWidth?: number;
  linger?: number;
  glow?: number;
  hotspot?: number;
  followSpeed?: number;
  grain?: number;
  clickBurst?: boolean;
  quality?: 'low' | 'medium' | 'high';
  theme?: 'dark' | 'light';
  blendMode?: CSSProperties['mixBlendMode'];
  maxDevicePixelRatio?: number;
  enabled?: boolean;
  pathAxis?: 'horizontal' | 'vertical' | 'diagonal';
  duration?: number;
  hold?: number;
  curve?: number;
  loop?: boolean;
  burstOnMerge?: boolean;
  electric?: boolean;
  revealAt?: number;
  absorbDuration?: number;
  onReveal?: () => void;
  onMerge?: () => void;
  children?: ReactNode;
}

type Quality = 'low' | 'medium' | 'high';

type Settings = {
  color: string;
  secondaryColor: string;
  intensity: number;
  trailWidth: number;
  linger: number;
  glow: number;
  hotspot: number;
  followSpeed: number;
  grain: number;
  clickBurst: boolean;
  quality: Quality;
  theme: 'dark' | 'light';
  maxDevicePixelRatio: number;
  enabled: boolean;
  pathAxis: 'horizontal' | 'vertical' | 'diagonal';
  duration: number;
  hold: number;
  curve: number;
  loop: boolean;
  burstOnMerge: boolean;
  electric: boolean;
  revealAt: number;
  absorbDuration: number;
  onReveal?: () => void;
  onMerge?: () => void;
};

type Target = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texel: [number, number];
};

type Pair = {
  readonly read: Target;
  readonly write: Target;
  swap: () => void;
  targets: () => Target[];
};

type Targets = {
  velocity: Pair;
  dye: Pair;
  forward: Target;
  back: Target;
  pressure: Pair;
  divergence: Target;
  bloom: Target[];
};

type Pass = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

const VERTEX = `#version 300 es
in vec2 aPosition;
uniform vec2 uTexel;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

const SPLAT = `${HEADER}
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uA;
uniform vec2 uB;
uniform float uRadius;
uniform float uWide;
uniform vec3 uValue;
uniform float uMode;
uniform float uStrength;
float erf(float x) {
  float x2 = x * x;
  float a = 0.147;
  return sign(x) * sqrt(1.0 - exp(-x2 * (1.2732395 + a * x2) / (1.0 + a * x2)));
}
float sweep(float along, float length, float across, float radius) {
  return exp(-across * across / (radius * radius)) * 0.5 * (erf(along / radius) - erf((along - length) / radius));
}
void main() {
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  vec2 a = vec2(uA.x * uAspect, uA.y);
  vec2 ab = vec2(uB.x * uAspect, uB.y) - a;
  float len = length(ab);
  vec2 dir = len > 1e-6 ? ab / len : vec2(1.0, 0.0);
  vec2 ap = p - a;
  vec3 base = texture(uTarget, vUv).xyz;
  if (uMode > 1.5) {
    float along = dot(ap, dir);
    float across = dot(ap, vec2(-dir.y, dir.x));
    if (uMode > 2.5) {
      outColor = vec4(mix(base, uValue, sweep(along, len, across, uRadius) * uStrength), 1.0);
      return;
    }
    vec3 add = vec3(uValue.xy * sweep(along, len, across, uRadius), uValue.z * sweep(along, len, across, uWide));
    outColor = vec4(base + add, 1.0);
    return;
  }
  float h = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);
  vec2 d = ap - ab * h;
  float r2 = dot(d, d);
  float falloff = exp(-r2 / (uRadius * uRadius));
  float wide = exp(-r2 / (uWide * uWide));
  vec3 result = uMode > 0.5 ? mix(base, uValue, falloff * uStrength) : base + vec3(uValue.xy * falloff, uValue.z * wide);
  outColor = vec4(result, 1.0);
}`;

const ADVECT = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uVelocityTexel;
uniform float uDt;
uniform vec4 uDecay;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
  outColor = texture(uSource, coord) * uDecay;
}`;

const MACCORMACK = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform sampler2D uForward;
uniform sampler2D uBack;
uniform vec2 uVelocityTexel;
uniform vec2 uSourceTexel;
uniform float uDt;
uniform vec4 uDecay;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uVelocityTexel;
  vec4 forward = texture(uForward, vUv);
  vec4 corrected = forward + 0.5 * (texture(uSource, vUv) - texture(uBack, vUv));
  vec2 base = (floor(coord / uSourceTexel - 0.5) + 0.5) * uSourceTexel;
  vec4 a = texture(uSource, base);
  vec4 b = texture(uSource, base + vec2(uSourceTexel.x, 0.0));
  vec4 c = texture(uSource, base + vec2(0.0, uSourceTexel.y));
  vec4 d = texture(uSource, base + uSourceTexel);
  vec4 low = min(min(a, b), min(c, d));
  vec4 high = max(max(a, b), max(c, d));
  outColor = clamp(corrected, low, high) * uDecay;
}`;

const DIVERGENCE = `${HEADER}
uniform sampler2D uVelocity;
void main() {
  float left = texture(uVelocity, vL).x;
  float right = texture(uVelocity, vR).x;
  float top = texture(uVelocity, vT).y;
  float bottom = texture(uVelocity, vB).y;
  vec2 center = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) left = -center.x;
  if (vR.x > 1.0) right = -center.x;
  if (vT.y > 1.0) top = -center.y;
  if (vB.y < 0.0) bottom = -center.y;
  outColor = vec4(0.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
}`;

const SCALE = `${HEADER}
uniform sampler2D uSource;
uniform float uValue;
void main() {
  outColor = texture(uSource, vUv) * uValue;
}`;

const PRESSURE = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float left = texture(uPressure, vL).x;
  float right = texture(uPressure, vR).x;
  float top = texture(uPressure, vT).x;
  float bottom = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  outColor = vec4((left + right + bottom + top - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float left = texture(uPressure, vL).x;
  float right = texture(uPressure, vR).x;
  float top = texture(uPressure, vT).x;
  float bottom = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom);
  outColor = vec4(velocity, 0.0, 1.0);
}`;

const SHADE = `
uniform vec3 uColor;
uniform vec3 uSecondary;
uniform float uIntensity;
uniform float uHotspot;
vec3 shade(vec3 dye) {
  float energy = max(dye.x, 0.0);
  float heat = clamp(dye.y, 0.0, energy);
  float gas = max(dye.z, 0.0);
  float fresh = heat / max(energy, 0.0001);
  vec3 tint = mix(uSecondary, uColor, fresh);
  return (tint * energy + uSecondary * gas + vec3(heat * heat * 0.3 * uHotspot)) * uIntensity;
}
`;

const PREFILTER = `${HEADER}${SHADE}
uniform sampler2D uDye;
uniform vec2 uDyeTexel;
void main() {
  vec2 o = uDyeTexel * 0.5;
  vec3 light = shade(texture(uDye, vUv + vec2(-o.x, -o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(o.x, -o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(-o.x, o.y)).xyz);
  light += shade(texture(uDye, vUv + vec2(o.x, o.y)).xyz);
  outColor = vec4(light * 0.25, 1.0);
}`;

const DOWN = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uSourceTexel;
void main() {
  vec2 o = uSourceTexel;
  vec3 color = texture(uSource, vUv).rgb * 4.0;
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb;
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb;
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb;
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb;
  outColor = vec4(color / 8.0, 1.0);
}`;

const UP = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uSourceTexel;
void main() {
  vec2 o = uSourceTexel;
  vec3 color = texture(uSource, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
  color += texture(uSource, vUv + vec2(o.x * 2.0, 0.0)).rgb;
  color += texture(uSource, vUv + vec2(0.0, -o.y * 2.0)).rgb;
  color += texture(uSource, vUv + vec2(0.0, o.y * 2.0)).rgb;
  color += texture(uSource, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(o.x, -o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(-o.x, o.y)).rgb * 2.0;
  color += texture(uSource, vUv + vec2(o.x, o.y)).rgb * 2.0;
  outColor = vec4(color / 12.0, 1.0);
}`;

const DISPLAY = `${HEADER}${SHADE}
uniform sampler2D uDye;
uniform sampler2D uBloom;
uniform float uGlow;
uniform float uGrain;
uniform float uTime;
uniform float uLight;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
void main() {
  vec3 dye = texture(uDye, vUv).xyz;
  vec3 light = shade(dye);
  vec3 bloom = texture(uBloom, vUv).rgb * uGlow;
  float edge = smoothstep(0.0, 0.02, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  float grain = 1.0 + (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0) - 0.5) * uGrain * 2.0;
  if (uLight > 0.5) {
    float energy = max(dye.x, 0.0);
    float heat = clamp(dye.y, 0.0, energy);
    float gas = max(dye.z, 0.0);
    float fresh = heat / max(energy, 0.0001);
    vec3 tint = mix(uSecondary, uColor, fresh);
    float halo = dot(bloom, vec3(0.2126, 0.7152, 0.0722));
    float density = 1.0 - exp(-((energy * 1.1 + gas * 0.8) * uIntensity + halo * 0.25));
    float tone = dot(tint, vec3(0.2126, 0.7152, 0.0722));
    vec3 ink = tint * min(1.0, 0.5 / max(tone, 0.001)) * mix(0.95, 0.72, smoothstep(0.5, 3.0, energy));
    ink = mix(ink, vec3(1.0), clamp(heat * heat * 0.05 * uHotspot, 0.0, 0.45));
    density = clamp(density * grain, 0.0, 1.0) * edge;
    outColor = vec4(ink * density, density);
  } else {
    vec3 color = 1.0 - exp(-(light + bloom) * grain);
    color *= edge;
    outColor = vec4(color, max(color.r, max(color.g, color.b)));
  }
}`;

const QUALITY: Record<Quality, { sim: number; dye: number }> = {
  low: { sim: 96, dye: 384 },
  medium: { sim: 128, dye: 576 },
  high: { sim: 160, dye: 768 }
};

const PRESSURE_STEPS = 20;
const FLOW = 0.75;
const BLOOM_LEVELS = 5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const toHsv = ([r, g, b]: number[]): [number, number, number] => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  return [(hue * 60 + 360) % 360, max > 0 ? delta / max : 0, max];
};

const fromHsv = (hue: number, saturation: number, value: number): number[] => {
  const h = (((hue % 360) + 360) % 360) / 60;
  const c = value * saturation;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = value - c;
  const [r, g, b] =
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
};

const GlowCursorConverge = ({
  color = '#5f8bff',
  secondaryColor,
  intensity = 1.3,
  trailWidth = 3,
  linger = 1.4,
  glow = 1.2,
  hotspot = 0.8,
  followSpeed = 0.6,
  grain = 0,
  clickBurst = true,
  quality = 'high',
  theme = 'dark',
  blendMode,
  maxDevicePixelRatio = 2,
  enabled = true,
  pathAxis = 'horizontal',
  duration = 2.6,
  hold = 0.9,
  curve = 0.18,
  loop = true,
  burstOnMerge = true,
  electric = false,
  revealAt = 1,
  absorbDuration = 0.9,
  onReveal,
  onMerge,
  children,
  className = '',
  style,
  ...rest
}: GlowCursorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boltRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<Settings>(null as unknown as Settings);
  settingsRef.current = {
    color: String(color),
    secondaryColor: secondaryColor ? String(secondaryColor) : '',
    intensity: Math.max(0, intensity),
    trailWidth: clamp(trailWidth, 0.5, 40),
    linger: clamp(linger, 0.1, 10),
    glow: Math.max(0, glow),
    hotspot: Math.max(0, hotspot),
    followSpeed: clamp(followSpeed, 0, 1),
    grain: Math.max(0, grain),
    clickBurst,
    quality: (QUALITY as Record<string, unknown>)[quality] ? quality : 'high',
    theme,
    maxDevicePixelRatio,
    enabled,
    pathAxis: pathAxis === 'vertical' || pathAxis === 'diagonal' ? pathAxis : 'horizontal',
    duration: clamp(duration, 0.4, 20),
    hold: clamp(hold, 0, 10),
    curve: Math.max(0, curve),
    loop,
    burstOnMerge,
    electric,
    revealAt: clamp(revealAt, 0, 1),
    absorbDuration: clamp(absorbDuration, 0, 5),
    onReveal,
    onMerge
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!container || !canvas || !gl || !gl.getExtension('EXT_color_buffer_float')) return undefined;

    const boltCanvas = boltRef.current;
    const boltCtx = boltCanvas ? boltCanvas.getContext('2d') : null;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX);
    if (!vertexShader) return undefined;

    const build = (source: string): Pass | null => {
      const fragment = compile(gl, gl.FRAGMENT_SHADER, source);
      const program = gl.createProgram();
      if (!fragment || !program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, 'aPosition');
      gl.linkProgram(program);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
      }
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
      }
      return { program, uniforms };
    };

    const passes = {
      splat: build(SPLAT),
      advect: build(ADVECT),
      maccormack: build(MACCORMACK),
      divergence: build(DIVERGENCE),
      scale: build(SCALE),
      pressure: build(PRESSURE),
      gradient: build(GRADIENT),
      prefilter: build(PREFILTER),
      down: build(DOWN),
      up: build(UP),
      display: build(DISPLAY)
    };
    if (Object.values(passes).some(pass => !pass)) return undefined;
    const pass = passes as Record<keyof typeof passes, Pass>;

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const probeContext = probe.getContext('2d', { willReadFrequently: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const state = {
      width: 1,
      height: 1,
      ratio: 1,
      colorKey: '',
      color: [0.37, 0.55, 1] as number[],
      secondary: [0.25, 0.3, 1] as number[],
      emitters: [
        { x: -1e4, y: -1e4, vx: 0, vy: 0, px: -1e4, py: -1e4, travelled: 0 },
        { x: -1e4, y: -1e4, vx: 0, vy: 0, px: -1e4, py: -1e4, travelled: 0 }
      ],
      pathT: 0,
      held: 0,
      merged: false,
      mergeTime: 0,
      revealed: false,
      bursts: [] as [number, number][],
      active: -Infinity,
      time: 0,
      allocated: '',
      targets: null as Targets | null
    };
    let raf = 0;
    let last = 0;
    let alive = true;
    let visible = true;

    const toRgb = (value: string, fallback: number[]): number[] => {
      if (!probeContext || !value) return fallback;
      const css = /^[0-9a-f]{3,8}$/i.test(value) ? `#${value}` : value;
      probeContext.clearRect(0, 0, 1, 1);
      probeContext.fillStyle = '#000000';
      probeContext.fillStyle = css;
      probeContext.fillRect(0, 0, 1, 1);
      const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255];
    };

    const resolveColors = (s: Settings) => {
      const key = `${s.color}|${s.secondaryColor}`;
      if (key === state.colorKey) return;
      state.colorKey = key;
      state.color = toRgb(s.color, [0.37, 0.55, 1]);
      if (s.secondaryColor) {
        state.secondary = toRgb(s.secondaryColor, state.color);
      } else {
        const [hue, saturation, value] = toHsv(state.color);
        state.secondary = fromHsv(hue + 8, Math.min(1, saturation * 1.1 + 0.05), value);
      }
    };

    const createTarget = (
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      filter: number
    ): Target => {
      const texture = gl.createTexture() as WebGLTexture;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer() as WebGLFramebuffer;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, fbo, width, height, texel: [1 / width, 1 / height] };
    };

    const createPair = (
      width: number,
      height: number,
      internalFormat: number,
      format: number,
      filter: number
    ): Pair => {
      let read = createTarget(width, height, internalFormat, format, filter);
      let write = createTarget(width, height, internalFormat, format, filter);
      return {
        get read() {
          return read;
        },
        get write() {
          return write;
        },
        swap() {
          const next = read;
          read = write;
          write = next;
        },
        targets() {
          return [read, write];
        }
      };
    };

    const destroyTarget = (target: Target) => {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.fbo);
    };

    const release = () => {
      const t = state.targets;
      if (!t) return;
      [
        ...t.velocity.targets(),
        ...t.dye.targets(),
        ...t.pressure.targets(),
        t.divergence,
        t.forward,
        t.back,
        ...t.bloom
      ].forEach(destroyTarget);
      state.targets = null;
    };

    const clearTargets = () => {
      const t = state.targets;
      if (!t) return;
      gl.clearColor(0, 0, 0, 0);
      [...t.velocity.targets(), ...t.dye.targets(), ...t.pressure.targets()].forEach(target => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
      });
    };

    const allocate = () => {
      const s = settingsRef.current;
      const key = `${s.quality}|${state.width}|${state.height}|${canvas.width}|${canvas.height}`;
      if (key === state.allocated && state.targets) return;
      release();
      state.allocated = key;
      const preset = QUALITY[s.quality];
      const aspect = state.width / state.height;
      const dims = (base: number) =>
        aspect >= 1 ? [Math.round(base * aspect), base] : [base, Math.round(base / aspect)];
      const [simW, simH] = dims(preset.sim);
      let [dyeW, dyeH] = dims(preset.dye);
      const shrink = Math.min(1, canvas.width / dyeW, canvas.height / dyeH);
      dyeW = Math.max(2, Math.round(dyeW * shrink));
      dyeH = Math.max(2, Math.round(dyeH * shrink));
      const bloom = [];
      let bloomW = dyeW >> 1;
      let bloomH = dyeH >> 1;
      for (let i = 0; i < BLOOM_LEVELS; i++) {
        bloom.push(createTarget(Math.max(1, bloomW), Math.max(1, bloomH), gl.RGBA16F, gl.RGBA, gl.LINEAR));
        bloomW >>= 1;
        bloomH >>= 1;
      }
      state.targets = {
        velocity: createPair(simW, simH, gl.RG16F, gl.RG, gl.LINEAR),
        dye: createPair(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        forward: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        back: createTarget(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.LINEAR),
        pressure: createPair(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
        divergence: createTarget(simW, simH, gl.R16F, gl.RED, gl.NEAREST),
        bloom
      };
    };

    const resize = () => {
      const s = settingsRef.current;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      if (boltCanvas && (boltCanvas.width !== pixelWidth || boltCanvas.height !== pixelHeight)) {
        boltCanvas.width = pixelWidth;
        boltCanvas.height = pixelHeight;
      }
      state.width = width;
      state.height = height;
      state.ratio = ratio;
      allocate();
    };

    const draw = (target: Target | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        gl.viewport(0, 0, target.width, target.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const use = (pass: Pass, texel: number[]) => {
      gl.useProgram(pass.program);
      if (pass.uniforms.uTexel) gl.uniform2f(pass.uniforms.uTexel, texel[0], texel[1]);
      return pass.uniforms;
    };

    const bind = (unit: number, target: Target) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, target.texture);
      return unit;
    };

    const splat = (
      pair: Pair,
      ax: number,
      ay: number,
      bx: number,
      by: number,
      radius: number,
      value: number[],
      mode: number,
      strength: number,
      wide = radius
    ) => {
      const u = use(pass.splat, pair.read.texel);
      gl.uniform1i(u.uTarget, bind(0, pair.read));
      gl.uniform1f(u.uAspect, state.width / state.height);
      gl.uniform2f(u.uA, ax / state.width, 1 - ay / state.height);
      gl.uniform2f(u.uB, bx / state.width, 1 - by / state.height);
      gl.uniform1f(u.uRadius, radius / state.height);
      gl.uniform1f(u.uWide, wide / state.height);
      gl.uniform3f(u.uValue, value[0], value[1], value[2]);
      gl.uniform1f(u.uMode, mode);
      gl.uniform1f(u.uStrength, strength);
      draw(pair.write);
      pair.swap();
    };

    const toGrid = (vx: number, vy: number) => {
      const { velocity } = state.targets as Targets;
      return [(vx * velocity.read.width) / state.width, (-vy * velocity.read.height) / state.height];
    };

    const lightRadius = (s: Settings) =>
      Math.max(s.trailWidth * 0.5, (state.height / (state.targets as Targets).dye.read.height) * 0.9);

    const emitAt = (
      s: Settings,
      em: { x: number; y: number; px: number; py: number; vx: number; vy: number },
      x: number,
      y: number,
      dt: number,
      now: number
    ) => {
      const { velocity, dye } = state.targets as Targets;
      em.px = em.x;
      em.py = em.y;
      em.x = x;
      em.y = y;
      if (em.px < -9000) {
        em.px = x;
        em.py = y;
        return;
      }
      const dx = x - em.px;
      const dy = y - em.py;
      const length = Math.hypot(dx, dy);
      if (length < 0.05 || !s.enabled) return;
      const radius = lightRadius(s);
      if (!reduce) {
        const target = toGrid(dx / Math.max(dt, 1e-3), dy / Math.max(dt, 1e-3));
        splat(velocity, em.px, em.py, x, y, radius * 4 + 18, [target[0], target[1], 0], 3, FLOW * 0.6);
      }
      splat(dye, em.px, em.py, x, y, radius, [5.6, 5.6, 0.7], 2, 1, radius * 5 + 6);
      state.active = now;
    };

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const pathPoint = (u: number, index: number) => {
      const s = settingsRef.current;
      const w = state.width;
      const h = state.height;
      const cx = w / 2;
      const cy = h / 2;
      const pad = Math.max(10, Math.min(w, h) * 0.04);
      let sx = -pad;
      let sy = cy;
      if (s.pathAxis === 'vertical') {
        sx = cx;
        sy = -pad;
      } else if (s.pathAxis === 'diagonal') {
        sx = -pad;
        sy = -pad;
      }
      const vx = cx - sx;
      const vy = cy - sy;
      const len = Math.hypot(vx, vy) || 1;
      const nx = -vy / len;
      const ny = vx / len;
      const bow = s.curve * Math.min(w, h);
      const midX = (sx + cx) / 2;
      const midY = (sy + cy) / 2;
      const ctrlX = midX + nx * bow;
      const ctrlY = midY + ny * bow;
      const t = easeInOutCubic(Math.min(1, Math.max(0, u)));
      const iu = 1 - t;
      const ax = iu * iu * sx + 2 * iu * t * ctrlX + t * t * cx;
      const ay = iu * iu * sy + 2 * iu * t * ctrlY + t * t * cy;
      if (index === 0) return { x: ax, y: ay };
      return { x: 2 * cx - ax, y: 2 * cy - ay };
    };

    const mixWhite = (rgb: number[], k: number) => rgb.map(value => value + (1 - value) * k);
    const css = (rgb: number[], alpha: number) =>
      `rgba(${rgb.map(value => Math.round(Math.max(0, Math.min(1, value)) * 255)).join(',')},${alpha})`;

    const drawBolts = (s: Settings, u: number, t: number, retract: number) => {
      if (!boltCanvas) return;
      const ctx2d = boltCtx;
      if (!ctx2d) return;
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      ctx2d.clearRect(0, 0, boltCanvas.width, boltCanvas.height);
      if (!s.electric || !s.enabled) return;
      const start = state.merged ? retract : 0;
      const end = state.merged ? 1 : u;
      if (end - start <= 0.002) return;

      const scale = state.ratio || 1;
      ctx2d.setTransform(scale, 0, 0, scale, 0, 0);
      ctx2d.globalCompositeOperation = 'lighter';
      ctx2d.lineCap = 'round';
      ctx2d.lineJoin = 'round';

      const glowRgb = toRgb(s.color, [0.55, 0.05, 0.05]);
      const coreRgb = mixWhite(glowRgb, 0.72);
      const glowCss = css(glowRgb, 0.32);
      const coreCss = css(coreRgb, 0.95);
      const amp = Math.max(6, Math.min(state.width, state.height) * 0.018);
      const samples = 44;
      const strands = 3;
      const hash = (n: number) => {
        const x = Math.sin(n * 127.1) * 43758.5453;
        return x - Math.floor(x);
      };

      for (let idx = 0; idx < 2; idx++) {
        const points: { x: number; y: number; nx: number; ny: number }[] = [];
        for (let i = 0; i <= samples; i++) {
          const v = start + (i / samples) * (end - start);
          const point = pathPoint(v, idx);
          const before = pathPoint(Math.max(0, v - 0.003), idx);
          const after = pathPoint(Math.min(1, v + 0.003), idx);
          const tx = after.x - before.x;
          const ty = after.y - before.y;
          const len = Math.hypot(tx, ty) || 1;
          points.push({ x: point.x, y: point.y, nx: -ty / len, ny: tx / len });
        }

        for (let st = 0; st < strands; st++) {
          const lead = st === 0;
          const weight = lead ? 1 : 1.5;
          const offsetAt = (i: number) => {
            const v = start + (i / samples) * (end - start);
            const taper = Math.sin((Math.PI * i) / samples);
            const n1 = Math.sin(v * 57 + t * 7.3 + st * 3.1);
            const n2 = Math.sin(v * 131 - t * 11.7 + st * 1.7);
            const n3 = Math.sin(v * 233 + t * 5.1 + st * 5.3);
            return (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * amp * weight * taper;
          };
          const build = () => {
            ctx2d.beginPath();
            for (let i = 0; i <= samples; i++) {
              const point = points[i];
              const off = offsetAt(i);
              const x = point.x + point.nx * off;
              const y = point.y + point.ny * off;
              if (i === 0) ctx2d.moveTo(x, y);
              else ctx2d.lineTo(x, y);
            }
            ctx2d.stroke();
          };

          if (state.merged && lead) {
            ctx2d.globalAlpha = 0.18;
            ctx2d.strokeStyle = glowCss;
            ctx2d.lineWidth = 18;
            build();
          }
          ctx2d.globalAlpha = lead ? 0.55 : 0.26;
          ctx2d.strokeStyle = glowCss;
          ctx2d.lineWidth = lead ? 8 : 4.5;
          build();
          ctx2d.globalAlpha = lead ? 1 : 0.42;
          ctx2d.strokeStyle = coreCss;
          ctx2d.lineWidth = lead ? 1.6 : 0.9;
          build();
        }

        const head = state.merged ? points[0] : points[points.length - 1];
        if (head) {
          const radius = amp * 5;
          const gradient = ctx2d.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius);
          gradient.addColorStop(0, css(coreRgb, 0.95));
          gradient.addColorStop(0.35, css(glowRgb, 0.55));
          gradient.addColorStop(1, css(glowRgb, 0));
          ctx2d.globalAlpha = 1;
          ctx2d.fillStyle = gradient;
          ctx2d.beginPath();
          ctx2d.arc(head.x, head.y, radius, 0, Math.PI * 2);
          ctx2d.fill();
        }

        if (!state.merged) {
        for (let branch = 0; branch < 2; branch++) {
          const seed = Math.floor(t * 10) + idx * 41 + branch * 13;
          const at = 0.18 + 0.62 * hash(seed);
          const point = pathPoint(u * at, idx);
          const before = pathPoint(Math.max(0, u * at - 0.003), idx);
          const after = pathPoint(Math.min(1, u * at + 0.003), idx);
          const tx = after.x - before.x;
          const ty = after.y - before.y;
          const len = Math.hypot(tx, ty) || 1;
          const side = hash(seed + 1) < 0.5 ? 1 : -1;
          const nx = (-ty / len) * side;
          const ny = (tx / len) * side;
          const reach = amp * (1.2 + 2.2 * hash(seed + 2));
          const x1 = point.x + nx * reach * 0.45 + (tx / len) * reach * 0.12;
          const y1 = point.y + ny * reach * 0.45 + (ty / len) * reach * 0.12;
          const x2 = point.x + nx * reach + (tx / len) * reach * 0.25;
          const y2 = point.y + ny * reach + (ty / len) * reach * 0.25;
          ctx2d.beginPath();
          ctx2d.moveTo(point.x, point.y);
          ctx2d.lineTo(x1, y1);
          ctx2d.lineTo(x2, y2);
          ctx2d.globalAlpha = 0.32;
          ctx2d.strokeStyle = glowCss;
          ctx2d.lineWidth = 2;
          ctx2d.stroke();
          ctx2d.globalAlpha = 0.8;
          ctx2d.strokeStyle = coreCss;
          ctx2d.lineWidth = 0.8;
          ctx2d.stroke();
        }
        }
      }

      ctx2d.globalAlpha = 1;
      ctx2d.globalCompositeOperation = 'source-over';
    };

    const burst = (s: Settings, x: number, y: number, now: number) => {
      const { velocity, dye } = state.targets as Targets;
      const radius = lightRadius(s);
      const jets = 6;
      const base = Math.random() * Math.PI * 2;
      for (let k = 0; k < jets; k++) {
        const angle = base + (k / jets) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const cx = Math.cos(angle);
        const cy = Math.sin(angle);
        const reach = 20 + Math.random() * 14;
        const ax = x + cx * 3;
        const ay = y + cy * 3;
        const bx = x + cx * reach;
        const by = y + cy * reach;
        if (!reduce) {
          const target = toGrid(Math.cos(angle + 0.6) * 760, Math.sin(angle + 0.6) * 760);
          splat(velocity, ax, ay, bx, by, 18, [target[0], target[1], 0], 1, 0.9);
        }
        splat(dye, ax, ay, bx, by, radius * 1.1, [2.4, 2.4, 0.3], 0, 1, radius * 5 + 6);
      }
      splat(dye, x, y, x + 0.01, y, radius * 2.2, [1.8, 1.8, 0.4], 0, 1, radius * 7 + 10);
      state.active = now;
    };

    const step = (s: Settings, dt: number) => {
      const { velocity, dye, pressure, divergence } = state.targets as Targets;
      if (!reduce) {
        let u = use(pass.divergence, velocity.read.texel);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        draw(divergence);

        u = use(pass.scale, pressure.read.texel);
        gl.uniform1i(u.uSource, bind(0, pressure.read));
        gl.uniform1f(u.uValue, 0.8);
        draw(pressure.write);
        pressure.swap();

        u = use(pass.pressure, pressure.read.texel);
        gl.uniform1i(u.uDivergence, bind(1, divergence));
        for (let i = 0; i < PRESSURE_STEPS; i++) {
          gl.uniform1i(u.uPressure, bind(0, pressure.read));
          draw(pressure.write);
          pressure.swap();
        }

        u = use(pass.gradient, velocity.read.texel);
        gl.uniform1i(u.uPressure, bind(0, pressure.read));
        gl.uniform1i(u.uVelocity, bind(1, velocity.read));
        draw(velocity.write);
        velocity.swap();

        u = use(pass.advect, velocity.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(0, velocity.read));
        gl.uniform1f(u.uDt, dt);
        const calm = Math.exp(-dt * 1.2);
        gl.uniform4f(u.uDecay, calm, calm, 1, 1);
        draw(velocity.write);
        velocity.swap();
      }

      const linger = state.merged ? Math.min(s.linger, 0.35) : s.linger;
      const decay = [
        Math.exp((-dt * 4.6) / (linger * 0.8)),
        Math.exp((-dt * 4.6) / (linger * 0.2)),
        Math.exp((-dt * 4.6) / (linger * 1.2)),
        1
      ];
      const { forward, back } = state.targets as Targets;
      if (reduce) {
        const u = use(pass.advect, dye.read.texel);
        gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
        gl.uniform1i(u.uVelocity, bind(0, velocity.read));
        gl.uniform1i(u.uSource, bind(1, dye.read));
        gl.uniform1f(u.uDt, 0);
        gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);
        draw(dye.write);
        dye.swap();
        return;
      }
      let u = use(pass.advect, dye.read.texel);
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));
      gl.uniform1i(u.uSource, bind(1, dye.read));
      gl.uniform1f(u.uDt, dt);
      gl.uniform4f(u.uDecay, 1, 1, 1, 1);
      draw(forward);
      gl.uniform1i(u.uSource, bind(1, forward));
      gl.uniform1f(u.uDt, -dt);
      draw(back);
      u = use(pass.maccormack, dye.read.texel);
      gl.uniform2f(u.uVelocityTexel, velocity.read.texel[0], velocity.read.texel[1]);
      gl.uniform2f(u.uSourceTexel, dye.read.texel[0], dye.read.texel[1]);
      gl.uniform1i(u.uVelocity, bind(0, velocity.read));
      gl.uniform1i(u.uSource, bind(1, dye.read));
      gl.uniform1i(u.uForward, bind(2, forward));
      gl.uniform1i(u.uBack, bind(3, back));
      gl.uniform1f(u.uDt, dt);
      gl.uniform4f(u.uDecay, decay[0], decay[1], decay[2], decay[3]);
      draw(dye.write);
      dye.swap();
    };

    const setShade = (u: Record<string, WebGLUniformLocation | null>, s: Settings) => {
      gl.uniform3f(u.uColor, state.color[0], state.color[1], state.color[2]);
      gl.uniform3f(u.uSecondary, state.secondary[0], state.secondary[1], state.secondary[2]);
      gl.uniform1f(u.uIntensity, s.intensity);
      gl.uniform1f(u.uHotspot, s.hotspot);
    };

    const render = (s: Settings) => {
      const { dye, bloom } = state.targets as Targets;
      if (s.glow > 0) {
        let u = use(pass.prefilter, bloom[0].texel);
        gl.uniform1i(u.uDye, bind(0, dye.read));
        gl.uniform2f(u.uDyeTexel, dye.read.texel[0], dye.read.texel[1]);
        setShade(u, s);
        draw(bloom[0]);
        u = use(pass.down, bloom[0].texel);
        for (let i = 1; i < bloom.length; i++) {
          gl.uniform1i(u.uSource, bind(0, bloom[i - 1]));
          gl.uniform2f(u.uSourceTexel, bloom[i - 1].texel[0], bloom[i - 1].texel[1]);
          draw(bloom[i]);
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        u = use(pass.up, bloom[0].texel);
        for (let i = bloom.length - 1; i > 0; i--) {
          gl.uniform1i(u.uSource, bind(0, bloom[i]));
          gl.uniform2f(u.uSourceTexel, bloom[i].texel[0], bloom[i].texel[1]);
          draw(bloom[i - 1]);
        }
        gl.disable(gl.BLEND);
      }
      const u = use(pass.display, [1 / canvas.width, 1 / canvas.height]);
      gl.uniform1i(u.uDye, bind(0, dye.read));
      gl.uniform1i(u.uBloom, bind(1, bloom[0]));
      setShade(u, s);
      gl.uniform1f(u.uGlow, s.glow > 0 ? (s.glow * 1.4) / BLOOM_LEVELS : 0);
      gl.uniform1f(u.uGrain, s.grain);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform1f(u.uLight, s.theme === 'light' ? 1 : 0);
      draw(null);
    };

    const blank = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
      last = now;
      state.time += dt;
      const wanted = Math.min(window.devicePixelRatio || 1, Math.max(0.5, s.maxDevicePixelRatio || 2));
      if (Math.abs(wanted - state.ratio) > 0.01) resize();
      allocate();
      resolveColors(s);
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);

      let boltU = 0;
      let boltRetract = 0;
      if (s.enabled) {
        if (!state.merged) {
          state.active = now;
          state.pathT += dt / Math.max(0.15, s.duration);
          const u = Math.min(1, state.pathT);
          boltU = u;
          if (!state.revealed && u >= s.revealAt) {
            state.revealed = true;
            s.onReveal?.();
          }
          const first = pathPoint(u, 0);
          const second = pathPoint(u, 1);
          emitAt(s, state.emitters[0], first.x, first.y, dt, now);
          emitAt(s, state.emitters[1], second.x, second.y, dt, now);
          if (state.pathT >= 1) {
            state.merged = true;
            state.mergeTime = now;
            state.held = 0;
            if (s.burstOnMerge && !reduce) burst(s, state.width / 2, state.height / 2, now);
            s.onMerge?.();
          }
        } else {
          state.held += dt;
          boltU = 1;
          boltRetract =
            s.absorbDuration > 0
              ? Math.min(1, (now - state.mergeTime) / (s.absorbDuration * 1000))
              : 1;
          if (s.loop && state.held >= s.hold) {
            state.merged = false;
            state.pathT = 0;
            state.held = 0;
            state.revealed = false;
            for (const em of state.emitters) {
              em.x = -1e4;
              em.y = -1e4;
              em.px = -1e4;
              em.py = -1e4;
            }
          }
        }
      }
      while (state.bursts.length) {
        const [x, y] = state.bursts.shift() as [number, number];
        burst(s, x, y, now);
      }
      step(s, dt);
      render(s);
      drawBolts(s, boltU, state.time, boltRetract);

      const quiet = now - state.active > s.linger * 1200 + 900;
      if (quiet) {
        clearTargets();
        blank();
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    blank();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      release();
      Object.values(pass).forEach(item => gl.deleteProgram(item.program));
      gl.deleteShader(vertexShader);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  const mode = blendMode ?? (theme === 'light' ? 'normal' : 'screen');

  return (
    <div
      ref={containerRef}
      className={['glow-converge', className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className="glow-converge__canvas"
        style={{ mixBlendMode: mode }}
        aria-hidden="true"
      />
      <canvas
        ref={boltRef}
        className="glow-converge__canvas"
        style={{ mixBlendMode: mode }}
        aria-hidden="true"
      />
      {children && <div className="glow-converge__content">{children}</div>}
    </div>
  );
};

export default GlowCursorConverge;
