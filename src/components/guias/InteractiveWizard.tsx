import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, CheckCircle, Loader } from 'lucide-react';
import { useGuiaAutosave } from '../../hooks/useGuiaAutosave';
import { QuestionRenderer } from './QuestionRenderer';

interface GuiaStep {
    title: string;
    description?: string;
    questions: Question[];
}

interface Question {
    id: string;
    type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale' | 'date';
    text: string;
    required?: boolean;
    options?: string[];
    minScale?: number;
    maxScale?: number;
    placeholder?: string;
}

interface InteractiveWizardProps {
    progresoId: number;
    estructuraJson: {
        steps: GuiaStep[];
    };
    initialPasoActual?: number;
    initialRespuestas?: Record<string, any>;
    dimension: 'ANGUSTIA' | 'CULPA';
    onComplete?: () => void;
}

/**
 * Componente: Interactive Wizard
 * ⭐ Renderiza formularios dinámicos desde JSON con autosave
 */
export const InteractiveWizard: React.FC<InteractiveWizardProps> = ({
    progresoId,
    estructuraJson,
    initialPasoActual = 0,
    initialRespuestas = {},
    dimension,
    onComplete
}) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [completionError, setCompletionError] = useState<string | null>(null);

    const {
        pasoActual,
        respuestas,
        isSaving,
        lastSaved,
        saveError,
        updateRespuesta,
        nextStep,
        previousStep,
        completarGuia
    } = useGuiaAutosave({
        progresoId,
        initialPasoActual,
        initialRespuestas,
        debounceDelay: 1000,
        onSaveSuccess: () => {
            console.log('✅ Autosave exitoso');
        },
        onSaveError: (error) => {
            console.error('❌ Error en autosave:', error);
        }
    });

    const steps = estructuraJson.steps || [];
    const currentStep = steps[pasoActual];
    const isLastStep = pasoActual === steps.length - 1;
    const isFirstStep = pasoActual === 0;

    // Theme colors
    const theme = dimension === 'ANGUSTIA' ? {
        primary: 'bg-red-500',
        hover: 'hover:bg-red-600',
        light: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600'
    } : {
        primary: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        light: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600'
    };

    // Validar que el paso actual tenga todas las respuestas requeridas
    const validateCurrentStep = () => {
        if (!currentStep) return true;

        const requiredQuestions = currentStep.questions.filter(q => q.required);
        return requiredQuestions.every(q => {
            const answer = respuestas[q.id];
            return answer !== undefined && answer !== null && answer !== '';
        });
    };

    const canProceed = validateCurrentStep();

    const handleNext = () => {
        if (canProceed) {
            nextStep();
        }
    };

    const handleComplete = async () => {
        if (!canProceed) return;

        setIsCompleting(true);
        setCompletionError(null);

        const result = await completarGuia();

        if (result.success) {
            onComplete?.();
        } else {
            setCompletionError(result.error || 'Error al completar la guía');
        }

        setIsCompleting(false);
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

        if (diffSeconds < 10) return 'Guardado hace unos segundos';
        if (diffSeconds < 60) return `Guardado hace ${diffSeconds}s`;
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `Guardado hace ${diffMinutes}min`;

        return lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentStep) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No hay pasos disponibles en esta guía</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Progress Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                        Paso {pasoActual + 1} de {steps.length}
                    </span>
                    <span className={`text-xs ${theme.text} font-semibold`}>
                        {Math.round(((pasoActual + 1) / steps.length) * 100)}% completado
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${theme.primary} transition-all duration-500`}
                        style={{ width: `${((pasoActual + 1) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Step dots */}
                <div className="flex justify-between mt-4">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`
                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold
                transition-all duration-300
                ${index < pasoActual
                                    ? `${theme.primary} text-white scale-100`
                                    : index === pasoActual
                                        ? `${theme.primary} text-white ring-4 ring-offset-2 ${dimension === 'ANGUSTIA' ? 'ring-red-200' : 'ring-blue-200'}`
                                        : 'bg-slate-200 text-slate-400 scale-90'
                                }
              `}
                        >
                            {index < pasoActual ? <CheckCircle size={16} /> : index + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Autosave indicator */}
            <div className="flex items-center justify-between mb-6 text-xs">
                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <>
                            <Loader size={14} className="text-blue-500 animate-spin" />
                            <span className="text-blue-600 font-semibold">Guardando...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <Save size={14} className="text-green-500" />
                            <span className="text-green-600 font-semibold">{formatLastSaved()}</span>
                        </>
                    ) : (
                        <span className="text-slate-400">Sin cambios</span>
                    )}
                </div>

                {saveError && (
                    <span className="text-red-500 font-semibold">⚠ {saveError}</span>
                )}
            </div>

            {/* Step Content */}
            <div className={`${theme.light} ${theme.border} border-2 rounded-3xl p-6 md:p-8 mb-6`}>
                {/* Step header */}
                <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                        {currentStep.title}
                    </h2>
                    {currentStep.description && (
                        <p className="text-slate-600 leading-relaxed">
                            {currentStep.description}
                        </p>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {currentStep.questions.map((question) => (
                        <QuestionRenderer
                            key={question.id}
                            question={question}
                            value={respuestas[question.id]}
                            onChange={(value) => updateRespuesta(question.id, value)}
                            dimension={dimension}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={previousStep}
                    disabled={isFirstStep}
                    className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            transition-all
            ${isFirstStep
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-100 text-slate-700 shadow-md hover:shadow-lg active:scale-95'
                        }
          `}
                >
                    <ChevronLeft size={20} />
                    Anterior
                </button>

                {isLastStep ? (
                    <button
                        onClick={handleComplete}
                        disabled={!canProceed || isCompleting}
                        className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white
              transition-all shadow-lg hover:shadow-xl
              ${!canProceed || isCompleting
                                ? 'bg-slate-300 cursor-not-allowed'
                                : `${theme.primary} ${theme.hover} active:scale-95`
                            }
            `}
                    >
                        {isCompleting ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                Completando...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Completar Guía
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white
              transition-all shadow-lg hover:shadow-xl
              ${!canProceed
                                ? 'bg-slate-300 cursor-not-allowed'
                                : `${theme.primary} ${theme.hover} active:scale-95`
                            }
            `}
                    >
                        Siguiente
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            {/* Completion error */}
            {completionError && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-700 font-semibold text-sm">{completionError}</p>
                </div>
            )}

            {/* Required fields notice */}
            {!canProceed && (
                <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <p className="text-amber-700 font-semibold text-sm">
                        ⚠ Completa todos los campos requeridos (*) para continuar
                    </p>
                </div>
            )}
        </div>
    );
};
