import { BaseAction } from '../actions/abstract/base-action';
import { createStore } from 'zustand/vanilla';
import { PaintLib } from '../paintlib';
import { SelectAction } from '../actions/select-action';
import { PaintObject } from '../objects/abstract/paint-object';
import { PaintActionType } from '../models/paint-action-type';
import { PaintObjectOptions } from '../models/paint-object-options';

export type UIStore = {
  allActions: {
    [key in PaintActionType]?: BaseAction;
  };
  activeAction?: PaintActionType;
  setAction: (action: BaseAction) => void;
  selectedObject?: PaintObject<any>;
  options: PaintObjectOptions;
  canUndo: boolean;
  canRedo: boolean;
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
          allActions: { ...oldStore.allActions, [action.type]: action },
          activeAction: action.type,
        }));

        action.onSelected();
      }
    };

    return {
      activeAction: PaintActionType.SELECT,
      allActions: {
        [PaintActionType.SELECT]: new SelectAction(paintlib),
      },
      setAction,
      globalScale: 1,
      options: {
        fgColor: paintlib.getPalette()[0],
        bgColor: 'transparent',
        tickness: paintlib.getAvailableTickness()[4],
      },
      canUndo: false,
      canRedo: false,
    };
  });
};
