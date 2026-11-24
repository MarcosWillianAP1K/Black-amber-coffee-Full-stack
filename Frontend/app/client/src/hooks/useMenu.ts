import { useMenuStore, type ClientMenuStoreState } from "../stores/useMenuStore";

export type { ClientMenuStoreState };

export function useMenu(): ClientMenuStoreState {
    return useMenuStore();
}
