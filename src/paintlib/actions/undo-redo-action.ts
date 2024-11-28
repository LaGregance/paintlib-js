import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../config/paint-action-type';

export class UndoRedoAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private mode: 'undo' | 'redo',
  ) {
    super(paintlib, mode === 'undo' ? PaintActionType.UNDO : PaintActionType.REDO);
  }

  onClick() {
    if (this.mode === 'undo') {
      this.paintlib.undo();
    } else {
      this.paintlib.redo();
    }
  }
}
