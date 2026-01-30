# 🚀 INSTALACIÓN Y PRUEBA DEL SISTEMA RFAI v3.0

## 📋 Checklist de Instalación

### ✅ Paso 1: Preparar XAMPP

1. **Abrir XAMPP Control Panel**
2. **Iniciar MySQL**:
   - Click en "Start" junto a MySQL
   - Verificar que diga "Running" en verde

3. **Abrir phpMyAdmin**:
   - Click en "Admin" junto a MySQL
   - O ir a: `http://localhost/phpmyadmin`

---

### ✅ Paso 2: Crear Base de Datos

**En phpMyAdmin:**

1. Click en "Nueva" (sidebar izquierdo)
2. Nombre: `reprogramacion_foca`
3. Cotejamiento: `utf8mb4_unicode_ci`
4. Click "Crear"

---

### ✅ Paso 3: Importar Schema

1. Seleccionar la base de datos `reprogramacion_foca`
2. Click en pestaña "Importar"
3. Click "Seleccionar archivo"
4. Navegar a: `rfai-Equilibrar/database/schema_v3_drip_content.sql`
5. Click "Continuar" (abajo)
6. ✅ Debería mostrar: "Importación finalizada correctamente"

---

### ✅ Paso 4: Importar Datos de Prueba

1. En phpMyAdmin, pestaña "SQL"
2. Click "Seleccionar archivo"
3. Navegar a: `rfai-Equilibrar/database/seeds/demo_users.sql`
4. Click "Continuar"
5. ✅ Verificar resultado final:

**Deberías ver:**
```
=== USUARIOS CREADOS ===
- Ana Martínez (Nuevo)
- Bruno Silva (Avanzado)
- Carla Rojas (Finalizado)
- Dr. David López (Profesional)

=== MÓDULOS DESBLOQUEADOS POR USUARIO ===
Ana: ✅ Semana 1, 🔒 Semana 2, 3, 4
Bruno: ✅ Semana 1, 2, 3, 🔒 Semana 4
Carla: ✅ Semana 1, 2, 3, 4 (Todas)
```

---

### ✅ Paso 5: Configurar Backend

**Terminal 1:**

```bash
cd rfai-Equilibrar/server

# Si no existe .env, copiar plantilla
copy .env.example .env

# Editar .env (abrir con VSCode/Notepad++)
# Verificar que tenga:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=reprogramacion_foca
PORT=3005
NODE_ENV=development
```

---

### ✅ Paso 6: Instalar Dependencias Backend

```bash
# Desde rfai-Equilibrar/server
npm install
```

**Paquetes que se instalarán:**
- express
- mysql2
- cors
- dotenv
- uuid

---

### ✅ Paso 7: Ejecutar Backend

```bash
# Desde rfai-Equilibrar/server
npm run dev
```

**Deberías ver:**
```
╔════════════════════════════════════════════════════════════╗
║  RFAI Backend Server - v3.0                                ║
║  Puerto: 3005                                              ║
║  Entorno: development                                      ║
║  Base de datos: reprogramacion_foca                        ║
╚════════════════════════════════════════════════════════════╝

✅ Servidor corriendo en http://localhost:3005
📊 Health check: http://localhost:3005/api/health
⚠️  DEV ROUTES ACTIVADAS - No usar en producción

🔥 Endpoints disponibles:
   - POST /api/dev/login
   - GET  /api/guias/:guiaId
   ...
```

---

### ✅ Paso 8: Verificar Backend

**Abrir navegador:**

1. **Health Check:**
   ```
   http://localhost:3005/api/health
   ```
   ✅ Debería mostrar:
   ```json
   {
     "status": "OK",
     "db_check": 1,
     "stats": {
       "usuarios": 4,
       "programas": 2
     }
   }
   ```

