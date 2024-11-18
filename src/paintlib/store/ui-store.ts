import { BaseAction, UIActionType } from '../actions/base-action';
import { createStore } from 'zustand/vanilla';
import { PaintLib } from '../paintlib';
import { SelectAction } from '../actions/select-action';

export type UIStore = {
  allActions: {
    [key in UIActionType]?: BaseAction;
  };
  activeAction?: UIActionType;
  setAction: (action: BaseAction) => void;
};

export const createUIStore = (paintlib: PaintLib) => {
  return createStore<UIStore>((set, get) => {
    const setAction = (action: BaseAction) => {
      const oldAction = get().allActions[get().activeAction];
      if (oldAction && oldAction.type === action.type) {
        // Skip setting the action if it's the same
        return;
      }

      set((oldStore) => ({
        activeAction: action.type,
        allActions: { ...oldStore.allActions, [action.type]: action },
      }));

      if (oldAction) {
        oldAction.onDeselected();
      }
      action.onSelected();
    };

    return {
      activeAction: UIActionType.SELECT,
      allActions: {
        [UIActionType.SELECT]: new SelectAction(paintlib),
      },
      setAction,
    };
  });
};
