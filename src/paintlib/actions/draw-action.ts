import { UIActionType } from './base-action';
import { PencilBrush } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseSelectableAction } from './base-selectable-action';

export class DrawAction extends BaseSelectableAction {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.DRAW);
  }

  onSelected() {
    // Set up the PencilBrush
    const pencil = new PencilBrush(this.paintlib.canvas);
    pencil.width = 5; // Set the stroke width of the brush
    pencil.color = 'red'; // Set the brush color

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
