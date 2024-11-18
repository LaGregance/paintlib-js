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
  options: {
    fgColor: string;
    bgColor: string;
    tickness: number;
  };
};

export const createUIStore = (paintlib: PaintLib) => {
  return createStore<UIStore>((set, get) => {
    const setAction = (action: BaseAction) => {
      if (action.behavior === 'clickable') {
        action.onClick();
        return;
      } else {
        const oldAction = get().allActions[get().activeAction];
        if (oldAction) {
          oldAction.onDeselected();
        }

        set((oldStore) => ({
          activeAction: action.type,
          allActions: { ...oldStore.allActions, [action.type]: action },
        }));

        action.onSelected();
      }
    };

    return {
      activeAction: UIActionType.SELECT,
      allActions: {
        [UIActionType.SELECT]: new SelectAction(paintlib),
      },
      setAction,
      options: {
        fgColor: paintlib.getPalette()[0],
        bgColor: 'transparent',
        tickness: paintlib.getAvailableTickness()[0],
      },
    };
  });
};
