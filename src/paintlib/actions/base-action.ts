import { TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../paintlib';

export enum UIActionType {
  SELECT = 'select',
  ERASE = 'ERASE',
  CLEAR = 'clear',
  SAVE = 'save',
  CANCEL = 'cancel',

  UNDO = 'undo',
  REDO = 'redo',

  RECT = 'rect',
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

export type RectAction = {
  type: UIActionType.SHAPE;
  options: {
    borderColor?: string;
    borderColor?: string;
  }
}*/

export abstract class BaseAction {
  constructor(
    public readonly paintlib: PaintLib,
    public readonly type: UIActionType,
  ) {}

  abstract onSelected(): void;
  abstract onDeselected(): void;

  abstract onMouseDown(event: TPointerEventInfo<TPointerEvent>): void;
  abstract onMouseMove(event: TPointerEventInfo<TPointerEvent>): void;
  abstract onMouseUp(event: TPointerEventInfo<TPointerEvent>): void;
}
