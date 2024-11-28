import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../config/paint-action-type';

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.SAVE);
  }

  onClick() {
    const options = this.paintlib.getOptions();
    if (options.onSave) {
      options.onSave(this.paintlib);
    }
  }
}
