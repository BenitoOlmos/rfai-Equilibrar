# 🎯 RFAI v3.0 - Sistema de 4 Semanas con Desbloqueo Temporal

## 📋 Resumen del Sistema

Sistema completo de tratamiento terapéutico con:
- ✅ **Backend** (Node.js + Express + MySQL)
- ✅ **Frontend** (React + TypeScript + Vite)
- ✅ **Desbloqueo temporal** basado en días desde fecha de inicio
- ✅ **Guías interactivas** con autosave automático
- ✅ **Tracking de audios** con heartbeat cada 30 segundos
- ✅ **Analytics** para profesionales

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
- **XAMPP** con MySQL corriendo
- **Node.js** v16+
- **Git**

### 2. Instalación

```bash
# Clonar repositorio
git clone https://github.com/BenitoOlmos/rfai-Equilibrar.git
cd rfai-Equilibrar

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../
npm install
```

### 3. Configurar Base de Datos

**a) Crear base de datos en XAMPP:**
1. Abrir phpMyAdmin (`http://localhost/phpmyadmin`)
2. Crear base de datos: `reprogramacion_foca`
3. Importar schema: `database/schema_v3_drip_content.sql`

**b) Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Dejar vacío en XAMPP
DB_NAME=reprogramacion_foca
PORT=3005
```

### 4. Ejecutar el Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Servidor corriendo en http://localhost:3005
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App corriendo en http://localhost:3000
```

**Verificar que funciona:**
```bash
# Abrir en navegador:
http://localhost:3005/api/health
# Deberías ver: {"status":"OK","db_check":1,...}
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ WeekTimeline │  │ AudioPlayer  │  │   Wizard     │  │
│  │  (Timeline)  │  │ (Heartbeat)  │  │ (Autosave)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼──────┐  │
│  │          API Services (axios)                     │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTP/JSON
┌─────────────────────────▼────────────────────────────────┐
│                   BACKEND (Express)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Middleware: checkWeekAccess (valida desbloqueo) │   │
│  └──────────────────┬───────────────────────────────┘   │
│  ┌─────────────────▼────────────────────────────────┐   │
│  │ Routes: guias │ recursos │ analytics             │   │
│  └─────────────────┬────────────────────────────────┘   │
│  ┌─────────────────▼────────────────────────────────┐   │
│  │ Services: desbloqueoService (DATEDIFF logic)     │   │
│  └─────────────────┬────────────────────────────────┘   │
└────────────────────┼───────────────────────────────────┘
                     │ SQL Queries
┌────────────────────▼───────────────────────────────────┐
│               BASE DE DATOS (MySQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  matriculas  │  │   modulos    │  │   recursos   │ │
│  │              │  │  (días: 0,   │  │  (audios,    │ │
│  │ fecha_inicio │  │   7, 14, 21) │  │   tests)     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │guia_progreso │  │ logs_consumo │  │test_resultados│ │
│  │ (autosave)   │  │ (heartbeat)  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Funcionalidades Clave

### 1. Desbloqueo Temporal Automático

**Cómo funciona:**
- Al matricularse, se guarda `fecha_inicio`
- Cada módulo tiene `dias_para_desbloqueo` (0, 7, 14, 21)
- El sistema calcula: `DATEDIFF(HOY, fecha_inicio) >= dias_para_desbloqueo`

**Ejemplo:**
```
Cliente matriculado: 1 de Enero
├─ Semana 1: Desbloqueada inmediatamente (día 0)
├─ Semana 2: Se desbloquea el 8 de Enero (día 7)
├─ Semana 3: Se desbloquea el 15 de Enero (día 14)
└─ Semana 4: Se desbloquea el 22 de Enero (día 21)
```

**Código Backend:**
```javascript
// middleware/checkWeekAccess.js
const accesoInfo = await verificarAccesoRecurso(matriculaId, recursoId);

