import { BaseAction, UIActionType } from './base-action';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';

export class EraseAction extends BaseAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.ERASE);
  }

  onSelected() {
    const target = this.paintlib.canvas.getActiveObject();
    if (target) {
      this.paintlib.canvas.remove(target);
    } else {
      this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib));
    }
  }

  onDeselected() {
    this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib));
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
