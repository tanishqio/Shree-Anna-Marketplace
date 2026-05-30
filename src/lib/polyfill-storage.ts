/**
 * Polyfill for localStorage in SSR environment
 * Prevents "TypeError: localStorage.getItem is not a function" errors
 */
if (typeof window === 'undefined') {
    // We act on global.localStorage if it's broken or missing
    const globalAny = global as any;

    if (
        typeof globalAny.localStorage === 'undefined' ||
        typeof globalAny.localStorage.getItem !== 'function'
    ) {
        globalAny.localStorage = {
            getItem: (_key: string) => null,
            setItem: (_key: string, _value: string) => { },
            removeItem: (_key: string) => { },
            clear: () => { },
            length: 0,
            key: (_index: number) => null,
        } as Storage;
    }
}
