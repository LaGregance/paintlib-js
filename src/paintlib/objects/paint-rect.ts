import { Point, Rect, TBBox } from 'fabric';
import { PaintObject } from './paint-object';
import { createResizeControls } from '../utils/object-resize-control';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintRect extends PaintObject<Rect> {
  private targetStrokeWidth: number;

  instantiate(point: Point) {
    this.fabricObject = new Rect({ left: point.x, top: point.y, width: 1, height: 1 });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };
  }

  updateLayout(layout: TBBox) {
    const strokeWidth = Math.min(layout.width - 1, layout.height - 1, this.targetStrokeWidth);
    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
      width: layout.width - strokeWidth,
      height: layout.height - strokeWidth,
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
