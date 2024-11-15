import { BaseAction, UIActionType } from './base-action';
import { PaintLib } from '../paintlib';

export class SelectAction extends BaseAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.SELECT);
  }

  onSelected() {
    this.paintlib.enableSelection(true);
  }

  onDeselected() {
    this.paintlib.enableSelection(false);
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
