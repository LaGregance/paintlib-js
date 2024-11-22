import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class SaveAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SAVE);
  }

  onClick() {
    // TODO: Trigger event on paintlib
    const result = this.paintlib.serialize();
    const data = btoa(JSON.stringify(result));
    console.log('TODO: Save: ', data);
    console.log('TODO: Restore: ', JSON.parse(atob(data)));
  }
}
