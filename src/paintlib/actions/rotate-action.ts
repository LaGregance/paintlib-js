import { UIActionType } from './abstract/base-action';
import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';

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
