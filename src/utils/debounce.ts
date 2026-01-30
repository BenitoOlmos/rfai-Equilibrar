/**
 * Utilidad: Debounce
 * Retrasa la ejecución de una función hasta que haya pasado un tiempo sin ser llamada
 * Útil para: autosave, búsqueda en tiempo real, resize events, etc.
 */

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return function debounced(...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

/**
 * Versión con cancelación
 */
export function debounceCancelable<T extends (...args: any[]) => any>(
    func: T,
    delay: number
) {
    let timeoutId: NodeJS.Timeout | null = null;

    const debounced = function (...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}
