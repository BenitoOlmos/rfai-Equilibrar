# ============================================================================
# SCRIPT DE MIGRACIÓN Y SEED - EJECUTAR EN ORDEN
# ============================================================================
# 
# Este script aplica las migraciones y seed data de forma segura
# 
# REQUISITOS:
# - XAMPP corriendo con MySQL
# - Base de datos 'reprogramacion_foca' existente
# - Schema V3 ya aplicado
#
# ============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " RFAI - MIGRACIÓN DE TABLAS FALTANTES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$DB_NAME = "reprogramacion_foca"
$MYSQL_PATH = "C:\xampp\mysql\bin\mysql.exe"
$MIGRATION_FILE = "database\migrations\add_missing_tables.sql"
$SEED_FILE = "database\seeds\realistic_data.sql"

# Verificar que MySQL está corriendo
Write-Host "1. Verificando MySQL..." -ForegroundColor Yellow
try {
    $mysqlTest = & $MYSQL_PATH -u root -e "SELECT 1" 2>&1
    Write-Host "   ✓ MySQL está corriendo" -ForegroundColor Green
} catch {
    Write-Host "   ✗ ERROR: MySQL no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor inicia XAMPP y vuelve a ejecutar este script" -ForegroundColor Yellow
    exit 1
}

# Verificar que la base de datos existe
Write-Host ""
Write-Host "2. Verificando base de datos..." -ForegroundColor Yellow
$dbExists = & $MYSQL_PATH -u root -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$DB_NAME'" 2>&1
if ($dbExists -like "*$DB_NAME*") {
    Write-Host "   ✓ Base de datos '$DB_NAME' encontrada" -ForegroundColor Green
} else {
    Write-Host "   ✗ ERROR: Base de datos '$DB_NAME' no existe" -ForegroundColor Red
    Write-Host "   Crea la base de datos primero o ejecuta schema_v3_drip_content.sql" -ForegroundColor Yellow
    exit 1
}

# Crear backup antes de migrar
Write-Host ""
Write-Host "3. Creando backup de seguridad..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "database\backups\backup_before_migration_$timestamp.sql"
New-Item -ItemType Directory -Force -Path "database\backups" | Out-Null

try {
    & "C:\xampp\mysql\bin\mysqldump.exe" -u root $DB_NAME > $backupFile
    Write-Host "   ✓ Backup creado: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ WARNING: No se pudo crear backup" -ForegroundColor Yellow
    Write-Host "   ¿Deseas continuar? (S/N)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-Host "   Migración cancelada" -ForegroundColor Red
        exit 1
    }
}

# Aplicar migraciones
Write-Host ""
Write-Host "4. Aplicando migraciones..." -ForegroundColor Yellow
Write-Host "   Archivo: $MIGRATION_FILE" -ForegroundColor Gray

try {
    Get-Content $MIGRATION_FILE | & $MYSQL_PATH -u root $DB_NAME
    Write-Host "   ✓ Migraciones aplicadas exitosamente" -ForegroundColor Green
    
    # Mostrar tablas creadas
    Write-Host ""
    Write-Host "   Nuevas tablas:" -ForegroundColor Cyan
    $tables = & $MYSQL_PATH -u root $DB_NAME -e "SHOW TABLES LIKE 'citas'; SHOW TABLES LIKE 'notificaciones'; SHOW TABLES LIKE 'feedback_recursos'; SHOW TABLES LIKE 'notas_clinicas'; SHOW TABLES LIKE 'biblioteca_recursos'; SHOW TABLES LIKE 'configuracion_sistema';"
    Write-Host "   $tables" -ForegroundColor Gray
    
} catch {
    Write-Host "   ✗ ERROR al aplicar migraciones" -ForegroundColor Red
    Write-Host "   Revisa el archivo de migración" -ForegroundColor Yellow
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Aplicar seed data
Write-Host ""
Write-Host "5. ¿Deseas cargar datos de prueba realistas? (S/N)" -ForegroundColor Yellow
$loadSeed = Read-Host

if ($loadSeed -eq "S" -or $loadSeed -eq "s") {
    Write-Host "   Cargando datos de prueba..." -ForegroundColor Yellow
    try {
        Get-Content $SEED_FILE | & $MYSQL_PATH -u root $DB_NAME
        Write-Host "   ✓ Datos de prueba cargados exitosamente" -ForegroundColor Green
        
        # Mostrar resumen
        Write-Host ""
        Write-Host "   Resumen de datos insertados:" -ForegroundColor Cyan
        $stats = & $MYSQL_PATH -u root $DB_NAME -e "
            SELECT 'Citas' as Tabla, COUNT(*) as Total FROM citas
            UNION ALL
            SELECT 'Notificaciones', COUNT(*) FROM notificaciones
            UNION ALL
            SELECT 'Feedback', COUNT(*) FROM feedback_recursos
            UNION ALL
            SELECT 'Notas Clínicas', COUNT(*) FROM notas_clinicas
            UNION ALL
            SELECT 'Biblioteca', COUNT(*) FROM biblioteca_recursos
            UNION ALL
            SELECT 'Configuraciones', COUNT(*) FROM configuracion_sistema;
        "
        Write-Host $stats -ForegroundColor Gray
        
    } catch {
        Write-Host "   ⚠ WARNING: Error al cargar datos de prueba" -ForegroundColor Yellow
        Write-Host "   Error: $_" -ForegroundColor Red
        Write-Host "   Las tablas se crearon correctamente, pero sin datos" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Datos de prueba omitidos" -ForegroundColor Gray
}

# Verificación final
Write-Host ""
Write-Host "6. Verificación final..." -ForegroundColor Yellow
$tableCount = & $MYSQL_PATH -u root $DB_NAME -e "SELECT COUNT(*) as total FROM information_schema.tables WHERE table_schema = '$DB_NAME';"
Write-Host "   ✓ Total de tablas en la base de datos: $tableCount" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Reinicia el servidor backend (node server/index.js)" -ForegroundColor Gray
Write-Host "  2. Prueba las nuevas funcionalidades en el frontend" -ForegroundColor Gray
Write-Host "  3. Revisa los logs si encuentras errores" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup guardado en: $backupFile" -ForegroundColor Cyan
Write-Host ""
