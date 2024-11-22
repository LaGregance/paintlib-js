import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SAVE);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    console.log('TODO: Save');
  }
}
