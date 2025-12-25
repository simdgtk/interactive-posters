uniform sampler2D tDiffuse;
uniform float uTime;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uCellSize;
uniform float uCharactersCount;
uniform sampler2D uCharacters;
uniform vec3 uColor;
uniform vec3 uBackgroundColor;
const vec2 SIZE = vec2(16.);

// Brightness
vec3 greyscale(vec3 color, float strength) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), strength);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);

    // Pixelization
    vec2 cell = uResolution / uCellSize;
    vec2 grid = 1.0 / cell;
    vec2 pixelizedUV = grid * (0.5 + floor(vUv / grid));
    vec4 pixelized = texture2D(tDiffuse, pixelizedUV);

    // Mapping Brightness to a Character
    float greyscaled = greyscale(pixelized.rgb).r;
    float characterIndex = floor((uCharactersCount - 1.0) * greyscaled);

    // Sampling the Character Texture
    vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
    vec2 offset = vec2(characterPosition.x, characterPosition.y) / SIZE;

    vec2 charUV = mod(vUv * (cell / SIZE), 1.0 / SIZE) + offset;
    vec4 asciiCharacter = texture2D(uCharacters, charUV);

    float charMask = asciiCharacter.a; 
    
    vec3 finalColor = mix(uBackgroundColor, uColor, charMask);
    
    gl_FragColor = vec4(finalColor, 0.2);
}