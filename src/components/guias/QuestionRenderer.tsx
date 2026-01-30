import React from 'react';

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

interface QuestionRendererProps {
    question: Question;
    value: any;
    onChange: (value: any) => void;
    dimension: 'ANGUSTIA' | 'CULPA';
}

/**
 * Componente: Question Renderer
 * Renderiza diferentes tipos de preguntas según el tipo especificado en JSON
 */
export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
    question,
    value,
    onChange,
    dimension
}) => {
    const theme = dimension === 'ANGUSTIA' ? {
        accent: 'accent-red-500',
        focus: 'focus:ring-red-500 focus:border-red-500',
        checked: 'checked:bg-red-500'
    } : {
        accent: 'accent-blue-500',
        focus: 'focus:ring-blue-500 focus:border-blue-500',
        checked: 'checked:bg-blue-500'
    };

    const renderInput = () => {
        switch (question.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        className={`
              w-full px-4 py-3 rounded-xl border-2 border-slate-200
              ${theme.focus} outline-none transition-all
              text-slate-800 placeholder:text-slate-400
            `}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                        rows={4}
                        className={`
              w-full px-4 py-3 rounded-xl border-2 border-slate-200
              ${theme.focus} outline-none transition-all resize-none
              text-slate-800 placeholder:text-slate-400
            `}
                    />
                );

            case 'radio':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                            >
                                <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(e.target.value)}
                                    className={`w-5 h-5 ${theme.accent}`}
                                />
                                <span className="text-slate-700 font-medium">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => {
                            const isChecked = Array.isArray(value) && value.includes(option);

                            return (
                                <label
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                                >
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            const currentValue = Array.isArray(value) ? value : [];
                                            if (e.target.checked) {
                                                onChange([...currentValue, option]);
                                            } else {
                                                onChange(currentValue.filter((v: string) => v !== option));
                                            }
                                        }}
                                        className={`w-5 h-5 rounded ${theme.accent}`}
                                    />
                                    <span className="text-slate-700 font-medium">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'scale':
                const min = question.minScale || 1;
                const max = question.maxScale || 10;
                const currentValue = value || min;

                return (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-500">Mínimo ({min})</span>
                            <span className={`text-2xl font-bold ${dimension === 'ANGUSTIA' ? 'text-red-600' : 'text-blue-600'}`}>
                                {currentValue}
                            </span>
                            <span className="text-sm text-slate-500">Máximo ({max})</span>
                        </div>

                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={currentValue}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            className={`w-full h-3 ${theme.accent} rounded-full appearance-none cursor-pointer`}
                        />

                        {/* Scale markers */}
                        <div className="flex justify-between mt-2">
                            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
                                <span key={num} className="text-xs text-slate-400">{num}</span>
                            ))}
                        </div>
                    </div>
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={`
              w-full px-4 py-3 rounded-xl border-2 border-slate-200
              ${theme.focus} outline-none transition-all
              text-slate-800
            `}
                    />
                );

            default:
                return (
                    <p className="text-slate-400 italic">
                        Tipo de pregunta no soportado: {question.type}
                    </p>
                );
        }
    };

    return (
        <div className="space-y-3">
            <label className="block">
                <span className="text-slate-800 font-semibold text-base md:text-lg">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
            </label>
            {renderInput()}
        </div>
    );
};
