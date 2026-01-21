/// <reference types="vite/client" />

// CSS Module type declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Allow side-effect CSS imports
declare module '*.css?inline';
declare module '*.css?url';
