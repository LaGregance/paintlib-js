import { BaseAction, UIActionType } from '../actions/base-action';
import { createStore } from 'zustand/vanilla';

export type UIStore = {
  allActions: {
    [key in UIActionType]?: BaseAction;
  };
  activeAction?: UIActionType;
  setAction: (action: BaseAction) => void;
};

export const createUIStore = () => {
  return createStore<UIStore>((set, get) => {
    const setAction = (action: BaseAction) => {
      set((oldStore) => ({
        activeAction: action.type,
        allActions: { ...oldStore.allActions, [action.type]: action },
      }));
    };

    return {
      allActions: {},
      setAction,
    };
  });
};
