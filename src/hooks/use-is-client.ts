import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` no servidor e durante a hidratação, `true` depois no cliente.
 * Substitui o padrão `useEffect(() => setMounted(true), [])` sem setState em effect.
 */
export function useIsClient() {
    return useSyncExternalStore(subscribe, () => true, () => false);
}
