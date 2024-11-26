import { Point, Rect, TBBox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControls2D } from '../utils/object-resize-controls-2d';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintRect extends PaintObject<Rect> {
  instantiate(point: Point) {
    this.fabricObject = new Rect({ left: point.x, top: point.y, width: 1, height: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls2D(this),
    };
  }

  updateLayout(layout: TBBox, vector: Point) {
    super.updateLayout(layout, vector);

    const strokeWidth = Math.min(Math.trunc(layout.width / 2), Math.trunc(layout.height / 2), this.fields.strokeWidth);
    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
      width: layout.width - strokeWidth,
      height: layout.height - strokeWidth,
      strokeWidth: strokeWidth,
    });
  }

  getLayout(): TBBox {
    return {
      top: this.fabricObject.top,
      left: this.fabricObject.left,
      width: this.fabricObject.width + this.fabricObject.strokeWidth,
      height: this.fabricObject.height + this.fabricObject.strokeWidth,
    };
  }

  set(fields: Partial<PaintObjectFields>) {
    super.set(fields);

    if (fields.strokeWidth) {
      this.updateLayout(this.getLayout(), this.vector);
    }
    this.fabricObject.set(fields);
  }
}
