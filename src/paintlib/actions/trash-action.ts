import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../config/paint-action-type';

export class TrashAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.TRASH);
  }

  onClick() {
    const target = this.paintlib.getSelectedObject();
    if (target) {
      this.paintlib.saveCheckpoint(target);
      this.paintlib.remove(target);
    }
  }
}
