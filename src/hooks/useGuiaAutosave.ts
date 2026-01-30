import { useState, useEffect, useRef, useCallback } from 'react';
import { guiasService } from '../services/api';
import { debounce } from '../utils/debounce';

interface UseGuiaAutosaveProps {
    progresoId: number;
    initialPasoActual?: number;
    initialRespuestas?: Record<string, any>;
    debounceDelay?: number; // milisegundos (default: 1000)
    onSaveSuccess?: () => void;
    onSaveError?: (error: any) => void;
}

/**
 * Hook personalizado para autosave de guías interactivas
 * ⭐ Guarda automáticamente con debounce para evitar múltiples requests
 */
export const useGuiaAutosave = ({
    progresoId,
    initialPasoActual = 0,
    initialRespuestas = {},
    debounceDelay = 1000,
    onSaveSuccess,
    onSaveError
}: UseGuiaAutosaveProps) => {
    const [pasoActual, setPasoActual] = useState(initialPasoActual);
    const [respuestas, setRespuestas] = useState<Record<string, any>>(initialRespuestas);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Función de guardado real
    const saveProgress = async (paso: number, resp: Record<string, any>) => {
        setIsSaving(true);
        setSaveError(null);

        try {
            await guiasService.guardarProgreso(progresoId, paso, resp);
            setLastSaved(new Date());
            onSaveSuccess?.();
        } catch (error: any) {
            const errorMsg = error.response?.data?.mensaje || 'Error al guardar progreso';
            setSaveError(errorMsg);
            onSaveError?.(error);
            console.error('Error en autosave:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // ⭐ Debounced save - evita saturar el servidor
    const debouncedSave = useRef(
        debounce((paso: number, resp: Record<string, any>) => {
            saveProgress(paso, resp);
        }, debounceDelay)
    ).current;

    // Actualizar respuesta de una pregunta específica
    const updateRespuesta = useCallback((questionId: string, value: any) => {
        setRespuestas(prev => {
            const newRespuestas = {
                ...prev,
                [questionId]: value
            };

            // Trigger autosave
            debouncedSave(pasoActual, newRespuestas);

            return newRespuestas;
        });
    }, [pasoActual, debouncedSave]);

    // Actualizar múltiples respuestas a la vez
    const updateMultipleRespuestas = useCallback((updates: Record<string, any>) => {
        setRespuestas(prev => {
            const newRespuestas = {
                ...prev,
                ...updates
            };

            // Trigger autosave
            debouncedSave(pasoActual, newRespuestas);

            return newRespuestas;
        });
    }, [pasoActual, debouncedSave]);

    // Avanzar al siguiente paso
    const nextStep = useCallback(() => {
        const newPaso = pasoActual + 1;
        setPasoActual(newPaso);

        // Guardar inmediatamente cuando cambia de paso
        saveProgress(newPaso, respuestas);
    }, [pasoActual, respuestas]);

    // Retroceder al paso anterior
    const previousStep = useCallback(() => {
        const newPaso = Math.max(0, pasoActual - 1);
        setPasoActual(newPaso);

        // Guardar inmediatamente cuando cambia de paso
        saveProgress(newPaso, respuestas);
    }, [pasoActual, respuestas]);

    // Ir a un paso específico
    const goToStep = useCallback((step: number) => {
        setPasoActual(step);
        saveProgress(step, respuestas);
    }, [respuestas]);

    // Completar guía (sin debounce)
    const completarGuia = async () => {
        setIsSaving(true);
        setSaveError(null);

        try {
            await guiasService.completarGuia(progresoId, respuestas);
            setLastSaved(new Date());
            return { success: true };
        } catch (error: any) {
            const errorMsg = error.response?.data?.mensaje || 'Error al completar la guía';
            setSaveError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsSaving(false);
        }
    };

    // Guardar manualmente (sin debounce)
    const saveNow = async () => {
        await saveProgress(pasoActual, respuestas);
    };

    return {
        pasoActual,
        respuestas,
        isSaving,
        lastSaved,
        saveError,
        updateRespuesta,
        updateMultipleRespuestas,
        nextStep,
        previousStep,
        goToStep,
        completarGuia,
        saveNow
    };
};
