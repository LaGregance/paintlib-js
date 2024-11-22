import { Point, Rect, TBBox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControls2D } from '../utils/object-resize-control-2d';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintRect extends PaintObject<Rect> {
  private targetStrokeWidth: number;

  instantiate(point: Point) {
    this.fabricObject = new Rect({ left: point.x, top: point.y, width: 1, height: 1 });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls2D(this),
    };
  }

  updateLayout(layout: TBBox, start: Point, end: Point) {
    super.updateLayout(layout, start, end);

    const strokeWidth = Math.min(layout.width - 1, layout.height - 1, this.targetStrokeWidth);
    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
      width: layout.width - strokeWidth,
      height: layout.height - strokeWidth,
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
