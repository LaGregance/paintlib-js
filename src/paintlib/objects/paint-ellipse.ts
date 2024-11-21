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

  updateLayout(layout: TBBox) {
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

  set(fields: Partial<PaintObjectFields>) {
    if (fields.strokeWidth) {
      this.targetStrokeWidth = fields.strokeWidth;
      this.updateLayout(this.getLayout());
    }
    super.set(fields);
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
