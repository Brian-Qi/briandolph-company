(function(ye,j,xt){"use strict";const gt=[-.81,.58,-.02],Ge={forward:[0,1],backward:[0,-1],left:[-1,0],right:[1,0]},Et=["lift","trace","light"],yt={plus:0,dots:1},Tt=1.25,Te=`
precision highp float;
precision highp int;

uniform float uFrequency;
uniform vec2 uMorph;
uniform sampler2D uSculpt;
uniform float uSculptOn;
uniform vec4 uPulses[4];
uniform vec3 uEye;
uniform vec3 uForward;
uniform vec3 uNear;

uint lattice(ivec2 p) {
  uvec2 q = uvec2(p + 1073741824);
  uint h = q.x * 2654435761u + q.y * 2246822519u;
  h = (h ^ (h >> 15u)) * 739982445u;
  h = (h ^ (h >> 12u)) * 695872825u;
  return h ^ (h >> 15u);
}

float corner(ivec2 c, vec2 f) {
  uint h = lattice(c);
  vec2 g = vec2(float(h & 65535u), float(h >> 16u)) / 32767.5 - 1.0;
  return dot(g, f);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = p - i;
  ivec2 c = ivec2(i);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = corner(c, f);
  float b = corner(c + ivec2(1, 0), f - vec2(1.0, 0.0));
  float d = corner(c + ivec2(0, 1), f - vec2(0.0, 1.0));
  float e = corner(c + ivec2(1, 1), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(d, e, u.x), u.y);
}

vec2 octave(vec2 p, vec2 shift) {
  return vec2(1.6 * p.x - 1.2 * p.y, 1.2 * p.x + 1.6 * p.y) + shift;
}

float relief(vec2 t) {
  vec2 p = t * uFrequency;
  vec2 w = vec2(noise(p * 0.42 + uMorph), noise(p * 0.42 - uMorph.yx + vec2(5.2, 1.3)));
  p += w * 0.8;
  float n = noise(p) * 0.55;
  p = octave(p, vec2(7.1, 3.7));
  n += noise(p) * 0.15;
  p = octave(p, vec2(1.9, 8.3));
  n += noise(p) * 0.04;
  float s = log(1.0 + exp(7.0 * (3.0 * n + 0.05))) / 7.0;
  return s * s * 1.4 + 0.1 * n;
}

float swell(vec2 t) {
  float lift = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 p = uPulses[i];
    if (p.w <= 0.0) continue;
    float x = (length(t - p.xy) - p.z) / (0.28 + p.z * 0.05);
    lift += exp(-x * x) * p.w;
  }
  return lift;
}

vec4 sculpted(vec2 t) {
  return uSculptOn > 0.5 ? textureLod(uSculpt, t / 48.0, 0.0) : vec4(0.0);
}

float settle(vec2 world) {
  float depth = dot(vec3(world.x, 0.0, world.y) - uEye, uForward);
  float x = clamp((depth - uNear.x) / max(uNear.y - uNear.x, 1e-3), 0.0, 1.0);
  return mix(uNear.z, 1.0, x * x * x * (x * (x * 6.0 - 15.0) + 10.0));
}
`,Ft=`#version 300 es
${Te}
uniform ivec2 uBase;
uniform float uCell;
uniform float uDetail;
layout(location = 0) out vec4 outField;
layout(location = 1) out vec4 outHeight;

void main() {
  vec2 t = vec2(uBase + ivec2(gl_FragCoord.xy)) * uCell;
  vec4 carved = sculpted(t);
  float ring = swell(t);
  float ground = relief(t) + carved.r + ring * 0.14;
  vec2 dp = t * uFrequency * 5.0 + vec2(13.1, 4.7);
  float fine = noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3;
  outField = vec4(carved.g, ring, ground, carved.r);
  outHeight = vec4(ground + uDetail * 0.1 * fine, 0.0, 0.0, 1.0);
}`,wt=i=>`#version 300 es
#define BAKED ${i?1:0}
${Te}
uniform sampler2D uField;
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uCell;
uniform int uStride;
uniform float uHeight;
uniform mat4 uViewProj;
out vec2 vTexel;
out vec2 vTerrain;
out float vDepth;
out float vLift;
out vec3 vNormal;

float ground(vec2 t) {
  return relief(t) + swell(t) * 0.14;
}

void main() {
  ivec2 step = ivec2(gl_VertexID >> 1, gl_InstanceID + (gl_VertexID & 1)) * uStride;
  ivec2 local = uOrigin + step;
  vec2 terrain = vec2(local + uCamCell) * uCell;
  vec2 world = vec2(local) * uCell - uCamFrac;
  float k = settle(world);
#if BAKED
  ivec2 texel = step + 2;
  vec4 c = texelFetch(uField, texel, 0);
  vec4 l = texelFetch(uField, texel - ivec2(1, 0), 0);
  vec4 r = texelFetch(uField, texel + ivec2(1, 0), 0);
  vec4 d = texelFetch(uField, texel - ivec2(0, 1), 0);
  vec4 u = texelFetch(uField, texel + ivec2(0, 1), 0);
  float h = (c.b - c.a) * k + c.a;
  float dx = (l.b - l.a - r.b + r.a) * k + l.a - r.a;
  float dz = (d.b - d.a - u.b + u.a) * k + d.a - u.a;
  vNormal = vec3(dx * uHeight / (2.0 * uCell), 1.0, dz * uHeight / (2.0 * uCell));
  vTexel = vec2(texel) + 0.5;
#else
  float h = ground(terrain) * k;
  float hx = ground(terrain + vec2(0.04, 0.0)) * k;
  float hz = ground(terrain + vec2(0.0, 0.04)) * k;
  vNormal = vec3((h - hx) * uHeight / 0.04, 1.0, (h - hz) * uHeight / 0.04);
  vTexel = vec2(0.0);
#endif
  vec4 clip = uViewProj * vec4(world.x, h * uHeight, world.y, 1.0);
  gl_Position = clip;
  vTerrain = terrain;
  vDepth = clip.w;
  vLift = h * uHeight;
}`,Mt=i=>`#version 300 es
#define BAKED ${i?1:0}
${Te}
uniform sampler2D uField;
uniform highp sampler2D uHeightField;
uniform float uDetail;
uniform float uLines;
uniform float uLineWidth;
uniform float uMajor;
uniform vec3 uColor;
uniform float uBrightness;
uniform vec2 uFade;
uniform vec3 uFocus;
uniform vec4 uHeat;
uniform vec4 uLamp;
uniform vec4 uTrace;
uniform vec3 uSun;
uniform float uRefDepth;
uniform float uReveal;
uniform float uLightMode;
uniform float uOpacity;
uniform vec4 uGlitch[3];
uniform float uGlitchSeed;
uniform float uPixel;
in vec2 vTexel;
in vec2 vTerrain;
in float vDepth;
in float vLift;
in vec3 vNormal;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

float stroke(float dist, float width, float soft, float density, float crowd) {
  float cover = max(0.0, min(min(width, soft), 0.5 * (width + soft) - dist)) / soft;
  return mix(cover, min(width * density, 1.0) * 0.6, crowd);
}

float sampleHeight(vec2 coord, out vec2 slope) {
  vec2 u = coord - 0.5;
  vec2 i = floor(u + 0.5);
  vec2 f = u - i;
  vec3 wx = vec3(0.5 * (0.5 - f.x) * (0.5 - f.x), 0.75 - f.x * f.x, 0.5 * (0.5 + f.x) * (0.5 + f.x));
  vec3 wy = vec3(0.5 * (0.5 - f.y) * (0.5 - f.y), 0.75 - f.y * f.y, 0.5 * (0.5 + f.y) * (0.5 + f.y));
  vec3 dx = vec3(f.x - 0.5, -2.0 * f.x, 0.5 + f.x);
  vec3 dy = vec3(f.y - 0.5, -2.0 * f.y, 0.5 + f.y);
  ivec2 base = ivec2(i) - 1;
  float total = 0.0;
  slope = vec2(0.0);
  for (int y = 0; y < 3; y++) {
    float a = texelFetch(uHeightField, base + ivec2(0, y), 0).r;
    float b = texelFetch(uHeightField, base + ivec2(1, y), 0).r;
    float c = texelFetch(uHeightField, base + ivec2(2, y), 0).r;
    float row = a * wx.x + b * wx.y + c * wx.z;
    total += row * wy[y];
    slope += vec2((a * dx.x + b * dx.y + c * dx.z) * wy[y], row * dy[y]);
  }
  return total;
}

void main() {
  float py = gl_FragCoord.y / uPixel;
  float shift = 0.0;
  float split = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) {
      shift = uGlitch[i].z * uPixel;
      split = uGlitch[i].w * uPixel;
    }
  }
  vec2 spot = vTerrain - dFdx(vTerrain) * shift;
#if BAKED
  vec2 ex = dFdx(vTexel);
  vec2 ey = dFdy(vTexel);
  vec2 coord = vTexel - ex * shift;
  vec2 slope;
  float h = sampleHeight(coord, slope);
  vec4 field = texture(uField, coord / vec2(textureSize(uField, 0)));
  float trail = field.r;
  float ring = field.g;
  float gx = dot(slope, ex) * uLines;
  float gy = dot(slope, ey) * uLines;
#else
  vec2 dp = spot * uFrequency * 5.0 + vec2(13.1, 4.7);
  float ring = swell(spot);
  float h = relief(spot) + ring * 0.14 + uDetail * 0.1 * (noise(dp) * 0.6 + noise(octave(dp, vec2(2.3, 6.1))) * 0.3);
  float trail = 0.0;
  float gx = dFdx(h) * uLines;
  float gy = dFdy(h) * uLines;
#endif

  float lc = h * uLines + 0.5;
  float density = max(sqrt(gx * gx + gy * gy), 1e-5);
  float dist = abs(fract(lc + 0.5) - 0.5) / density;
  float major = uMajor * (1.0 - step(0.5, mod(floor(lc + 0.5), 5.0)));

  vec2 hd = spot - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w + trail * 0.6;
  float energy = heat + ring;

  float depth = max(vDepth, 0.01);
  float persp = clamp(sqrt(uRefDepth / depth), 0.6, 1.6);
  float width = uLineWidth * persp * (1.0 + 0.6 * major) * (1.0 + 0.45 * min(energy, 1.5));
  float soft = 1.0 + min(uFocus.y * abs(1.0 - uFocus.x / depth), uFocus.z);
  float crowd = smoothstep(0.3, 0.75, density * max(width, soft));
  float cover = stroke(dist, width, soft, density, crowd);
  vec3 cover3 = vec3(cover);
  if (split > 0.0) {
    float offset = split * density;
    cover3.r = stroke(abs(fract(lc + offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    cover3.b = stroke(abs(fract(lc - offset + 0.5) - 0.5) / density, width, soft, density, crowd);
    vec2 block = floor(vec2(gl_FragCoord.x / (uPixel * 26.0), py / 5.0)) + uGlitchSeed * 71.0;
    float drop = fract(sin(dot(block, vec2(12.9898, 78.233))) * 43758.5453);
    cover3 *= drop > 0.82 ? 0.1 : 1.2;
  }

  vec3 normal = normalize(vNormal);
  float sun = clamp(dot(normal, uSun), 0.0, 1.0);
  vec3 toLamp = uLamp.xyz - vec3(vTerrain.x, vLift, vTerrain.y);
  float lampDistance = length(toLamp);
  float lamp = clamp(dot(normal, toLamp / max(lampDistance, 1e-3)), 0.0, 1.0) * uLamp.w / (1.0 + lampDistance * lampDistance * 0.9);
  float level = mix(0.45, 1.05, smoothstep(0.0, 1.1, h)) * mix(0.35, 1.25, sun * sun) * (1.0 + 0.6 * major);
  level += heat * 1.4 + ring * 3.0 + lamp * 1.2;

  float fade = 1.0 - smoother((depth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  vec3 light = cover3 * level;

  if (uTrace.y > 0.0) {
    float traceWidth = uLineWidth * persp * 1.8;
    float trace = stroke(abs(h - uTrace.x) * uLines / density, traceWidth, soft, density, crowd);
    vec2 td = spot - uTrace.zw;
    light += trace * uTrace.y * mix(0.35, 1.0, exp(-dot(td, td) / 20.0)) * 2.6;
  }
  light *= fade * uBrightness * uReveal;

  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-max(max(light.r, light.g), light.b) * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }

  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  float top = max(max(color.r, color.g), color.b);
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  color = max(color + dither / 255.0 * step(0.002, top), 0.0);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,Rt=`#version 300 es
${Te}
uniform ivec2 uOrigin;
uniform ivec2 uCamCell;
uniform vec2 uCamFrac;
uniform float uSpacing;
uniform int uColumns;
uniform float uHeight;
uniform mat4 uViewProj;
uniform vec2 uView;
uniform float uSize;
uniform float uRefDepth;
uniform vec4 uHeat;
uniform float uTime;
uniform vec4 uGlitch[3];
uniform float uPixel;
out vec2 vCorner;
out float vSize;
out float vGlow;
out float vFrame;
out float vDepth;

void main() {
  ivec2 local = uOrigin + ivec2(gl_InstanceID % uColumns, gl_InstanceID / uColumns);
  ivec2 id = local + uCamCell;
  vec2 terrain = vec2(id) * uSpacing;
  vec2 world = vec2(local) * uSpacing - uCamFrac;
  float ring = swell(terrain);
  float h = (relief(terrain) + ring * 0.14) * settle(world) + sculpted(terrain).r;
  vec4 clip = uViewProj * vec4(world.x, h * uHeight + 0.05, world.y, 1.0);
  uint seed = lattice(id + ivec2(911, 377));
  float a = float(seed & 1023u) / 1023.0;
  float b = float((seed >> 10u) & 1023u) / 1023.0;
  vec2 hd = terrain - uHeat.xy;
  float heat = exp(-dot(hd, hd) / (uHeat.z * uHeat.z)) * uHeat.w;
  float blink = step(0.92, a) * (0.5 + 0.5 * sin(uTime * (1.4 + b * 2.2) + b * 40.0));
  float size = uSize * clamp(sqrt(uRefDepth / max(clip.w, 0.01)), 0.6, 1.3) * (1.0 + 0.4 * heat + 0.35 * blink);
  float frame = max(smoothstep(0.55, 0.95, blink), smoothstep(0.3, 0.8, heat));
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2.0 - 1.0;
  vec2 offset = corner * (size * (frame > 0.001 ? 2.6 : 1.0) + 1.5);
  float py = (clip.y / clip.w * 0.5 + 0.5) * uView.y / uPixel;
  float shift = 0.0;
  for (int i = 0; i < 3; i++) {
    if (py >= uGlitch[i].x && py < uGlitch[i].y) shift = uGlitch[i].z;
  }
  clip.xy += (offset + vec2(shift * uPixel, 0.0)) / uView * 2.0 * clip.w;
  gl_Position = clip;
  vCorner = offset;
  vSize = size;
  vFrame = frame;
  vGlow = 0.5 + 0.4 * b + blink * 0.9 + heat * 1.8 + ring * 3.0;
  vDepth = clip.w;
}`,bt=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform vec2 uFade;
uniform float uReveal;
uniform float uBrightness;
uniform float uLightMode;
uniform float uOpacity;
uniform float uStyle;
uniform float uPixel;
in vec2 vCorner;
in float vSize;
in float vGlow;
in float vFrame;
in float vDepth;
out vec4 outColor;

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 a = abs(vCorner);
  float cover;
  if (uStyle < 0.5) {
    float thick = max(0.6 * uPixel, 0.5);
    float across = clamp(vSize - a.x + 0.5, 0.0, 1.0) * clamp(thick - a.y + 0.5, 0.0, 1.0);
    float down = clamp(vSize - a.y + 0.5, 0.0, 1.0) * clamp(thick - a.x + 0.5, 0.0, 1.0);
    cover = max(across, down);
  } else {
    cover = clamp(vSize * 0.42 - length(vCorner) + 0.5, 0.0, 1.0);
  }
  if (vFrame > 0.001) {
    float edge = vSize * 2.3;
    float reach = edge * 0.45;
    float line = max(0.5 * uPixel, 0.5);
    float sides = clamp(line - abs(a.x - edge) + 0.5, 0.0, 1.0) * clamp(a.y - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.y + 0.5, 0.0, 1.0);
    float caps = clamp(line - abs(a.y - edge) + 0.5, 0.0, 1.0) * clamp(a.x - edge + reach + 0.5, 0.0, 1.0) * clamp(edge + line - a.x + 0.5, 0.0, 1.0);
    cover = max(cover, max(sides, caps) * vFrame * 0.8);
  }
  float fade = 1.0 - smoother((vDepth - uFade.x) / max(uFade.y - uFade.x, 1e-3));
  float light = cover * vGlow * fade * fade * uReveal * uBrightness;
  if (uLightMode > 0.5) {
    float ink = (1.0 - exp(-light * 1.8)) * 0.92 * uOpacity;
    outColor = vec4(uColor * ink, ink);
    return;
  }
  vec3 color = 1.0 - exp(-uColor * light * 1.8);
  outColor = vec4(color, max(max(color.r, color.g), color.b)) * uOpacity;
}`,fe=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,St=`#version 300 es
precision highp float;
uniform sampler2D uPrevious;
uniform vec4 uSegment;
uniform vec4 uBrush;
uniform vec4 uBurst;
uniform vec2 uDecay;
out vec4 outColor;

vec2 wrapped(vec2 d) {
  return d - 48.0 * floor(d / 48.0 + 0.5);
}

void main() {
  vec4 previous = texelFetch(uPrevious, ivec2(gl_FragCoord.xy), 0);
  vec2 t = gl_FragCoord.xy / 256.0 * 48.0;
  vec2 a = wrapped(t - uSegment.xy);
  vec2 ab = uSegment.zw - uSegment.xy;
  float k = clamp(dot(a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  vec2 d = a - ab * k;
  float g = exp(-dot(d, d) / (uBrush.x * uBrush.x)) * uBrush.w;
  float height = previous.r * uDecay.x;
  height += (uBrush.y - height) * g * uBrush.z;
  float heat = previous.g * uDecay.y;
  heat += (1.0 - heat) * g * uBrush.z;
  vec2 b = wrapped(t - uBurst.xy);
  height += uBurst.w * exp(-dot(b, b) / (uBurst.z * uBurst.z));
  outColor = vec4(height, heat, 0.0, 1.0);
}`,Lt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uTexel;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv - uTexel);
  color += texture(uSource, uv + uTexel);
  color += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  color += texture(uSource, uv + vec2(-uTexel.x, uTexel.y));
  outColor = min(color * 0.25, vec4(1.0));
}`,Ct=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTarget;
uniform vec2 uStep;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 color = texture(uSource, uv) * 0.181862;
  color += (texture(uSource, uv + uStep * 1.423135) + texture(uSource, uv - uStep * 1.423135)) * 0.284316;
  color += (texture(uSource, uv + uStep * 3.326702) + texture(uSource, uv - uStep * 3.326702)) * 0.106598;
  color += (texture(uSource, uv + uStep * 5.242989) + texture(uSource, uv - uStep * 5.242989)) * 0.018156;
  outColor = color;
}`,At=`#version 300 es
precision highp float;
uniform sampler2D uBloom0;
uniform sampler2D uBloom1;
uniform sampler2D uBloom2;
uniform sampler2D uBloom3;
uniform vec2 uView;
uniform float uGlow;
uniform float uLightMode;
out vec4 outColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec4 halo = texture(uBloom0, uv) * 0.4;
  halo += texture(uBloom1, uv) * 0.3;
  halo += texture(uBloom2, uv) * 0.2;
  halo += texture(uBloom3, uv) * 0.1;
  if (uLightMode > 0.5) {
    outColor = halo * uGlow * 0.35;
    return;
  }
  vec3 color = halo.rgb * uGlow * 1.6;
  color = color / (1.0 + color);
  outColor = vec4(color, max(max(color.r, color.g), color.b));
}`,S=(i,s,u)=>Math.min(u,Math.max(s,i)),te=i=>{const s=S(i,0,1);return s*s*s*(s*(s*6-15)+10)},_t=(i,s)=>{let u=Math.imul(i+1073741824,2654435761)+Math.imul(s+1073741824,2246822519)>>>0;return u=Math.imul(u^u>>>15,739982445)>>>0,u=Math.imul(u^u>>>12,695872825)>>>0,(u^u>>>15)>>>0},Fe=(i,s,u,l)=>{const h=_t(i,s);return((h&65535)/32767.5-1)*u+((h>>>16)/32767.5-1)*l},oe=(i,s)=>{const u=Math.floor(i),l=Math.floor(s),h=i-u,m=s-l,R=h*h*h*(h*(h*6-15)+10),B=m*m*m*(m*(m*6-15)+10),N=Fe(u,l,h,m),L=Fe(u+1,l,h-1,m),O=Fe(u,l+1,h,m-1),X=Fe(u+1,l+1,h-1,m-1),Z=N+(L-N)*R;return Z+(O+(X-O)*R-Z)*B},Ve=(i,s,u,l,h)=>{let m=i*u,R=s*u;const B=oe(m*.42+l,R*.42+h),N=oe(m*.42-h+5.2,R*.42-l+1.3);m+=B*.8,R+=N*.8;let L=oe(m,R)*.55;const O=1.6*m-1.2*R+7.1,X=1.2*m+1.6*R+3.7;L+=oe(O,X)*.15,L+=oe(1.6*O-1.2*X+1.9,1.2*O+1.6*X+8.3)*.04;const Z=Math.log(1+Math.exp(7*(3*L+.05)))/7;return Z*Z*1.4+.1*L},Pt=(i,s,u)=>{const l=i*u*5+13.1,h=s*u*5+4.7;return oe(l,h)*.6+oe(1.6*l-1.2*h+2.3,1.2*l+1.6*h+6.1)*.3},Ze=(i,s,u)=>{const l=i.createShader(s);return l?(i.shaderSource(l,u),i.compileShader(l),i.getShaderParameter(l,i.COMPILE_STATUS)?l:(i.deleteShader(l),null)):null},re=(i,s,u)=>{const l=Ze(i,i.VERTEX_SHADER,s),h=Ze(i,i.FRAGMENT_SHADER,u),m=i.createProgram();if(!l||!h||!m)return null;if(i.attachShader(m,l),i.attachShader(m,h),i.linkProgram(m),i.deleteShader(l),i.deleteShader(h),!i.getProgramParameter(m,i.LINK_STATUS))return i.deleteProgram(m),null;const R={},B=i.getProgramParameter(m,i.ACTIVE_UNIFORMS);for(let N=0;N<B;N++){const L=i.getActiveUniform(m,N);L&&(R[L.name.replace(/\[0\]$/,"")]=i.getUniformLocation(m,L.name))}return{program:m,uniforms:R}},Dt=i=>{let s=String(i||"#ffffff").replace("#","").trim();(s.length===3||s.length===4)&&(s=s.slice(0,3).split("").map(l=>l+l).join(""));const u=parseInt(s.slice(0,6),16);return Number.isNaN(u)?[1,1,1]:[(u>>16&255)/255,(u>>8&255)/255,(u&255)/255]},Nt=(i,s)=>{const u=Math.cos(s),l=[Math.sin(i)*u,-Math.sin(s),Math.cos(i)*u],h=[Math.cos(i),0,-Math.sin(i)],m=[l[1]*h[2]-l[2]*h[1],l[2]*h[0]-l[0]*h[2],l[0]*h[1]-l[1]*h[0]];return{f:l,r:h,u:m}},De=i=>S(.4877/i,.32,.6),Bt=({eye:i,f:s,r:u,u:l},h,m)=>{const R=1/De(h),B=1/(.05-160),N=[u[0],l[0],-s[0],0,u[1],l[1],-s[1],0,u[2],l[2],-s[2],0,-(u[0]*i[0]+u[1]*i[1]+u[2]*i[2]),-(l[0]*i[0]+l[1]*i[1]+l[2]*i[2]),s[0]*i[0]+s[1]*i[1]+s[2]*i[2],1],L=[R/h,0,0,0,0,R,0,0,0,0,(160+.05)*B,-1,0,0,320*.05*B,0];for(let O=0;O<4;O++)for(let X=0;X<4;X++){let Z=0;for(let ne=0;ne<4;ne++)Z+=L[ne*4+X]*N[O*4+ne];m[O*4+X]=Z}return m},Ot=({color:i="#4f7cff",lineCount:s=22,lineWidth:u=1.2,majorLines:l=!0,elevation:h=1,foreground:m=.2,scale:R=1,detail:B=.35,tilt:N=32,speed:L=.25,direction:O="forward",morph:X=.2,glow:Z=.6,depthOfField:ne=.4,fog:Zt=.35,brightness:$t=1,opacity:qt=1,mouseInteraction:jt=!0,hoverEffect:We="lift",mouseRadius:Wt=1,mouseStrength:Kt=.6,trail:Yt=.3,parallax:Qt=.5,clickEffect:Jt="pulse",markers:eo="none",glitch:to=0,intro:oo=!0,lightMode:ro=!1,dpr:io,travelX:no=0,className:ao="",style:uo})=>{const Ke=j.useRef(null),Ye=j.useRef(null),he=j.useRef(null),[lo,co]=j.useState(0),Qe={color:i,lineCount:S(s,2,80),lineWidth:Math.max(.2,u),majorLines:l,elevation:S(h,0,3),foreground:S(m,0,1),scale:S(R,.2,5),detail:S(B,0,1),tilt:S(N,12,90),speed:L,direction:Ge[O]??Ge.forward,morph:Math.max(0,X),glow:Math.max(0,Z),depthOfField:S(ne,0,1),fog:S(Zt,0,1),brightness:Math.max(0,$t),opacity:S(qt,0,1),mouseInteraction:jt,hoverEffect:Et.includes(We)?We:"lift",mouseRadius:Math.max(.1,Wt),mouseStrength:Math.max(0,Kt),trail:S(Yt,0,1),parallax:S(Qt,0,1),clickEffect:Jt,markers:yt[eo]??-1,glitch:S(to,0,1),intro:oo,lightMode:ro,dpr:io,travelX:no},G=j.useRef(Qe);return G.current=Qe,j.useEffect(()=>{var vt;const W=Ke.current,A=Ye.current,so=Math.min(G.current.dpr||window.devicePixelRatio||1,2),e=A==null?void 0:A.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:so<1.5,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!W||!A||!e)return;const me=!!e.getExtension("EXT_color_buffer_float"),we=re(e,wt(me),Mt(me)),ae=me?re(e,fe,Ft):null,de=me?re(e,fe,St):null,ue=re(e,fe,Lt),ie=re(e,fe,Ct),Me=re(e,fe,At),Re=re(e,Rt,bt);if(!we||!ue||!ie||!Me||!Re)return;const Je=o=>o.preventDefault(),et=()=>co(o=>o+1);A.addEventListener("webglcontextlost",Je),A.addEventListener("webglcontextrestored",et);const tt=e.createVertexArray(),fo=me?e.RGBA16F:e.RGBA8,ve=(o,r,n,c)=>{const a=e.createTexture();return e.bindTexture(e.TEXTURE_2D,a),e.texStorage2D(e.TEXTURE_2D,1,n,o,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,c),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,c),a},Ne=()=>({texture:null,framebuffer:e.createFramebuffer(),depth:null,width:0,height:0}),Be=(o,r,n,c)=>{o.texture&&o.width===r&&o.height===n||(o.texture&&e.deleteTexture(o.texture),o.texture=ve(r,n,fo,e.CLAMP_TO_EDGE),o.width=r,o.height=n,e.bindFramebuffer(e.FRAMEBUFFER,o.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o.texture,0),c&&(o.depth||(o.depth=e.createRenderbuffer()),e.bindRenderbuffer(e.RENDERBUFFER,o.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,r,n),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,o.depth)))},be=Ne(),Se=Array.from({length:4},()=>[Ne(),Ne()]),I=de?[0,1].map(()=>{const o=ve(256,256,e.RG16F,e.REPEAT),r=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),{texture:o,framebuffer:r}}):null,pe=ve(1,1,e.RGBA8,e.REPEAT),E={texture:null,heights:null,framebuffer:e.createFramebuffer(),width:0,height:0};let le=0;const ho=(o,r)=>{E.texture&&o<=E.width&&r<=E.height||(E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),E.width=Math.max(o,Math.ceil(E.width*1.25),64),E.height=Math.max(r,Math.ceil(E.height*1.25),64),E.texture=ve(E.width,E.height,e.RGBA16F,e.CLAMP_TO_EDGE),E.heights=ve(E.width,E.height,e.R32F,e.CLAMP_TO_EDGE),e.bindTexture(e.TEXTURE_2D,E.heights),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,E.texture,0),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT1,e.TEXTURE_2D,E.heights,0),e.drawBuffers([e.COLOR_ATTACHMENT0,e.COLOR_ATTACHMENT1]))},$=(o,r)=>{e.activeTexture(e.TEXTURE0+o),e.bindTexture(e.TEXTURE_2D,r)},Y=((vt=window.matchMedia)==null?void 0:vt.call(window,"(prefers-reduced-motion: reduce)").matches)??!1,Oe=new Float32Array(16),xe=new Float32Array(16),ce=new Float32Array(12),U={until:0,next:1.5,roll:0,seed:0};let Ie=7919;const q=()=>(Ie=Ie*16807%2147483647,(Ie-1)/2147483646),K=[],z={x:0,y:0,inside:!1},d={width:1,height:1,ratio:1,cell:.05,cellKey:""},t={intro:G.current.intro&&!Y?0:1,rise:1,travelX:0,travelZ:0,autoTravelX:0,morph:0,yaw:0,pitch:0,yawVelocity:0,pitchVelocity:0,presence:0,focus:9,hit:null,brushFrom:null,sculptLife:0,burst:null,level:0,trace:0,clock:0,tilt:G.current.tilt,elevation:G.current.elevation,scale:G.current.scale};t.rise=te(t.intro);let ge=0,Le=0,Ce=!0,Ae=0;const Ue=()=>{const o=Math.min(t.tilt*Math.PI/180+t.pitch,Math.PI/2-1e-4),r=Nt(t.yaw,o),n=t.elevation*1.7*t.rise*.18,c=t.elevation*1.7*t.rise*1.3+.9,a=Math.max(9,(c-n)/Math.sin(o));return{...r,distance:a,eye:[-r.f[0]*a,n-r.f[1]*a,-r.f[2]*a]}},Xe=(o,r,n)=>{const c=d.width/d.height,a=De(c),y=[0,1,2].map(v=>o.f[v]+o.r[v]*r*a*c+o.u[v]*n*a),w=Math.hypot(y[0],y[1],y[2]);return y.map(v=>v/w)},ze=(o,r)=>r[0]*o.f[0]+r[1]*o.f[1]+r[2]*o.f[2],ke=(o,r)=>{const n=Xe(o,0,r);return n[1]>-.001?1/0:o.eye[1]/-n[1]*ze(o,n)},ot=(o,r)=>[ke(o,-1)*.9,o.distance,r.foreground],mo=(o,r,n,c)=>{const a=(n-o.eye[0])*o.f[0]-o.eye[1]*o.f[1]+(c-o.eye[2])*o.f[2];return r[2]+(1-r[2])*te((a-r[0])/Math.max(r[1]-r[0],.001))},rt=(o,r,n,c)=>{const a=Xe(o,n,c),y=t.elevation*1.7*t.rise,w=.45/t.scale,v=ot(o,r),T=x=>{const k=o.eye[0]+a[0]*x,b=o.eye[2]+a[2]*x,J=Ve(t.travelX+k,t.travelZ+b,w,t.morph*.37,t.morph*.23);return o.eye[1]+a[1]*x-J*y*mo(o,v,k,b)};let M=.05,_=T(M);for(let x=0;x<200&&M<160*.5;x++){const k=M+Math.max(.02,_*.4),b=T(k);if(b<0){let J=M,H=k;for(let se=0;se<10;se++){const ee=(J+H)*.5;T(ee)<0?H=ee:J=ee}return{x:t.travelX+o.eye[0]+a[0]*H,y:o.eye[1]+a[1]*H,z:t.travelZ+o.eye[2]+a[2]*H,depth:H*ze(o,a)}}M=k,_=b}return null},vo=(o,r,n)=>{const c=t.elevation*1.7*t.rise*1.7+.2+r.mouseStrength,a={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0,near:1/0},y=(w,v)=>{const T=o.eye[0]+w[0]*v,M=o.eye[2]+w[2]*v;a.minX=Math.min(a.minX,T),a.maxX=Math.max(a.maxX,T),a.minZ=Math.min(a.minZ,M),a.maxZ=Math.max(a.maxZ,M)};for(const w of[-1.08,0,1.08])for(const v of[-1.08,1.08]){const T=Xe(o,w,v),M=Math.max(ze(o,T),.001);let _=.05,x=n*1.05/M;T[1]<-1e-4&&(_=Math.max(.05,(o.eye[1]-c)/-T[1]),x=Math.min(x,o.eye[1]/-T[1])),_=Math.min(_,x),y(T,_),y(T,x),a.near=Math.min(a.near,_*M)}return a},it=(o,r)=>{const n=Math.floor(t.travelX/r),c=Math.floor(t.travelZ/r),a=t.travelX-n*r,y=t.travelZ-c*r,w=Math.floor((o.minX+a)/r)-2,v=Math.floor((o.minZ+y)/r)-2,T=S(Math.ceil((o.maxX+a)/r)+2-w,1,4e3),M=S(Math.ceil((o.maxZ+y)/r)+2-v,1,Math.floor(2e5*1.5/T));return{cell:r,camX:n,camZ:c,fracX:a,fracZ:y,k0:w,m0:v,columns:T,rows:M}},nt=()=>{const o=G.current,r=Ue();Bt(r,d.width/d.height,Oe);const n=ke(r,-1),c=Math.min(ke(r,1),r.distance*3.2),a=Math.max(c,n*1.6,r.distance*1.4),y=a+(n*1.8-a)*o.fog,w=y*.7+(n*.7-y*.7)*o.fog,v=vo(r,o,y),T=`${d.width}x${d.height}@${d.ratio}|${Math.round(t.tilt/4)}|${Math.round(t.elevation*5)}|${o.fog}`;if(T!==d.cellKey){d.cellKey=T;const g=d.height*d.ratio*.5/De(d.width/d.height);let C=S(14*Math.max(v.near,.5)/g,.02,.4);const F=(v.maxX-v.minX)*(v.maxZ-v.minZ)/(C*C);F>2e5&&(C*=Math.sqrt(F/2e5)),d.cell=C}const M=Dt(o.color),_=t.elevation*1.7*t.rise,x=it(v,d.cell),k=ot(r,o),b=o.markers>=0?it(v,Tt):null,H=(t.hit&&o.mouseInteraction?t.presence:0)*(.35+.5*o.mouseStrength),se=o.depthOfField*d.height*.016,ee=te(t.intro/.35),P=t.hit?t.hit.x:0,V=t.hit?t.hit.z:0;if(xe.fill(0),K.forEach((g,C)=>{xe.set([g.x,g.z,g.age*4.2,Math.exp(-g.age*1.1)*te(g.age/.08)],C*4)}),e.bindVertexArray(tt),ae){const g=x.columns+7,C=x.rows+7;ho(g,C),e.bindFramebuffer(e.FRAMEBUFFER,E.framebuffer),e.viewport(0,0,g,C),e.useProgram(ae.program);const F=ae.uniforms;$(0,I?I[le].texture:pe),e.uniform1i(F.uSculpt,0),e.uniform1f(F.uSculptOn,I?1:0),e.uniform1f(F.uFrequency,.45/t.scale),e.uniform2f(F.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(F.uPulses,xe),e.uniform2i(F.uBase,x.k0-2+x.camX,x.m0-2+x.camZ),e.uniform1f(F.uCell,x.cell),e.uniform1f(F.uDetail,o.detail),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3)}const Pe=(g,C,F,D)=>{e.viewport(0,0,C,F),e.useProgram(we.program);const f=we.uniforms;if($(0,ae?E.texture:pe),e.uniform1i(f.uField,0),$(1,ae?E.heights:pe),e.uniform1i(f.uHeightField,1),e.uniform1f(f.uFrequency,.45/t.scale),e.uniform2f(f.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(f.uPulses,xe),e.uniform2i(f.uOrigin,x.k0,x.m0),e.uniform2i(f.uCamCell,x.camX,x.camZ),e.uniform2f(f.uCamFrac,x.fracX,x.fracZ),e.uniform1f(f.uCell,x.cell),e.uniform1i(f.uStride,D),e.uniform1f(f.uHeight,_),e.uniform3fv(f.uEye,r.eye),e.uniform3fv(f.uForward,r.f),e.uniform3fv(f.uNear,k),e.uniform1f(f.uRefDepth,r.distance),e.uniformMatrix4fv(f.uViewProj,!1,Oe),e.uniform1f(f.uDetail,o.detail),e.uniform1f(f.uLines,o.lineCount),e.uniform1f(f.uLineWidth,o.lineWidth*g),e.uniform1f(f.uMajor,o.majorLines?1:0),e.uniform3fv(f.uColor,M),e.uniform1f(f.uBrightness,o.brightness),e.uniform2f(f.uFade,w,y),e.uniform3f(f.uFocus,t.focus,se*g,d.height*.03*g),e.uniform4f(f.uHeat,P,V,.9*o.mouseRadius,H),e.uniform4f(f.uLamp,P,t.hit?t.hit.y+1.4:0,V,H),e.uniform4f(f.uTrace,t.level,t.trace,P,V),e.uniform3fv(f.uSun,gt),e.uniform1f(f.uReveal,ee),e.uniform1f(f.uLightMode,o.lightMode?1:0),e.uniform1f(f.uOpacity,o.opacity),e.uniform4fv(f.uGlitch,ce),e.uniform1f(f.uGlitchSeed,U.seed),e.uniform1f(f.uPixel,g),e.enable(e.DEPTH_TEST),e.depthFunc(e.LESS),e.disable(e.BLEND),e.clearColor(0,0,0,0),e.clearDepth(1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,2*(Math.ceil(x.columns/D)+1),Math.ceil(x.rows/D)),b){e.useProgram(Re.program);const p=Re.uniforms;$(2,I?I[le].texture:pe),e.uniform1i(p.uSculpt,2),e.uniform1f(p.uSculptOn,I?1:0),e.uniform1f(p.uFrequency,.45/t.scale),e.uniform2f(p.uMorph,t.morph*.37,t.morph*.23),e.uniform4fv(p.uPulses,xe),e.uniform3fv(p.uEye,r.eye),e.uniform3fv(p.uForward,r.f),e.uniform3fv(p.uNear,k),e.uniform2i(p.uOrigin,b.k0,b.m0),e.uniform2i(p.uCamCell,b.camX,b.camZ),e.uniform2f(p.uCamFrac,b.fracX,b.fracZ),e.uniform1f(p.uSpacing,b.cell),e.uniform1i(p.uColumns,b.columns+1),e.uniform1f(p.uHeight,_),e.uniformMatrix4fv(p.uViewProj,!1,Oe),e.uniform2f(p.uView,C,F),e.uniform1f(p.uSize,4*g),e.uniform1f(p.uRefDepth,r.distance),e.uniform4f(p.uHeat,P,V,1.2*o.mouseRadius,H),e.uniform1f(p.uTime,t.clock),e.uniform4fv(p.uGlitch,ce),e.uniform1f(p.uPixel,g),e.uniform3fv(p.uColor,M),e.uniform2f(p.uFade,w,y),e.uniform1f(p.uReveal,ee),e.uniform1f(p.uBrightness,o.brightness),e.uniform1f(p.uLightMode,o.lightMode?1:0),e.uniform1f(p.uOpacity,o.opacity),e.uniform1f(p.uStyle,o.markers),e.depthFunc(e.LEQUAL),e.depthMask(!1),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,(b.columns+1)*(b.rows+1)),e.disable(e.BLEND),e.depthMask(!0)}e.disable(e.DEPTH_TEST)},Ee=o.glow>.001;if(Ee){const g=Math.max(1,Math.round(d.width/2)),C=Math.max(1,Math.round(d.height/2));Be(be,g,C,!0),Se.forEach((D,f)=>{const p=Math.max(1,Math.round(d.width/2**(f+2))),pt=Math.max(1,Math.round(d.height/2**(f+2)));Be(D[0],p,pt,!1),Be(D[1],p,pt,!1)}),e.bindFramebuffer(e.FRAMEBUFFER,be.framebuffer),Pe(.5,g,C,2);let F=be;Se.forEach(([D,f])=>{e.bindFramebuffer(e.FRAMEBUFFER,D.framebuffer),e.viewport(0,0,D.width,D.height),e.useProgram(ue.program),$(0,F.texture),e.uniform1i(ue.uniforms.uSource,0),e.uniform2f(ue.uniforms.uTarget,D.width,D.height),e.uniform2f(ue.uniforms.uTexel,1/F.width,1/F.height),e.drawArrays(e.TRIANGLES,0,3),e.useProgram(ie.program),e.uniform1i(ie.uniforms.uSource,0),e.uniform2f(ie.uniforms.uTarget,f.width,f.height),e.bindFramebuffer(e.FRAMEBUFFER,f.framebuffer),$(0,D.texture),e.uniform2f(ie.uniforms.uStep,1/D.width,0),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,D.framebuffer),$(0,f.texture),e.uniform2f(ie.uniforms.uStep,0,1/f.height),e.drawArrays(e.TRIANGLES,0,3),F=D})}if(e.bindFramebuffer(e.FRAMEBUFFER,null),Pe(d.ratio,A.width,A.height,1),Ee){e.viewport(0,0,A.width,A.height),e.useProgram(Me.program);const g=Me.uniforms;Se.forEach(([C],F)=>{$(F,C.texture),e.uniform1i(g[`uBloom${F}`],F)}),e.uniform2f(g.uView,A.width,A.height),e.uniform1f(g.uGlow,o.glow*ee),e.uniform1f(g.uLightMode,o.lightMode?1:0),e.enable(e.BLEND),o.lightMode?e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA):e.blendFunc(e.ONE,e.ONE),e.drawArrays(e.TRIANGLES,0,3),e.disable(e.BLEND)}for(let g=4;g>=0;g--)$(g,null)},po=(o,r)=>{if(!I||!de)return!1;const n=o.mouseInteraction&&o.hoverEffect==="lift"&&t.presence>.001?t.hit:null,c=t.burst;if(!n&&!c&&t.sculptLife<=0)return!1;const a=t.brushFrom||n,y=I[le],w=I[1-le];e.bindFramebuffer(e.FRAMEBUFFER,w.framebuffer),e.viewport(0,0,256,256),e.useProgram(de.program);const v=de.uniforms;if($(0,y.texture),e.uniform1i(v.uPrevious,0),n&&a?e.uniform4f(v.uSegment,a.x,a.z,n.x,n.z):e.uniform4f(v.uSegment,0,0,0,0),e.uniform4f(v.uBrush,1.1*o.mouseRadius,.9*o.mouseStrength,1-Math.exp(-r*7),n?t.presence:0),c){const M=te(c.age/.7);c.age+=r;const _=(te(c.age/.7)-M)*.9*Math.max(o.mouseStrength,.3);e.uniform4f(v.uBurst,c.x,c.z,1.6*o.mouseRadius,_),c.age>=.7&&(t.burst=null)}else e.uniform4f(v.uBurst,0,0,1,0);const T=.25+3*o.trail*o.trail;return e.uniform2f(v.uDecay,Math.exp(-r/T),Math.exp(-r/.7)),e.disable(e.BLEND),e.drawArrays(e.TRIANGLES,0,3),le=1-le,t.brushFrom=n?{x:n.x,z:n.z}:null,n||c?t.sculptLife=T*6:t.sculptLife-=r,!0};let at=G.current.dpr;const He=()=>{const o=G.current;at=o.dpr,d.width=Math.max(1,W.clientWidth),d.height=Math.max(1,W.clientHeight),d.ratio=Math.min(o.dpr||window.devicePixelRatio||1,2),A.width=Math.max(1,Math.round(d.width*d.ratio)),A.height=Math.max(1,Math.round(d.height*d.ratio)),nt(),Q()},ut=o=>{if(ge=0,!Ce||document.hidden)return;const r=G.current;r.dpr!==at&&He();const n=Le?S((o-Le)/1e3,0,1/20):1/60;Le=o,!r.intro||Y?t.intro=1:t.intro<1&&(t.intro=Math.min(1,t.intro+n/2.8)),t.rise=te(t.intro);const c=Y?1:1-Math.exp(-n/.4);t.tilt+=(r.tilt-t.tilt)*c,t.elevation+=(r.elevation-t.elevation)*c,t.scale=r.scale,t.clock+=n;const a=Y?0:r.glitch;if(a>0)if(t.clock>=U.next&&t.clock>=U.until&&(U.until=t.clock+.1+q()*.22*(.5+a),U.next=U.until+(9-7.4*a)*(.45+q()*1.1),U.roll=0),t.clock<U.until){if(t.clock>=U.roll){ce.fill(0);const P=1+Math.floor(q()*3);for(let V=0;V<P;V++){const Pe=3+q()*q()*d.height*.14,Ee=q()*d.height,g=(q()-.5)*2*(10+46*a);ce.set([Ee,Ee+Pe,g,1+q()*3*a],V*4)}U.seed=q(),U.roll=t.clock+.04+q()*.05}}else ce.fill(0);else ce.fill(0);Y||(t.autoTravelX+=r.direction[0]*r.speed*.8*n,t.travelZ+=r.direction[1]*r.speed*.8*n,t.morph+=r.morph*.12*n);const y=t.autoTravelX+(Number.isFinite(r.travelX)?r.travelX:0);t.travelX+=(y-t.travelX)*(1-Math.exp(-n/.3));const w=z.inside&&r.mouseInteraction;t.presence+=((w?1:0)-t.presence)*(1-Math.exp(-n/(w?.18:.45)));const v=z.x/d.width*2-1,T=1-z.y/d.height*2,M=Y||!w?0:r.parallax,_=v*M*.09,x=-T*M*.045;t.yawVelocity+=(38*(_-t.yaw)-11*t.yawVelocity)*n,t.pitchVelocity+=(38*(x-t.pitch)-11*t.pitchVelocity)*n,t.yaw+=t.yawVelocity*n,t.pitch+=t.pitchVelocity*n;const k=Ue();w?(t.hit=rt(k,r,v,T),t.hit&&t.brushFrom&&Math.hypot(t.hit.x-t.brushFrom.x,t.hit.z-t.brushFrom.z)>3*r.mouseRadius&&(t.brushFrom=null)):t.presence<.002&&(t.hit=null,t.brushFrom=null);const b=t.hit&&r.mouseInteraction&&r.hoverEffect==="trace"?t.presence:0;if(t.hit){const P=.45/t.scale,V=Ve(t.hit.x,t.hit.z,P,t.morph*.37,t.morph*.23)+r.detail*.1*Pt(t.hit.x,t.hit.z,P);t.level=t.trace<.01?V:t.level+(V-t.level)*(1-Math.exp(-n/.09))}t.trace+=(b-t.trace)*(1-Math.exp(-n/.2));const J=t.hit&&r.depthOfField>0?t.hit.depth:k.distance;t.focus+=(J-t.focus)*(1-Math.exp(-n/.35));for(let P=K.length-1;P>=0;P--)K[P].age+=n,K[P].age>4&&K.splice(P,1);const H=po(r,n);nt();const se=Math.abs(r.tilt-t.tilt)>.01||Math.abs(r.elevation-t.elevation)>1e-4||Math.abs(t.yaw-_)>1e-4||Math.abs(t.pitch-x)>1e-4||Math.abs(t.yawVelocity)>1e-4||Math.abs(t.pitchVelocity)>1e-4||Math.abs(J-t.focus)>.001||Math.abs(b-t.trace)>.001;Ae=!Y&&(r.speed!==0||r.morph!==0||r.glitch>0||r.markers>=0)||t.intro<1||K.length>0||H||se||t.presence>.001&&t.presence<.999?0:Ae+n,Ae<.5&&(ge=requestAnimationFrame(ut))};function Q(){Ae=0,!ge&&Ce&&!document.hidden&&(Le=0,ge=requestAnimationFrame(ut))}const lt=o=>{const r=W.getBoundingClientRect(),n=o.clientX-r.left,c=o.clientY-r.top;return{x:n,y:c,inside:n>=0&&c>=0&&n<=r.width&&c<=r.height}},ct=o=>{const{x:r,y:n,inside:c}=lt(o),a=z.inside;z.inside=c,c&&(z.x=r,z.y=n),(c||a)&&Q()},st=o=>{const r=G.current,{x:n,y:c,inside:a}=lt(o);if(!a||(z.x=n,z.y=c,z.inside=!0,Q(),r.glitch>0&&!Y&&(U.until=t.clock+.16,U.roll=0),!r.mouseInteraction||r.clickEffect!=="pulse"&&r.clickEffect!=="peak"))return;const y=rt(Ue(),r,n/d.width*2-1,1-c/d.height*2);y&&(r.clickEffect==="peak"&&I?t.burst={x:y.x,z:y.z,age:0}:r.clickEffect==="pulse"&&(K.length>=4&&K.shift(),K.push({x:y.x,z:y.z,age:0})))},_e=o=>{o.pointerType==="touch"&&(z.inside=!1,Q())},ft=()=>{z.inside=!1,Q()},ht=()=>Q(),mt=new ResizeObserver(He);mt.observe(W);const dt=new IntersectionObserver(o=>{Ce=o.some(r=>r.isIntersecting),Ce&&Q()});return dt.observe(W),window.addEventListener("pointermove",ct,{passive:!0}),window.addEventListener("pointerdown",st,{passive:!0}),window.addEventListener("pointerup",_e,{passive:!0}),window.addEventListener("pointercancel",_e,{passive:!0}),document.documentElement.addEventListener("pointerleave",ft),document.addEventListener("visibilitychange",ht),He(),he.current=Q,()=>{var o;cancelAnimationFrame(ge),he.current=null,mt.disconnect(),dt.disconnect(),window.removeEventListener("pointermove",ct),window.removeEventListener("pointerdown",st),window.removeEventListener("pointerup",_e),window.removeEventListener("pointercancel",_e),document.documentElement.removeEventListener("pointerleave",ft),document.removeEventListener("visibilitychange",ht),A.removeEventListener("webglcontextlost",Je),A.removeEventListener("webglcontextrestored",et),[be,...Se.flat()].forEach(r=>{r.texture&&e.deleteTexture(r.texture),r.depth&&e.deleteRenderbuffer(r.depth),e.deleteFramebuffer(r.framebuffer)}),I==null||I.forEach(r=>{e.deleteTexture(r.texture),e.deleteFramebuffer(r.framebuffer)}),e.deleteTexture(pe),e.deleteVertexArray(tt),E.texture&&e.deleteTexture(E.texture),E.heights&&e.deleteTexture(E.heights),e.deleteFramebuffer(E.framebuffer),[we,ae,de,ue,ie,Me,Re].forEach(r=>r&&e.deleteProgram(r.program)),(o=e.getExtension("WEBGL_lose_context"))==null||o.loseContext()}},[lo]),j.useEffect(()=>{var W;(W=he.current)==null||W.call(he)}),ye.jsx("div",{ref:Ke,className:`topography-container ${ao}`.trim(),style:uo,children:ye.jsx("canvas",{ref:Ye,className:"topography-canvas","aria-hidden":"true"})})},It={color:"#4f7cff",lineCount:22,lineWidth:1.2,majorLines:!0,elevation:1,foreground:.2,scale:1,detail:.35,tilt:32,speed:.25,direction:"forward",morph:.2,glow:.6,depthOfField:.4,fog:.35,brightness:1,hoverEffect:"lift",clickEffect:"pulse",markers:"none",glitch:0},Ut={sonar:{color:"#2fe0c8",tilt:24,lineCount:26,glow:1,depthOfField:.7,hoverEffect:"light",markers:"dots",glitch:.35}},Xt=".topography-container{position:relative;width:100%;height:100%;overflow:hidden}.topography-canvas{display:block;width:100%;height:100%}",$e="biyu-topography-style",zt="data-topography",kt=()=>{if(document.getElementById($e))return;const i=document.createElement("style");i.id=$e,i.textContent=Xt,document.head.appendChild(i)},Ht={...It,...Ut.sonar,lineCount:16,lineWidth:1,glow:.45,depthOfField:.3,fog:.3,morph:.1,speed:.18,detail:.3,glitch:.1,mouseInteraction:!0,mouseRadius:.8,mouseStrength:.45,trail:.2,parallax:.35,intro:!0,dpr:.75},Gt=({host:i,...s})=>{const[u,l]=j.useState(0);return j.useEffect(()=>{let h=0,m=NaN;const R=()=>{const B=i.closest(".hero"),N=B?parseFloat(getComputedStyle(B).getPropertyValue("--bgp")):0,L=Number.isFinite(N)?N:0;L!==m&&(m=L,l(L*.35)),h=requestAnimationFrame(R)};return h=requestAnimationFrame(R),()=>cancelAnimationFrame(h)},[i]),ye.jsx(Ot,{...s,travelX:u})},Vt=i=>{if(!i||i.dataset.biyuTopo==="1")return;i.dataset.biyuTopo="1",xt.createRoot(i).render(ye.jsx(Gt,{host:i,...Ht}))},qe=()=>{document.querySelectorAll(`[${zt}]`).forEach(i=>{i.dataset.biyuTopo!=="1"&&Vt(i)})},je=()=>{kt(),qe(),new MutationObserver(qe).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",je):je()})(BiyuJSXRuntime,BiyuReact,BiyuReactDOMClient);
