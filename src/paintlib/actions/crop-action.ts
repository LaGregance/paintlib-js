import { PaintLib } from '../paintlib';
import { PaintActionType } from '../config/paint-action-type';
import { BaseClickableAction } from './abstract/base-clickable-action';

export class CropAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.CROP);
  }

  onClick() {
    this.paintlib.saveCheckpoint();
    this.paintlib.startCrop();
  }
}
