import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../models/paint-action-type';

export class ClearAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.CLEAR);
  }

  async onClick() {
    this.paintlib.clear(this.paintlib.customization.clearEraseImage);
  }
}
