# Reprogramación Foca (RFAI) - Clínico Equilibrar

Plataforma web progresiva (PWA) para la gestión del programa clínico "Reprogramación Focalizada de Alto Impacto" para el tratamiento de la Culpa.

## 🏗 Stack Tecnológico

### Frontend
- **Framework:** React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Visualización de Datos:** Recharts
- **Iconografía:** Lucide React

### Backend (Objetivo)
- **Infraestructura:** Google Cloud Platform (GCP)
- **Base de Datos:** MySQL (Cloud SQL)
- **Gestión de Servidor:** MobaXterm (Acceso SSH/SFTP)

## 📂 Estructura del Proyecto

```
/
├── components/         # Componentes React (Dashboards, Modales, UI)
├── database/           # Scripts SQL para inicialización de BD
│   └── schema.sql      # Estructura completa de tablas
├── docs/               # Documentación de arquitectura
│   └── architecture.mermaid # Diagrama de clases
├── constants.ts        # Datos Mock y configuración estática
├── types.ts            # Definiciones de tipos TypeScript
├── App.tsx             # Componente raíz y enrutamiento lógico
└── index.html          # Punto de entrada (Configurado para Mobile)
```

## 🔐 Roles de Usuario

1.  **ADMIN:** Acceso total, gestión de usuarios, configuración global del sistema y servidores.
2.  **COORDINATOR:** Gestión operativa, asignación de pacientes a profesionales, monitoreo de capacidad.
3.  **PROFESSIONAL:** Atención clínica, seguimiento de evolución (tests, audios), agenda de pacientes.
4.  **CLIENT:** Acceso al programa paso a paso (4 semanas), guías interactivas, audios y tests.

## 🚀 Despliegue y Migración

Este proyecto está preparado para ser migrado a plataformas de desarrollo continuo (como Antigravity).

1.  **Base de Datos:** Ejecutar `database/schema.sql` en la instancia MySQL de Google Cloud.
2.  **Variables de Entorno:** Configurar conexiones a API en un archivo `.env` futuro (actualmente usa Mocks en `constants.ts`).

## 📱 Optimización Móvil

La aplicación está diseñada con un enfoque "Mobile-First", utilizando Tailwind para breakpoints responsivos y metaetiquetas específicas en `index.html` para simular una experiencia nativa en iOS y Android.
