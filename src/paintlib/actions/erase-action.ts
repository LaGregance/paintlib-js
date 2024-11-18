import { UIActionType } from './base-action';
import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './base-clickable-action';

export class EraseAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.ERASE);
  }

  onClick() {
    const target = this.paintlib.canvas.getActiveObject();
    if (target) {
      this.paintlib.canvas.remove(target);
    }
  }
}
