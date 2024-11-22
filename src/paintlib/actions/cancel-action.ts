import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class CancelAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CANCEL);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    console.log('TODO: Cancel');
  }
}
