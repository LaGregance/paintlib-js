import { TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../../paintlib';

export enum UIActionType {
  SELECT = 'select',
  TRASH = 'trash',
  SAVE = 'save',
  CANCEL = 'cancel',

  UNDO = 'undo',
  REDO = 'redo',

  RECT = 'rect',
  ELLIPSE = 'ellipse',
  LINE = 'LINE',
  ARROW = 'arrow',
  DRAW = 'draw',
  TEXT = 'text',
}

export abstract class BaseAction {
  constructor(
    public readonly paintlib: PaintLib,
    public readonly type: UIActionType,
    public readonly behavior: 'selectable' | 'clickable',
  ) {}

  abstract onClick(): void;

  abstract onSelected(): void;
  abstract onDeselected(): void;

  abstract onMouseDown(event: TPointerEventInfo<TPointerEvent>): void;
  abstract onMouseMove(event: TPointerEventInfo<TPointerEvent>): void;
  abstract onMouseUp(event: TPointerEventInfo<TPointerEvent>): void;
}
