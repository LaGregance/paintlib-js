import { FabricObject, Path, PencilBrush } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseSelectableAction } from './abstract/base-selectable-action';
import { PaintDraw } from '../objects/paint-draw';
import { UIActionType } from '../config/ui-action-type';

export class DrawAction extends BaseSelectableAction {
  private pencil: PencilBrush;

  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.DRAW);
  }

  onSelected() {
    this.pencil = new PencilBrush(this.paintlib.canvas);

    const options = this.paintlib.uiStore.getState().options;
    this.pencil.width = options.tickness;
    this.pencil.color = options.fgColor;

    // Assign the brush to the canvas & Enable free drawing mode
    this.paintlib.canvas.freeDrawingBrush = this.pencil;
    this.paintlib.canvas.isDrawingMode = true;
    this.paintlib.canvas.renderAll();

    this.paintlib.canvas.on('object:added', this.onObjectAdded);
  }

  private onObjectAdded = ({ target }: { target: FabricObject }) => {
    if (target instanceof Path) {
      const path = new PaintDraw();
      path.attach(target);
      this.paintlib.add(path);
    }
  };

  onDeselected() {
    this.paintlib.canvas.off('object:added', this.onObjectAdded);
    this.paintlib.canvas.freeDrawingBrush = null;
    this.paintlib.canvas.isDrawingMode = false;
    this.paintlib.canvas.renderAll();
  }

  update() {
    const options = this.paintlib.uiStore.getState().options;
    this.pencil.width = options.tickness;
    this.pencil.color = options.fgColor;
    this.paintlib.canvas.renderAll();
  }

  onMouseDown() {}
  onMouseMove() {}
  onMouseUp() {}
}
