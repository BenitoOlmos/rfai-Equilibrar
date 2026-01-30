# Estructura de Carpetas - Sistema RFAI
# Modelo: Monorepo con Backend y Frontend separados

```
rfai-Equilibrar/
│
├── .env                          # Variables de entorno (NO subir a Git)
├── .env.example                  # Template de configuración
├── .gitignore                    # Archivos ignorados por Git
├── package.json                  # Dependencias raíz (scripts compartidos)
├── README.md                     # Documentación principal
│
├── database/                     # Scripts SQL y migraciones
│   ├── schema_v3_drip_content.sql       # Schema completo XAMPP
│   ├── migrations/                      # Migraciones versionadas
│   │   ├── 001_initial_schema.sql
│   │   └── 002_add_analytics.sql
│   ├── seeds/                           # Datos de prueba
│   │   ├── dev_users.sql
│   │   └── sample_programs.sql
│   └── backups/                         # Respaldos (excluir de Git)
│
├── server/                       # BACKEND (Node.js + Express)
│   ├── package.json              # Dependencias del backend
│   ├── tsconfig.json             # Config TypeScript (si se usa TS)
│   ├── index.js                  # Punto de entrada principal
│   │
│   ├── config/                   # Configuraciones
│   │   ├── db.js                 # Pool de conexiones MySQL
│   │   ├── auth.js               # Config JWT y sesiones
│   │   └── cloudinary.js         # Config almacenamiento (opcional)
│   │
│   ├── middleware/               # Middlewares personalizados
│   │   ├── authMiddleware.js     # Verificación de JWT
│   │   ├── checkWeekAccess.js    # ⭐ Middleware de desbloqueo temporal
│   │   ├── roleMiddleware.js     # Control de roles
│   │   ├── errorHandler.js       # Manejo de errores global
│   │   └── logger.js             # Logging de requests
│   │
│   ├── routes/                   # Definición de rutas
│   │   ├── index.js              # Agregador de rutas
│   │   ├── authRoutes.js         # Login, registro, refresh token
│   │   ├── programasRoutes.js    # CRUD de programas
│   │   ├── matriculasRoutes.js   # Asignación cliente-programa
│   │   ├── recursosRoutes.js     # Acceso a audios/tests/guías
│   │   ├── guiasRoutes.js        # ⭐ Guías interactivas + autosave
│   │   ├── testsRoutes.js        # Submisión y resultados de tests
│   │   ├── analyticsRoutes.js    # ⭐ Heartbeat de audios
│   │   └── adminRoutes.js        # Panel de administración
│   │
│   ├── controllers/              # Lógica de negocio
│   │   ├── authController.js
│   │   ├── programasController.js
│   │   ├── recursosController.js
│   │   ├── guiasController.js    # Autosave con debounce
│   │   ├── testsController.js
│   │   └── analyticsController.js
│   │
│   ├── services/                 # Capa de servicios (lógica reutilizable)
│   │   ├── desbloqueoService.js  # ⭐ Cálculo de acceso temporal
│   │   ├── emailService.js       # Envío de notificaciones
│   │   ├── progressService.js    # Cálculo de % de avance
│   │   └── analyticsService.js   # Procesamiento de logs
│   │
│   ├── models/                   # Modelos de datos (opcional - ORM)
│   │   ├── Usuario.js
│   │   ├── Programa.js
│   │   └── Matricula.js
│   │
│   ├── utils/                    # Utilidades generales
│   │   ├── dateUtils.js          # Cálculo de días, formato de fechas
│   │   ├── validators.js         # Validadores de datos
│   │   └── constants.js          # Constantes del sistema
│   │
│   ├── tests/                    # Tests del backend
│   │   ├── unit/
│   │   └── integration/
│   │
│   └── uploads/                  # Archivos subidos (excluir de Git)
│       ├── audios/
│       ├── documents/
│       └── avatars/
│
├── client/                       # FRONTEND (React + Vite + TypeScript)
│   ├── package.json              # Dependencias del frontend
│   ├── vite.config.ts            # Configuración de Vite
│   ├── tsconfig.json             # Config TypeScript
│   ├── index.html                # HTML principal
│   │
│   ├── public/                   # Recursos estáticos
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── src/                      # Código fuente
│   │   ├── main.tsx              # Punto de entrada
│   │   ├── App.tsx               # Componente raíz
│   │   │
│   │   ├── types/                # Definiciones TypeScript
│   │   │   ├── index.ts
│   │   │   ├── Usuario.ts
│   │   │   ├── Programa.ts
│   │   │   └── Recurso.ts
│   │   │
│   │   ├── services/             # API Clients
│   │   │   ├── api.ts            # Configuración base de Axios
│   │   │   ├── authService.ts
│   │   │   ├── programasService.ts
│   │   │   ├── recursosService.ts
│   │   │   └── analyticsService.ts  # ⭐ Heartbeat tracking
│   │   │
│   │   ├── hooks/                # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePrograma.ts
│   │   │   ├── useAudioPlayer.ts    # ⭐ Hook con heartbeat
│   │   │   └── useGuiaAutosave.ts   # ⭐ Autosave con debounce
│   │   │
│   │   ├── contexts/             # React Contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ProgramaContext.tsx
│   │   │
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── common/           # Componentes genéricos
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Loader.tsx
│   │   │   │
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   ├── programa/         # Componentes del programa
│   │   │   │   ├── WeekTimeline.tsx        # ⭐ Timeline de 4 semanas
│   │   │   │   ├── RecursoCard.tsx         # Card de recurso con candado
│   │   │   │   ├── AudioPlayer.tsx         # ⭐ Player con tracking
│   │   │   │   └── ProgressRing.tsx        # Indicador circular
│   │   │   │
│   │   │   ├── guias/            # ⭐ Sistema de guías interactivas
│   │   │   │   ├── InteractiveWizard.tsx   # Renderizador dinámico
│   │   │   │   ├── QuestionRenderer.tsx     # Render por tipo
│   │   │   │   └── ProgressStepper.tsx      # Navegación de pasos
│   │   │   │
│   │   │   ├── tests/            # Componentes de tests
│   │   │   │   ├── TestForm.tsx
│   │   │   │   └── ResultsChart.tsx
│   │   │   │
│   │   │   └── analytics/        # Dashboard de profesionales
│   │   │       ├── ProgressChart.tsx
│   │   │       ├── AudioUsageChart.tsx
│   │   │       └── ClientList.tsx
│   │   │
│   │   ├── pages/                # Páginas/Vistas
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ClientDashboard.tsx         # ⭐ Vista del cliente
│   │   │   ├── ProfessionalDashboard.tsx   # ⭐ Vista del profesional
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ProgramView.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── utils/                # Utilidades frontend
│   │   │   ├── dateUtils.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   │
│   │   ├── styles/               # Estilos globales
│   │   │   ├── index.css         # Tailwind imports
│   │   │   └── themes.css        # Variables de tema
│   │   │
│   │   └── assets/               # Assets (imágenes, iconos)
│   │       ├── images/
│   │       └── icons/
│   │
│   └── dist/                     # Build de producción (excluir de Git)
│
├── docs/                         # Documentación técnica
│   ├── API.md                    # Documentación de endpoints
│   ├── ARQUITECTURA.md           # Diagrama de arquitectura
│   ├── DESPLIEGUE.md            # Guía de deployment
│   └── RFAI_V3_GUIDE.md         # Guía del sistema v3
│
└── scripts/                      # Scripts de utilidad
    ├── setup.sh                  # Script de instalación inicial
    ├── dev.sh                    # Levantar entorno desarrollo
    └── backup-db.sh              # Respaldo de base de datos

```

## 🔑 Puntos Clave de la Estructura

### Separación Backend/Frontend
- **Backend** en `server/` - 100% Node.js
- **Frontend** en `client/` - React con Vite
- Cada uno tiene su propio `package.json`

### Componentes Críticos RFAI

#### Backend
1. **`middleware/checkWeekAccess.js`** - Validación de desbloqueo temporal
2. **`services/desbloqueoService.js`** - Lógica de cálculo de acceso
3. **`controllers/guiasController.js`** - Autosave de formularios
4. **`routes/analyticsRoutes.js`** - Endpoint de heartbeat

#### Frontend
1. **`components/programa/WeekTimeline.tsx`** - Timeline visual
2. **`components/guias/InteractiveWizard.tsx`** - Renderizador JSON
3. **`components/programa/AudioPlayer.tsx`** - Player con tracking
4. **`hooks/useAudioPlayer.ts`** - Hook de heartbeat automático

### Convenciones de Nombres
- **Archivos**: camelCase.js/tsx
- **Componentes React**: PascalCase.tsx
- **Servicios**: nombreService.js
- **Rutas**: nombreRoutes.js

### Scripts NPM Recomendados (package.json raíz)
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install"
  }
}
```