2. **Login de Prueba (Usuario Nuevo):**
   
   **En Postman/Thunder Client/curl:**
   ```bash
   POST http://localhost:3005/api/dev/login
   Content-Type: application/json

   {
     "email": "ana.martinez@test.com"
   }
   ```

   ✅ Debería devolver:
   ```json
   {
     "success": true,
     "dev_mode": true,
     "user": {
       "id": "user-a-nuevo",
       "nombre": "Ana Martínez",
       "email": "ana.martinez@test.com",
       "rol": "CLIENTE"
     },
     "matricula": {
       "id": 1,
       "programa": "Programa RFAI - Angustia",
       "dimension": "ANGUSTIA",
       "diasTranscurridos": 0,
       "estado": "ACTIVO"
     },
     "modulosDesbloqueados": [
       {"numero_semana": 1, "desbloqueado": true},
       {"numero_semana": 2, "desbloqueado": false, "dias_restantes": 7},
       ...
     ],
     "semanasDisponibles": 1
   }
   ```

---

### ✅ Paso 9: Configurar Frontend

**Terminal 2 (nueva ventana):**

```bash
cd rfai-Equilibrar

# Instalar dependencias (si no está instalado)
npm install

# Verificar que .env.example tenga:
VITE_API_URL=http://localhost:3005/api
```

---

### ✅ Paso 10: Ejecutar Frontend

```bash
# Desde rfai-Equilibrar/
npm run dev
```

**Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### ✅ Paso 11: Probar en Navegador

1. **Abrir:** `http://localhost:5173`

2. **En la página de login, hacer login con alguno de estos usuarios:**
   - `ana.martinez@test.com` (Nuevo - Solo Semana 1)
   - `bruno.silva@test.com` (Avanzado - Hasta Semana 3)
   - `carla.rojas@test.com` (Finalizado - Todas las semanas)
   - `david.lopez@clinica.com` (Profesional - Dashboard especial)

3. **Verificar que se vea:**
   - ✅ Timeline de 4 semanas
   - ✅ Candados en semanas bloqueadas
   - ✅ Checkmarks en semanas desbloqueadas
   - ✅ "X días restantes" en semanas futuras

---

## 🧪 Tests de Validación

### Test 1: Usuario Nuevo (Ana)
**Email:** `ana.martinez@test.com`

**Verificar:**
- ✅ Solo ve Semana 1 desbloqueada
- ✅ Puede acceder a Test Inicial
- ✅ Puede acceder a Audio 1
- ❌ NO puede acceder a Audio 2 (bloqueado 403)
- ✅ Semana 2 muestra "Se desbloqueará en 7 días"

### Test 2: Usuario Avanzado (Bruno)
**Email:** `bruno.silva@test.com`

**Verificar:**
- ✅ Ve Semanas 1, 2 y 3 desbloqueadas
- ✅ Tiene progreso guardado en Guía
- ✅ Tiene minutos de audio escuchados
- ❌ Semana 4 sigue bloqueada
- ✅ Dashboard muestra: "60% completado"

### Test 3: Usuario Finalizado (Carla)
**Email:** `carla.rojas@test.com`

**Verificar:**
- ✅ Todas las 4 semanas desbloqueadas
- ✅ Puede acceder al Meet Final
- ✅ Tiene todos los tests completados
- ✅ Dashboard muestra: "100% completado"
- ✅ Estado: "COMPLETADO"

### Test 4: Heartbeat de Audio
1. Login como Bruno
2. Reproducir Audio 1
3. Esperar 30 segundos
4. **Verificar en phpMyAdmin:**
   ```sql
   SELECT * FROM logs_consumo_media 
   WHERE matricula_id = 2 
   ORDER BY timestamp_heartbeat DESC 
   LIMIT 5;
   ```
   ✅ Debe haber nuevo registro con `marcador_tiempo` actualizado

