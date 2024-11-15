export enum UIActionType {
  SELECT = 'select',
  TRASH = 'trash',
  CLEAR = 'clear',
  SAVE = 'save',
  CANCEL = 'cancel',

  UNDO = 'undo',
  REDO = 'redo',

  SQUARE = 'square',
  CIRCLE = 'circle',
  DRAW = 'draw',
  TEXT = 'text',
}

/*export type OtherAction = {
  type:
    | UIActionType.SELECT
    | UIActionType.TRASH
    | UIActionType.CLEAR
    | UIActionType.SAVE
    | UIActionType.CANCEL
    | UIActionType.UNDO
    | UIActionType.REDO
    | UIActionType.SHAPE
    | UIActionType.DRAW
    | UIActionType.TEXT;
};

export type ShapeAction = {
  type: UIActionType.SHAPE;
  options: {
    borderColor?: string;
    borderColor?: string;
  }
}*/

export class UIAction {
  constructor(public type: UIActionType) {}
}
