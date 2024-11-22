import { Ellipse, Point, TBBox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControls2D } from '../utils/object-resize-control-2d';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintEllipse extends PaintObject<Ellipse> {
  private targetStrokeWidth: number;

  instantiate(point: Point) {
    this.fabricObject = new Ellipse({ x: point.x, y: point.y, rx: 1, ry: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls2D(this),
    };
  }

  updateLayout(layout: TBBox, start: Point, end: Point) {
    super.updateLayout(layout, start, end);

    const rx = layout.width / 2;
    const ry = layout.height / 2;
    const strokeWidth = Math.min(rx, ry, this.targetStrokeWidth);

    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
      rx: layout.width / 2 - strokeWidth / 2,
      ry: layout.height / 2 - strokeWidth / 2,
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
    if (fields.strokeWidth) {
      this.targetStrokeWidth = fields.strokeWidth;
      this.updateLayout(this.getLayout(), this.getStart(), this.getEnd());
    }
    super.set(fields);
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
