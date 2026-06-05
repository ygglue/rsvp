export const vertexShader = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_uv;
}
`;

export const sceneFragment = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_starDensity;
uniform float u_starSize;

vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 st) {
  float value = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(st * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return value;
}

vec3 starField(vec2 uv, float time, float aspect, float dustNoise, float band) {
  vec3 color = vec3(0.0);
  float cellsX = 200.0 * u_starDensity;
  float cellsY = cellsX / aspect;

  vec2 gridUV = uv * vec2(cellsX, cellsY);
  vec2 gridID = floor(gridUV);
  vec2 gridPos = fract(gridUV) - 0.5;

  vec2 h = hash2(gridID);
  float prob = h.x;
  float size = h.y;
  float twinklePhase = h.y * 6.28;
  float twinkleSpeed = 1.0 + h.x * 3.0;

  float starProb = 1.0 - 0.02 * u_starDensity;

  if (prob > starProb) {
    float dist = length(gridPos);
    float visualSize = (0.008 + size * 0.022) * u_starSize;
    float twinkle = 0.4 + 0.6 * (0.5 + 0.5 * sin(time * twinkleSpeed + twinklePhase));
    float star = smoothstep(visualSize, 0.0, dist);
    float brightness = (prob - starProb) / (1.0 - starProb);

    float dust = 1.0 - dustNoise * band * 0.5;
    brightness *= max(0.15, dust);

    vec3 starColor = mix(
      vec3(0.85, 0.9, 1.0),
      vec3(0.7, 0.8, 1.0),
      prob * 0.4
    );
    color += starColor * star * twinkle * brightness;

    if (size > 0.4) {
      float glow = smoothstep(visualSize * 2.5, 0.0, dist);
      color += vec3(0.75, 0.85, 1.0) * glow * twinkle * brightness * 0.25;
    }
  }

  return color;
}

void main() {
  vec2 uv = v_uv;

  vec3 color = vec3(0.02, 0.05, 0.12);

  float band = smoothstep(0.6, 0.0, abs(uv.x * 0.6 + uv.y * 0.8 - 0.5));

  float n1 = fbm(uv * 2.0 + vec2(0.5, 0.3) + u_time * 0.01);
  float n2 = fbm(uv * 2.5 - vec2(0.4, 0.6) + u_time * 0.008);
  float n3 = fbm(uv * 1.8 + vec2(0.2, 0.8) + u_time * 0.006);

  vec3 n1col = vec3(0.03, 0.06, 0.13);
  vec3 n2col = vec3(0.04, 0.08, 0.16);
  vec3 n3col = vec3(0.02, 0.03, 0.07);
  vec3 n4col = vec3(0.03, 0.05, 0.1);

  vec3 nebula = vec3(0.0);
  nebula += n1col * n1 * 0.5;
  nebula += n2col * n2 * 0.35;
  nebula += n3col * n3 * 0.25;
  nebula += n4col * n1 * n2 * 0.15;
  nebula *= band * 1.2;

  color += nebula;

  float clouds1 = fbm(uv * 0.3 + u_time * 0.008 + vec2(0.3, 0.8));
  color += vec3(0.02, 0.04, 0.08) * clouds1 * 0.3;

  float clouds2 = pow(fbm(uv * 0.7 - u_time * 0.012 + vec2(1.5, 1.2)), 1.5);
  color += vec3(0.025, 0.05, 0.1) * clouds2 * 0.2;

  float clouds3 = pow(fbm(uv * 1.5 + u_time * 0.02 + vec2(0.3, 0.8)), 2.5);
  color += vec3(0.03, 0.06, 0.12) * clouds3 * 0.15;

  float aspect = u_resolution.x / u_resolution.y;
  float dustNoise = fbm(uv * 2.0 + vec2(0.3, 0.7) + u_time * 0.002) * 0.7
                  + fbm(uv * 6.0 + vec2(1.2, 0.9) + u_time * 0.001) * 0.3;
  vec3 stars = starField(uv, u_time, aspect, dustNoise, band);
  color += stars;

  gl_FragColor = vec4(color, 1.0);
}
`;

export const brightFragment = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_scene;
uniform float u_threshold;

void main() {
  vec3 color = texture2D(u_scene, v_uv).rgb;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float brightness = max(luminance - u_threshold, 0.0);
  gl_FragColor = vec4(color * step(u_threshold, luminance) * 3.0, 1.0);
}
`;

export const blurFragment = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_offset;
uniform vec2 u_resolution;
uniform float u_blurSpread;

void main() {
  vec2 texel = 1.0 / u_resolution;
  vec2 off = u_offset * texel * u_blurSpread;

  vec4 c = vec4(0.0);
  c += texture2D(u_texture, v_uv - 6.0 * off) * 0.019;
  c += texture2D(u_texture, v_uv - 5.0 * off) * 0.034;
  c += texture2D(u_texture, v_uv - 4.0 * off) * 0.056;
  c += texture2D(u_texture, v_uv - 3.0 * off) * 0.083;
  c += texture2D(u_texture, v_uv - 2.0 * off) * 0.110;
  c += texture2D(u_texture, v_uv - 1.0 * off) * 0.130;
  c += texture2D(u_texture, v_uv) * 0.137;
  c += texture2D(u_texture, v_uv + 1.0 * off) * 0.130;
  c += texture2D(u_texture, v_uv + 2.0 * off) * 0.110;
  c += texture2D(u_texture, v_uv + 3.0 * off) * 0.083;
  c += texture2D(u_texture, v_uv + 4.0 * off) * 0.056;
  c += texture2D(u_texture, v_uv + 5.0 * off) * 0.034;
  c += texture2D(u_texture, v_uv + 6.0 * off) * 0.019;

  gl_FragColor = c;
}
`;

export const compositeFragment = `
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_intensity;

void main() {
  vec3 scene = texture2D(u_scene, v_uv).rgb;
  vec3 bloom = texture2D(u_bloom, v_uv).rgb;
  gl_FragColor = vec4(scene + bloom * u_intensity, 1.0);
}
`;
