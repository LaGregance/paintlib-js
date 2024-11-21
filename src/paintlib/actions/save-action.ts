import { UIActionType } from './abstract/base-action';
import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SAVE);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    console.log('TODO: Save');
  }
}
