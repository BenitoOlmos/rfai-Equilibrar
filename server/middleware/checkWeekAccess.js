import { verificarAccesoRecurso } from '../services/desbloqueoService.js';

/**
 * Middleware: Verificar Acceso Semanal
 * Verifica que el usuario tenga acceso al recurso basado en días desde fecha_inicio
 * 
 * IMPORTANTE: Este middleware requiere que la request tenga:
 * - req.user.matriculaId (de authMiddleware)
 * - req.params.recursoId o req.body.recurso_id
 */
export const checkWeekAccess = async (req, res, next) => {
    try {
        // Obtener matrícula del usuario autenticado
        const matriculaId = req.user?.matriculaId || req.body?.matricula_id;

        if (!matriculaId) {
            return res.status(400).json({
                error: 'Matrícula no encontrada',
                mensaje: 'El usuario no tiene una matrícula activa'
            });
        }

        // Obtener ID del recurso
        const recursoId = req.params.recursoId || req.body.recurso_id || req.query.recurso_id;

        if (!recursoId) {
            return res.status(400).json({
                error: 'Recurso no especificado',
                mensaje: 'Debe proporcionar el ID del recurso'
            });
        }

        // Verificar acceso temporal
        const accesoInfo = await verificarAccesoRecurso(matriculaId, recursoId);

        if (!accesoInfo.desbloqueado) {
            return res.status(403).json({
                error: 'Contenido Bloqueado',
                mensaje: `Este contenido se desbloqueará en ${accesoInfo.dias_restantes} día(s)`,
                codigo: 'CONTENT_LOCKED',
                detalles: {
                    recurso: accesoInfo.titulo,
                    semana: accesoInfo.numero_semana,
                    dias_restantes: accesoInfo.dias_restantes,
                    fecha_desbloqueo: accesoInfo.fecha_desbloqueo,
                    dias_transcurridos: accesoInfo.dias_transcurridos,
                    dias_requeridos: accesoInfo.dias_para_desbloqueo
                }
            });
        }

        // Adjuntar información de acceso a la request para uso posterior
        req.accesoInfo = accesoInfo;

        // ✅ Acceso permitido
        next();

    } catch (error) {
        console.error('Error en checkWeekAccess middleware:', error);

        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                error: 'Recurso no encontrado',
                mensaje: error.message
            });
        }

        return res.status(500).json({
            error: 'Error al verificar acceso',
            mensaje: 'Ocurrió un error al validar el acceso al contenido'
        });
    }
};

/**
 * Middleware opcional: Verificar acceso a módulo completo
 */
export const checkModuleAccess = async (req, res, next) => {
    try {
        const matriculaId = req.user?.matriculaId;
        const moduloId = req.params.moduloId || req.body.modulo_id;

        if (!matriculaId || !moduloId) {
            return res.status(400).json({
                error: 'Parámetros faltantes',
                mensaje: 'Se requiere matriculaId y moduloId'
            });
        }

        const { verificarAccesoModulo } = await import('../services/desbloqueoService.js');
        const accesoInfo = await verificarAccesoModulo(matriculaId, moduloId);

        if (!accesoInfo.desbloqueado) {
            return res.status(403).json({
                error: 'Módulo Bloqueado',
                mensaje: `La Semana ${accesoInfo.numero_semana} se desbloqueará en ${accesoInfo.dias_restantes} día(s)`,
                codigo: 'MODULE_LOCKED',
                detalles: {
                    modulo: accesoInfo.titulo,
                    semana: accesoInfo.numero_semana,
                    dias_restantes: accesoInfo.dias_restantes,
                    fecha_desbloqueo: accesoInfo.fecha_desbloqueo
                }
            });
        }

        req.accesoModulo = accesoInfo;
        next();

    } catch (error) {
        console.error('Error en checkModuleAccess middleware:', error);
        return res.status(500).json({
            error: 'Error al verificar acceso al módulo'
        });
    }
};

export default { checkWeekAccess, checkModuleAccess };
