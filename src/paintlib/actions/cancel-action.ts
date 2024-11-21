import { UIActionType } from './abstract/base-action';
import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';

export class CancelAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CANCEL);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    console.log('TODO: Cancel');
  }
}
