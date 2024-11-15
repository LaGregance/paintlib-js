import { UIAction, UIActionType } from '../models/ui-action';

export type UIStore = {
  allActions: {
    [key in UIActionType]?: UIAction;
  };
  activeAction?: UIActionType;
};