if (!accesoInfo.desbloqueado) {
  return res.status(403).json({
    error: 'Contenido Bloqueado',
    dias_restantes: accesoInfo.dias_restantes
  });
}
```

**Código Frontend:**
```tsx
// WeekTimeline.tsx muestra candados/checkmarks
{modulo.desbloqueado ? (
  <CheckCircle className="text-green-500" />
) : (
  <Lock className="text-slate-400" />
)}
```

---

### 2. Autosave de Guías (Debounce)

**Cómo funciona:**
- Usuario escribe en formulario
- Hook `useGuiaAutosave` espera 1 segundo sin cambios
- Envía `PATCH /api/guias/progreso/:id` al backend
- Backend guarda en `guia_progreso.respuestas_json`

**Código:**
```typescript
// hooks/useGuiaAutosave.ts
const updateRespuesta = useCallback((questionId, value) => {
  setRespuestas(prev => {
    const newRespuestas = { ...prev, [questionId]: value };
    debouncedSave(pasoActual, newRespuestas); // ⏱ 1s delay
    return newRespuestas;
  });
}, [pasoActual, debouncedSave]);
```

**Resultado:**
- ✅ No se pierde progreso si el usuario cierra la pestaña
- ✅ Reduce carga del servidor (evita 50 requests por minuto)
- ✅ Usuario ve "Guardado hace Xs" en pantalla

---

### 3. Heartbeat de Audios (Cada 30s)

**Cómo funciona:**
- Usuario reproduce audio
- Cada 30 segundos, hook `useAudioPlayer` envía:
  - `sesion_reproduccion` (UUID único)
  - `marcador_tiempo` (posición en segundos)
  - `segundos_reproducidos` (siempre 30)
- Backend inserta registro en `logs_consumo_media`

**Código:**
```typescript
// hooks/useAudioPlayer.ts
useEffect(() => {
  if (isPlaying) {
    sendHeartbeat(); // Inmediato
    
    const interval = setInterval(() => {
      sendHeartbeat(); // Cada 30s
    }, 30000);
    
    return () => clearInterval(interval);
  }
}, [isPlaying]);
```

**Resultado:**
- ✅ Profesional ve "Cliente escuchó 45 minutos del Audio 1"
- ✅ Dashboard con gráficas de uso
- ✅ Detección de abandono (si deja de reproducir)

---

## 📁 Estructura de Archivos Importantes

```
rfai-Equilibrar/
├── database/
│   └── schema_v3_drip_content.sql      # ⭐ Schema completo
│
├── server/
│   ├── config/
│   │   └── db.js                        # Pool MySQL XAMPP
│   ├── middleware/
│   │   └── checkWeekAccess.js          # ⭐ Validación temporal
│   ├── services/
│   │   └── desbloqueoService.js        # ⭐ Lógica DATEDIFF
│   ├── routes/
│   │   ├── guiasRoutes.js              # ⭐ PATCH autosave
│   │   ├── analyticsRoutes.js          # ⭐ POST heartbeat
│   │   └── recursosRoutes.js           # GET con checkWeekAccess
│   └── index.js                        # Servidor principal
│
├── src/
│   ├── services/
│   │   └── api.ts                      # Cliente axios completo
│   ├── hooks/
│   │   ├── useAudioPlayer.ts           # ⭐ Hook con heartbeat
│   │   └── useGuiaAutosave.ts          # ⭐ Hook con debounce
│   ├── components/
│   │   ├── programa/
│   │   │   ├── WeekTimeline.tsx        # ⭐ Timeline 4 semanas
│   │   │   └── AudioPlayer.tsx         # Player con tracking
│   │   └── guias/
│   │       ├── InteractiveWizard.tsx   # ⭐ Formulario dinámico
│   │       └── QuestionRenderer.tsx    # Inputs por tipo
│   └── utils/
│       └── debounce.ts                 # Utilidad debounce
│
├── .env.example                        # Template de configuración
└── QUICKSTART.md                       # 👈 Este archivo
```

---

## 🧪 Testing del Sistema

### 1. Verificar Desbloqueo Temporal

**SQL para probar:**
```sql
-- Crear usuario de prueba
INSERT INTO usuarios (id, nombre_completo, email, estado) 
VALUES ('test-1', 'Juan Pérez', 'juan@test.com', 'ACTIVO');

-- Matricular en programa (fecha_inicio hace 10 días)
INSERT INTO matriculas (cliente_id, programa_id, fecha_inicio, estado)
VALUES ('test-1', 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'ACTIVO');

-- Verificar qué semanas están desbloqueadas
SELECT 
  numero_semana,
  dias_para_desbloqueo,
  DATEDIFF(CURDATE(), m.fecha_inicio) as dias_transcurridos,
  CASE 
    WHEN DATEDIFF(CURDATE(), m.fecha_inicio) >= ms.dias_para_desbloqueo 
    THEN 'DESBLOQUEADO' 
    ELSE 'BLOQUEADO' 
  END as estado
