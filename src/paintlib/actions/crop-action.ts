import { PaintLib } from '../paintlib';
import { PaintActionType } from '../config/paint-action-type';
import { BaseSelectableAction } from './abstract/base-selectable-action';

export class CropAction extends BaseSelectableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, PaintActionType.CROP);
  }

  onSelected() {
    this.paintlib.saveCheckpoint();
    this.paintlib.startCrop();
  }

  onDeselected() {}
  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
