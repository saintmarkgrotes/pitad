import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Nothing external ever changes, so there is nothing to subscribe to.
const subscribe = () => () => {};

/**
 * To support static rendering, the real color scheme is only used after the
 * client has hydrated. Before that (server render and hydration) we return 'light'.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true, // client value, used after hydration
    () => false, // server value, used while rendering on the server and hydrating
  );

  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
