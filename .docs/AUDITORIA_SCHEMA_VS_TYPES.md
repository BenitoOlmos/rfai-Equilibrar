# 📊 AUDITORÍA: TYPES.TS vs ESQUEMA DE BASE DE DATOS

## 🔍 ANÁLISIS COMPARATIVO

### ✅ TABLAS EXISTENTES (Alineadas con types.ts)

| Type Interface | Tabla DB | Estado | Notas |
|----------------|----------|--------|-------|
| `User` | `usuarios` | ✅ Completo | Mapeo correcto |
| `ClientProfile` | `usuarios` + `matriculas` | ✅ Completo | Requiere JOIN |
| `WeekProgress` | Calculado dinámicamente | ✅ Funcional | Desde `modulos_semanales` + logs |
| `TestResult` | `test_resultados` | ✅ Completo | Scores mapeados |
| `AudioUsageStat` | `logs_consumo_media` | ✅ Completo | Heartbeat system |
| `GuideStep` | `guia_estructuras` | ✅ Completo | JSON-driven |

---

## ❌ GAPS IDENTIFICADOS - TABLAS FALTANTES

### 1. **CITAS/SESIONES** (Crítico)
**Type:** `Cita`  
**Problema:** No existe tabla para programar sesiones con el profesional

```typescript
export interface Cita {
  id: number;
  cicloId: number;
  numeroSesion: '1' | '2';
  fechaProgramada: Date;
  fechaRealizada?: Date;
  estado: 'PROGRAMADA' | 'REALIZADO' | 'CANCELADA';
  notasSesion?: string;
}
```

**Uso:** 
- Profesional programa sesiones presenciales/virtuales
- Cliente ve próximas citas
- Se registra asistencia y notas post-sesión

---

### 2. **NOTIFICACIONES** (Importante)
**Problema:** No hay sistema de notificaciones

**Uso:**
- "Semana 2 desbloqueada"
- "Recordatorio: Sesión mañana a las 10:00"
- "Nuevo audio disponible"

---

### 3. **FEEDBACK/VALORACIONES** (Media)
**Problema:** No se captura satisfacción del cliente

**Uso:**
- Rating de audios (¿Te fue útil? 1-5 estrellas)
- Comentarios sobre sesiones
- NPS del programa

---

### 4. **NOTAS PROFESIONALES ESTRUCTURADAS** (Media)
**Problema:** `matriculas.notas_profesional` es TEXT plano

**Uso:**
- Evolución clínica estructurada
- Observaciones por sesión
- Plan de tratamiento

---

### 5. **RECURSOS COMPARTIDOS/BIBLIOTECA** (Baja)
**Problema:** No hay repositorio de recursos educativos extras

**Uso:**
- PDFs informativos
- Videos complementarios
- Artículos científicos

---

### 6. **CONFIGURACIÓN DEL SISTEMA** (Baja)
**Problema:** Configuraciones hardcodeadas

**Uso:**
- Tiempo de heartbeat (30s configurable)
- Plantillas de email
- Textos de ayuda

---

## 🎯 PRIORIZACIÓN

### **NIVEL 1 - CRÍTICO** (Implementar YA)
1. ✅ Tabla `citas`
2. ✅ Tabla `notificaciones`

### **NIVEL 2 - IMPORTANTE** (Próxima iteración)
3. Tabla `feedback_recursos`
4. Tabla `notas_clinicas`

### **NIVEL 3 - MEJORA** (Futuro)
5. Tabla `biblioteca_recursos`
6. Tabla `configuracion_sistema`

---

## 📋 ADICIONALES DETECTADOS

### **Datos Faltantes en Tablas Existentes:**

1. **`recursos`** - Falta campo `semana`:
   - Necesario para filtrar por semana actual
   - Solución: Agregar columna `semana INT`

2. **`guia_progreso`** - Falta `pasos_totales`:
   - Para calcular porcentaje
   - Solución: Agregar columna virtual o calcularlo en runtime

3. **`test_resultados`** - Falta `semana`:
   - Para agrupar tests por periodo
   - Solución: Agregar columna `semana INT`

4. **`logs_consumo_media`** - Falta campo `fecha_reproduccion`:
   - Para filtrar por día
   - Solución: Renombrar `timestamp_heartbeat` a más claro

---

## 🔧 SCRIPT DE CORRECCIONES

Ver archivo: `database/migrations/add_missing_tables.sql`
