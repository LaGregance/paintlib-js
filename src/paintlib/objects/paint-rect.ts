import { Point, Rect } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';
import { createResizeControls } from '../utils/object-resize-control';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintRect extends PaintObject<Rect> {
  instantiate(point: Point) {
    this.fabricObject = new Rect({ left: point.x, top: point.y, width: 1, height: 1 });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };
  }

  updateLayout(layout: LayoutRect) {
    const strokeWidth = this.fabricObject.strokeWidth;
    this.fabricObject.set({
      left: layout.x,
      top: layout.y,
      width: layout.width - strokeWidth,
      height: layout.height - strokeWidth,
    });
  }

  set(fields: Partial<PaintObjectFields>) {
    if (fields.strokeWidth) {
      const deltaStroke = fields.strokeWidth - this.fabricObject.strokeWidth;
      this.fabricObject.set({
        width: this.fabricObject.width - deltaStroke,
        height: this.fabricObject.height - deltaStroke,
      });
    }
    super.set(fields);
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