FROM modulos_semanales ms
JOIN matriculas m ON ms.programa_id = m.programa_id
WHERE m.cliente_id = 'test-1';
```

**Resultado esperado (10 días transcurridos):**
| semana | días_req | días_trans | estado |
|--------|----------|------------|--------|
| 1 | 0 | 10 | ✅ DESBLOQUEADO |
| 2 | 7 | 10 | ✅ DESBLOQUEADO |
| 3 | 14 | 10 | 🔒 BLOQUEADO (faltan 4 días) |
| 4 | 21 | 10 | 🔒 BLOQUEADO (faltan 11 días) |

### 2. Probar Autosave de Guía

**Curl:**
```bash
# Crear progreso inicial
POST http://localhost:3005/api/guias/progreso/1/2
# Devuelve: { progreso: { id: 5, paso_actual: 0, ... } }

# Simular autosave (llamar múltiples veces)
curl -X PATCH http://localhost:3005/api/guias/progreso/5 \
  -H "Content-Type: application/json" \
  -d '{"paso_actual": 1, "respuestas_json": {"q1": "Mi respuesta"}}'

# Verificar en base de datos
SELECT * FROM guia_progreso WHERE id = 5;
```

### 3. Probar Heartbeat de Audio

**JavaScript (consola del navegador):**
```javascript
// Simular 3 heartbeats
const sesion = 'test-session-' + Date.now();

for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    fetch('http://localhost:3005/api/analytics/audio/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matricula_id: 1,
        recurso_id: 2,
        sesion_reproduccion: sesion,
        marcador_tiempo: i * 30,
        completado: i === 2
      })
    }).then(r => r.json()).then(console.log);
  }, i * 1000);
}

// Verificar logs
fetch('http://localhost:3005/api/analytics/audio/2/estadisticas?matriculaId=1')
  .then(r => r.json())
  .then(console.log);
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"
```bash
# Verificar que XAMPP esté corriendo
# Panel de XAMPP → Start MySQL

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=      # Vacío en XAMPP por defecto
```

### Error: "Endpoint no encontrado"
```bash
# Verificar que el servidor esté corriendo
cd server
npm run dev

# Debería mostrar:
# ✅ Servidor corriendo en http://localhost:3005
```

### Error: "403 - Contenido Bloqueado"
```bash
# Es correcto! El sistema está funcionando
# El contenido se desbloqueará según dias_para_desbloqueo

# Para testing, modificar fecha_inicio en la BD:
UPDATE matriculas 
SET fecha_inicio = DATE_SUB(CURDATE(), INTERVAL 20 DAY)
WHERE cliente_id = 'tu-cliente-id';
```

---

## 📚 Próximos Pasos

1. **Agregar autenticación JWT** (actualmente es básica)
2. **Crear panel de administración** para gestionar usuarios
3. **Implementar notificaciones** cuando se desbloqueen semanas
4. **Agregar tests automatizados** (Jest + Testing Library)
5. **Deploy a producción** (ver `DEPLOYMENT.md`)

---

## 💡 Tips de Desarrollo

### Reiniciar Base de Datos
```bash
# En phpMyAdmin
DROP DATABASE reprogramacion_foca;
CREATE DATABASE reprogramacion_foca;
# Importar schema_v3_drip_content.sql nuevamente
```

### Ver logs en tiempo real
```bash
# Backend
cd server
npm run dev

# Frontend (otra terminal)
npm run dev
```

### Modificar intervalos de tiempo (para testing)
```javascript
// En useAudioPlayer.ts (línea 9)
heartbeatInterval = 5000 // 5 segundos en vez de 30000

// En useGuiaAutosave.ts (línea 10)
debounceDelay = 500 // 0.5 segundos en vez de 1000
```

---

## 🎓 Documentación Adicional

- **API Reference**: Ver `RFAI_V2_GUIDE.md`
- **Database Schema**: Ver `database/schema_v3_drip_content.sql`
- **Project Structure**: Ver `ESTRUCTURA_PROYECTO.md`
- **Deployment Guide**: Ver `DEPLOYMENT.md`

---

¿Preguntas? Abre un issue en GitHub: https://github.com/BenitoOlmos/rfai-Equilibrar/issues
