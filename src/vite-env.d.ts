/// <reference types="vite/client" />

// Para arquivos de imagem
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

// Para arquivos de áudio
declare module '*.mp3' {
  const src: string;
  export default src;
}

// Para arquivos JSON
declare module '*.json' {
  const value: any;
  export default value;
}
