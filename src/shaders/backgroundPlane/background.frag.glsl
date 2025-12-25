precision highp float;


struct Clock {
  float elapsed;
  float delta;
};

struct Scroll {
  float currentScroll;
  float delta;
};

uniform sampler2D uTexture;
uniform float uOffsetX;
uniform float uOffsetY;
uniform float uSizePerlinValue;
uniform float uBlur;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uThresholdSpeed;
uniform float uThresholdValue;
uniform float uScrollSpeed;
uniform float uFbmOctaves;
uniform float uFbmGain;
uniform float uFbmLacunarity;
uniform float uSpeed;
uniform Clock clock;
uniform Scroll scroll;

// aspect ratio
uniform float uAspectRatio;

varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float noise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N=8 points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  float n = 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  return 0.5 + 0.5 * n;
}

float fbm(vec2 uv) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  int octaves = int(uFbmOctaves);
  float animatedGain = uFbmGain + 0.2;

  float z_time = clock.elapsed * 0.00007 * uSpeed + scroll.currentScroll * uScrollSpeed * 0.00002;

  for (int i = 0; i < 10; i++) {
    if (i >= octaves) break;

    value += amplitude * noise(vec3(uv * frequency, z_time * frequency)); 
    
    frequency *= uFbmLacunarity;
    amplitude *= animatedGain;
  }
  return value;
}


void main() {
  vec4 color1 = vec4(uColor1.rgb, 1.0);
  vec4 color2 = vec4(uColor2.rgb, 1.0);
  vec2 uv = vUv;

  uv.x *= uAspectRatio;

  uv.x += uOffsetX;
  uv.y -= uOffsetY;

  float time = clock.elapsed * 0.00005;
  vec2 animatedUv = uv;

  float dynamicThreshold = uThresholdValue + uThresholdSpeed * 0.01 * 0.9;

  float noiseValue = fbm(animatedUv * uSizePerlinValue * 0.2);
  float t = smoothstep(dynamicThreshold - uBlur, dynamicThreshold + uBlur, noiseValue);

  gl_FragColor.rgb = mix(color1.rgb, color2.rgb, t);
  gl_FragColor.a = 1.0;
}