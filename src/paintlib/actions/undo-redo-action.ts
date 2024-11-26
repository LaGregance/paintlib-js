import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class UndoRedoAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private mode: 'undo' | 'redo',
  ) {
    super(paintlib, mode === 'undo' ? UIActionType.UNDO : UIActionType.REDO);
  }

  onClick() {
    if (this.mode === 'undo') {
      this.paintlib.undo();
    } else {
      this.paintlib.redo();
    }
  }
}
