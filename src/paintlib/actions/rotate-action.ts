import { PaintLib } from '../paintlib';
import { BaseClickableAction } from './abstract/base-clickable-action';
import { PaintActionType } from '../config/paint-action-type';

export class RotateAction extends BaseClickableAction {
  constructor(
    paintlib: PaintLib,
    private direction: 'left' | 'right',
  ) {
    super(paintlib, direction == 'left' ? PaintActionType.ROTATE_LEFT : PaintActionType.ROTATE_RIGHT);
  }

  onClick() {
    this.paintlib.saveCheckpoint();

    const actualRotation = this.paintlib.getTransform().rotation;
    this.paintlib.setRotation(actualRotation + (this.direction === 'left' ? -90 : 90));
  }
}
