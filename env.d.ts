/// <reference types="vite/client" />

// Déclaration de module pour vite-plugin-glsl
declare module "*.glsl" {
  const shader: string;
  export default shader;
}

declare module "*.vert" {
  const shader: string;
  export default shader;
}

declare module "*.frag" {
  const shader: string;
  export default shader;
}

declare module "*.wgsl" {
  const shader: string;
  export default shader;
}

// Fallback pour ?raw si nécessaire
declare module "*.glsl?raw" {
  const content: string;
  export default content;
}