### Test 5: Autosave de Guía
1. Login como Ana
2. Ir a Guía Semana 1
3. Escribir en un campo de texto
4. Esperar 1 segundo
5. **Ver en consola del navegador:** "Guardado hace X segundos"
6. **Verificar en phpMyAdmin:**
   ```sql
   SELECT respuestas_json FROM guia_progreso 
   WHERE matricula_id = 1;
   ```
   ✅ El JSON debe tener tu respuesta

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to MySQL"
**Solución:**
```bash
# Verificar que MySQL esté corriendo en XAMPP
# Si no:
1. XAMPP → Stop MySQL
2. XAMPP → Start MySQL
3. Reiniciar backend: npm run dev
```

### Problema: "Table 'reprogramacion_foca.usuarios' doesn't exist"
**Solución:**
```bash
# Reimportar schema
1. phpMyAdmin → reprogramacion_foca
2. Drop all tables
3. Importar schema_v3_drip_content.sql
4. Importar demo_users.sql
```

### Problema: "CORS error" en navegador
**Solución:**
```bash
# Verificar en server/index.js:
origin: process.env.CORS_ORIGIN || 'http://localhost:5173'

# Si tu Vite está en otro puerto (ej: 3000):
# Cambiar en .env:
CORS_ORIGIN=http://localhost:3000
```

### Problema: "404 - Endpoint no encontrado"
**Solución:**
```bash
# Verificar que el backend esté corriendo
# Terminal del backend debe mostrar logs de requests
# Si no:
cd server
npm run dev
```

### Problema: Login devuelve "Usuario no encontrado"
**Solución:**
```bash
# Verificar que demo_users.sql se importó correctamente
# En phpMyAdmin:
SELECT email FROM usuarios;

# Deberías ver:
# ana.martinez@test.com
# bruno.silva@test.com
# carla.rojas@test.com
# david.lopez@clinica.com
```

---

## 📊 Estadísticas Esperadas

Después de la instalación completa, deberías tener:

**En Base de Datos:**
- ✅ 4 Usuarios
- ✅ 2 Programas (Angustia, Culpa)
- ✅ 8 Módulos Semanales (4 por programa)
- ✅ 9 Recursos (Audios, Tests, Meets, Docs)
- ✅ 3 Matrículas activas
- ✅ 1 Guía Interactiva con estructura JSON
- ✅ Datos de progreso para Usuario B y C

**En Backend:**
- ✅ Servidor corriendo en puerto 3005
- ✅ Pool MySQL activo (10 conexiones)
- ✅ Dev routes habilitadas
- ✅ Middleware de validación temporal funcionando

**En Frontend:**
- ✅ Aplicación corriendo en puerto 5173
- ✅ Conexión a API backend establecida
- ✅ Componentes WeekTimeline, AudioPlayer, Wizard renderizando

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Personalizar Contenido:**
   - Editar textos en `demo_users.sql`
   - Agregar URLs reales de audios/documentos
   - Crear estructura JSON real para las guías

2. **Agregar Más Usuarios:**
   - Usar INSERT INTO para crear nuevos usuarios
   - Matricular en diferentes programas
   - Probar diferentes fechas de inicio

3. **Testing Completo:**
   - Probar heartbeat por 2-3 minutos
   - Completar una guía entera
   - Realizar un test y verificar scores

4. **Preparar para Producción:**
   - Remover dev routes
   - Implementar autenticación JWT real
   - Configurar variables de entorno para Cloud

---

¿Todo funcionando? **¡Felicidades!** 🎉

Tienes un sistema RFAI completo con:
- ✅ Desbloqueo temporal automatizado
- ✅ Autosave en guías
- ✅ Tracking de audios con heartbeat
- ✅ Dashboard de profesionales
- ✅ 4 usuarios de prueba con diferentes estados

---

## 📞 Soporte

Si encuentras problemas:
1. Verificar logs del backend (Terminal 1)
2. Verificar console del navegador (F12)
3. Revisar esta guía línea por línea
4. Consultar `QUICKSTART.md` para detalles técnicos
