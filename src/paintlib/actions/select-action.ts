import { BaseAction, UIActionType } from './base-action';
import { PaintLib } from '../paintlib';
import { Object } from 'fabric';

export class SelectAction extends BaseAction {
  constructor(
    paintlib: PaintLib,
    private defaultSelected?: Object,
  ) {
    super(paintlib, UIActionType.SELECT);
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
