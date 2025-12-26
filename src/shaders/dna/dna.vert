varying vec2 vUv;
uniform float uTime;
uniform float uScrollProgress;
uniform float uScrollDelta;

void main() {
    vUv = uv;
    
    vec3 newPosition = position;
    
    float twistAmount = 2.0;
    float speed = 0.002;
    float time = uTime * speed;
    
    float angle = newPosition.y * twistAmount + uScrollProgress * 8.0 + uTime * - 0.0004;
    
    float x = newPosition.x;
    float z = newPosition.z;
    
    float s = sin(angle);
    float c = cos(angle);

    newPosition.x = x * c - z * s;
    newPosition.z = x * s + z * c;

    csm_Position = newPosition;

    vec3 newNormal = normal;
    newNormal.x = normal.x * c - normal.z * s;
    newNormal.z = normal.x * s + normal.z * c;
    csm_Normal = newNormal;
}