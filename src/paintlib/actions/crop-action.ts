import { PaintLib } from '../paintlib';
import { UIActionType } from '../config/ui-action-type';
import { BaseClickableAction } from './abstract/base-clickable-action';

export class CropAction extends BaseClickableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CROP);
  }

  onClick() {
    this.paintlib.saveCheckpoint();
    this.paintlib.startCrop();
  }
}
