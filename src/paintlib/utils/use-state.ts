import { StoreApi } from 'zustand/vanilla';

/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */

/**
 * This function take a zustand store as parameter and execute the effect function each time the result of the selector change.
 * It always executes the effect once when called.
 *
 * @param store
 * @param selector
 * @param effect
 */
export const useState = <T extends any, U extends any>(
  store: StoreApi<T>,
  selector: (store: T) => U,
  effect: (state: U) => void,
) => {
  const activeState = selector(store.getState());
  effect(activeState);

  return store.subscribe((storeState, prevStoreState) => {
    const newState = selector(storeState);
    const oldState = selector(prevStoreState);

    if (newState !== oldState) {
      effect(newState);
    }
  });
};
