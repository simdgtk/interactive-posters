uniform float uTime;
uniform float uScrollProgress;
uniform vec2 uMouse;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}