import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class TrashAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.TRASH);
  }

  onClick() {
    const target = this.paintlib.canvas.getActiveObject();
    if (target) {
      this.paintlib.canvas.remove(target);
    }
  }
}
