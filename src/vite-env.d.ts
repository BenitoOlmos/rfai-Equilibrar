/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // Agregar más variables según necesites
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
