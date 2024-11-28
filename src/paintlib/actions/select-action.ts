import { PaintLib } from '../paintlib';
import { Object } from 'fabric';
import { BaseSelectableAction } from './abstract/base-selectable-action';
import { PaintActionType } from '../config/paint-action-type';

export class SelectAction extends BaseSelectableAction {
  constructor(
    paintlib: PaintLib,
    private defaultSelected?: Object,
  ) {
    super(paintlib, PaintActionType.SELECT);
  }

  onSelected() {
    this.paintlib.enableSelection(true);
    if (this.defaultSelected) {
      this.paintlib.canvas.setActiveObject(this.defaultSelected);
    }
  }

  onDeselected() {
    this.paintlib.enableSelection(false);
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
