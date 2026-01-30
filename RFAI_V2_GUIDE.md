# RFAI v2.0 - Sistema de Ciclos de 2 Sesiones

## 🎯 Resumen del Sistema

El sistema RFAI v2.0 implementa un modelo de tratamiento basado en **ciclos de 2 sesiones** con **desbloqueo progresivo de materiales**, reemplazando el modelo anterior de 4 semanas.

## 📊 Flujo del Ciclo de Tratamiento

```
┌─────────────────────────────────────────────────────────────┐
│  1. Se crea CICLO (Angustia o Culpa)                        │
│     ↓ Desbloquea automáticamente: Test Inicial              │
├─────────────────────────────────────────────────────────────┤
│  2. Cliente realiza Test Inicial                             │
│     ↓ Se programa Sesión 1                                  │
├─────────────────────────────────────────────────────────────┤
│  3. Se completa SESIÓN 1                                     │
│     ↓ Desbloquea: Audio de Reprogramación + Test Intermedio │
├─────────────────────────────────────────────────────────────┤
│  4. Cliente trabaja con materiales desbloqueados             │
│     ↓ Se programa Sesión 2                                  │
├─────────────────────────────────────────────────────────────┤
│  5. Se completa SESIÓN 2                                     │
│     ↓ Desbloquea: Guía de Mantenimiento                     │
│     ↓ Cierra el ciclo (estado: COMPLETADO)                  │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Nuevas Tablas de Base de Datos

### `ciclos_tratamiento`
Agrupa las sesiones y materiales de un tratamiento específico.

```sql
- id (PK)
- client_id (FK → users)
- dimension (ANGUSTIA | CULPA)
- fecha_inicio
- fecha_cierre
- estado (ACTIVO | COMPLETADO | CANCELADO)
```

### `citas`
Registra las sesiones programadas y realizadas.

```sql
- id (PK)
- ciclo_id (FK → ciclos_tratamiento)
- numero_sesion ('1' | '2')
- fecha_programada
- fecha_realizada
- estado (PROGRAMADA | REALIZADO | CANCELADA)
- notas_sesion
```

**Restricción:** No se puede crear Sesión 2 sin que la Sesión 1 exista.

### `materiales`
Catálogo de recursos terapéuticos.

```sql
- id (PK)
- tipo (TEST_INICIAL | AUDIO | TEST_INTERMEDIO | GUIA_MANTENIMIENTO)
- dimension (ANGUSTIA | CULPA | AMBOS)
- titulo
- descripcion
- url_recurso
- prerequisito (NINGUNO | SESION_1 | SESION_2)
```

### `acceso_materiales`
Control de acceso a materiales por ciclo.

```sql
- id (PK)
- ciclo_id (FK → ciclos_tratamiento)
- material_id (FK → materiales)
- desbloqueado_en (timestamp cuando se desbloqueó)
- completado_en (timestamp cuando se completó)
- progreso_porcentaje (0-100)
```

## 🚀 Endpoints de API

### Ciclos

#### `POST /api/ciclos/nuevo`
Crear un nuevo ciclo de tratamiento.

**Request:**
```json
{
  "client_id": "client-123",
  "dimension": "ANGUSTIA",
  "profesional_id": "prof-456" // opcional
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Ciclo creado exitosamente",
  "ciclo": {
    "cicloId": 1,
    "dimension": "ANGUSTIA",
    "fechaInicio": "2024-01-29",
    "testInicialDesbloqueado": true
  }
}
```

#### `GET /api/ciclos/:clientId/actual`
Obtener el ciclo activo del cliente con todos los materiales y estado.

**Response:**
```json
{
  "success": true,
  "ciclo": {
    "id": 1,
    "clientId": "client-123",
    "dimension": "ANGUSTIA",
    "estado": "ACTIVO",
    "sesionesCompletadas": 1,
    "citas": [
      {
        "id": 1,
        "numeroSesion": "1",
        "estado": "REALIZADO",
        "fechaRealizada": "2024-01-15T14:00:00Z"
      },
      {
        "id": 2,
        "numeroSesion": "2",
        "estado": "PROGRAMADA",
        "fechaProgramada": "2024-01-29T14:00:00Z"
      }
    ],
    "materiales": [
      {
        "id": 1,
        "tipo": "TEST_INICIAL",
        "titulo": "Test Inicial RFAI - Angustia",
        "desbloqueado": true,
        "completadoEn": "2024-01-10T10:00:00Z"
      },
      {
        "id": 2,
        "tipo": "AUDIO",
        "titulo": "Audio de Reprogramación - Angustia",
        "desbloqueado": true,
        "desbloqueadoEn": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

### Citas

#### `POST /api/citas/programar`
Programar una nueva sesión.

**Request:**
```json
{
  "ciclo_id": 1,
  "numero_sesion": "1",
  "fecha_programada": "2024-02-01T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Cita programada exitosamente",
  "cita": {
    "citaId": 3,
    "numeroSesion": "1",
    "fechaProgramada": "2024-02-01T14:00:00Z"
  }
}
```

#### `PUT /api/citas/:id/completar`
Completar una sesión (desbloquea materiales automáticamente).

**Request:**
```json
{
  "notas_sesion": "Cliente mostró progreso significativo..."
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Sesión 1 completada exitosamente",
  "sesionCompletada": "1",
  "materialesDesbloqueados": [
    {
      "id": 2,
      "tipo": "AUDIO",
      "titulo": "Audio de Reprogramación - Angustia"
    },
    {
      "id": 3,
      "tipo": "TEST_INTERMEDIO",
      "titulo": "Test Intermedio RFAI - Angustia"
    }
  ],
  "cicloCompleto": false
}
```

## 🎨 Componente Frontend: RFAIProgressTracker

### Uso Básico

```tsx
import { RFAIProgressTracker } from './components/RFAIProgressTracker';
import { useEffect, useState } from 'react';
import { api } from './services/api';

function ClientDashboard({ clientId }) {
  const [ciclo, setCiclo] = useState(null);

  useEffect(() => {
    async function fetchCiclo() {
      const response = await api.obtenerCicloActivo(clientId);
      if (response?.ciclo) {
        setCiclo(response.ciclo);
      }
    }
    fetchCiclo();
  }, [clientId]);

  const handleMaterialClick = (material) => {
    console.log('Material clicked:', material);
    // Abrir modal o redirigir a material
  };

  return (
    <div>
      {ciclo ? (
        <RFAIProgressTracker 
          ciclo={ciclo} 
          onMaterialClick={handleMaterialClick}
        />
      ) : (
        <p>No hay ciclo activo</p>
      )}
    </div>
  );
}
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `ciclo` | `CicloTratamiento` | Objeto del ciclo activo con materiales y citas |
| `onMaterialClick` | `(material: MaterialConAcceso) => void` | Callback cuando se hace clic en un material |

### Características

- ✅ **Barra de progreso visual** (0% → 50% → 100%)
- ✅ **Timeline de sesiones** con checkmarks
- ✅ **Color theming** automático según dimensión
  - Rojo para Angustia
  - Azul para Culpa
- ✅ **Materiales bloqueados/desbloqueados** con iconos
- ✅ **Responsive** (mobile-first)
- ✅ **Animaciones suaves** con Tailwind transitions

## 🔒 Reglas de Negocio

### 1. Creación de Ciclo
- Un cliente puede tener **solo 1 ciclo activo por dimensión** a la vez
- Al crear un ciclo, el **Test Inicial se desbloquea automáticamente**

### 2. Programación de Sesiones
- ❌ **No se puede programar Sesión 2** sin que exista una Sesión 1 (base de datos lo impide)
- ✅ Sólo puede haber **1 sesión por número** en el mismo ciclo

### 3. Desbloqueo de Materiales

**Al completar Sesión 1:**
- Desbloquea: Audio de Reprogramación
- Desbloquea: Test Intermedio

**Al completar Sesión 2:**
- Desbloquea: Guía de Mantenimiento
- Cierra el ciclo (estado = 'COMPLETADO')

### 4. Estado de Materiales
- `desbloqueado = false` → Muestra candado 🔒
- `desbloqueado = true` → Permite acceso
- `completadoEn != null` → Muestra checkmark ✓

## 📝 Migración desde v1.0

### Importar el nuevo schema

```bash
# En XAMPP/MySQL o Cloud SQL
mysql -u root -p reprogramacion_foca < database/schema_v2_cycles.sql
```

Esto creará las nuevas tablas **sin eliminar las antiguas** (`client_profiles`, `client_week_progress`).

### Crear ciclos desde datos existentes (opcional)

```sql
-- Ejemplo: Crear ciclo para cliente que estaba en Semana 3
INSERT INTO ciclos_tratamiento (client_id, dimension, fecha_inicio, estado)
SELECT user_id, program, start_date, 'ACTIVO'
FROM client_profiles
WHERE current_week IN (3, 4);

-- Marcar Sesión 1 como realizada para estos clientes
-- (adaptar según lógica de negocio)
```

## 🧪 Testing

### Flujo Completo de Prueba

1. **Crear ciclo nuevo:**
```bash
curl -X POST http://localhost:3005/api/ciclos/nuevo \
  -H "Content-Type: application/json" \
  -d '{"client_id":"client-1","dimension":"ANGUSTIA"}'
```

2. **Verificar que Test Inicial está desbloqueado:**
```bash
curl http://localhost:3005/api/ciclos/client-1/actual
```

3. **Programar Sesión 1:**
```bash
curl -X POST http://localhost:3005/api/citas/programar \
  -H "Content-Type: application/json" \
  -d '{"ciclo_id":1,"numero_sesion":"1","fecha_programada":"2024-02-01T14:00:00Z"}'
```

4. **Completar Sesión 1:**
```bash
curl -X PUT http://localhost:3005/api/citas/1/completar \
  -H "Content-Type: application/json" \
  -d '{"notas_sesion":"Primera sesión exitosa"}'
```

5. **Verificar que Audio y Test Intermedio se desbloquearon:**
```bash
curl http://localhost:3005/api/ciclos/client-1/actual
```

## 🎯 Próximos Pasos

- [ ] Integrar con autenticación real (JWT)
- [ ] Agregar notificaciones cuando se desbloqueen materiales
- [ ] Crear panel de administración para gestionar materiales
- [ ] Implementar recordatorios para sesiones programadas
- [ ] Analytics: tiempo promedio en completar ciclo

## 📞 Soporte

Si encuentras bugs o tienes preguntas, revisa:
- `server/services/cicloService.js` - Lógica de negocio
- `components/RFAIProgressTracker.tsx` - Componente UI
- `database/schema_v2_cycles.sql` - Schema completo
