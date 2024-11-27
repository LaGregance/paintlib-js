import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class CancelAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CANCEL);
  }

  async onClick() {
    const options = this.paintlib.getOptions();

    if (!this.paintlib.customization.cancelOnlyCustom) {
      // Clear
      await this.paintlib.load(options);
    }

    if (options.onCancel) {
      options.onCancel(this.paintlib);
    }
  }
}
