import { UIActionType } from './base-action';
import { Ellipse, Point } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';
import { LayoutRect } from '../models/layout-rect';

export class CircleAction extends BaseShapeAction<Ellipse> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.ELLIPSE);
  }

  protected createShape(): Ellipse {
    const obj = new Ellipse({ rx: 1, ry: 1, objectCaching: false });
    obj.on('scaling', (event) => {
      // Calculate new radius while preserving aspect ratio
      const scaleX = obj.scaleX;
      const scaleY = obj.scaleY;

      obj.set({
        // fill: 'red',
        rx: obj.rx * scaleX,
        ry: obj.ry * scaleY,
        scaleX: 1, // Reset scaleX
        scaleY: 1, // Reset scaleY
      });
      obj.setCoords();
      this.paintlib.canvas.renderAll();
      event.e.preventDefault();
    });
    return obj;
  }

  protected updateShapePosition(_start: Point, _end: Point, rect: LayoutRect) {
    this.shape.setX(rect.x);
    this.shape.setY(rect.y);
    this.shape.set({ rx: rect.width / 2, ry: rect.height / 2 });
  }

  protected finishShape(): void {}
}
