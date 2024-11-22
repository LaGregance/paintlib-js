import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { UIActionType } from '../config/ui-action-type';

export class RotateAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private direction: 'left' | 'right',
  ) {
    super(paintlib, direction == 'left' ? UIActionType.ROTATE_LEFT : UIActionType.ROTATE_RIGHT);
  }

  onClick() {
    this.paintlib.rotate(this.direction);
  }
}
