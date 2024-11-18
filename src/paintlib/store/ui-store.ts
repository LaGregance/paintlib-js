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
  return createStore<UIStore>((set) => {
    const setAction = (action: BaseAction) => {
      set((oldStore) => {
        const oldAction = oldStore.allActions[oldStore.activeAction];

        if (oldAction) {
          oldAction.onDeselected();
        }
        action.onSelected();

        return {
          activeAction: action.type,
          allActions: { ...oldStore.allActions, [action.type]: action },
        };
      });
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
