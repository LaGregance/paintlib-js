import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../models/paint-action-type';

export class CancelAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.CANCEL);
  }

  async onClick() {
    const options = this.paintlib.getOptions();

    if (options.onCancel) {
      options.onCancel(this.paintlib);
    }
  }
}
