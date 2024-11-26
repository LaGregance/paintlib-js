import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SAVE);
  }

  onClick() {
    const options = this.paintlib.getOptions();
    if (options.onSave) {
      options.onSave(this.paintlib);
    }
  }
}
