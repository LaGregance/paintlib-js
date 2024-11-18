import { UIActionType } from './base-action';
import { PencilBrush } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseSelectableAction } from './base-selectable-action';

export class DrawAction extends BaseSelectableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.DRAW);
  }

  onSelected() {
    const pencil = new PencilBrush(this.paintlib.canvas);

    const options = this.paintlib.uiStore.getState().options;
    pencil.width = options.tickness;
    pencil.color = options.fgColor;

    // Assign the brush to the canvas & Enable free drawing mode
    this.paintlib.canvas.freeDrawingBrush = pencil;
    this.paintlib.canvas.isDrawingMode = true;
    this.paintlib.canvas.renderAll();
  }

  onDeselected() {
    this.paintlib.canvas.freeDrawingBrush = null;
    this.paintlib.canvas.isDrawingMode = false;
    this.paintlib.canvas.renderAll();
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
