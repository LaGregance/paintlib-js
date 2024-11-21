import { Ellipse, Point } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';
import { createResizeControls } from '../utils/object-resize-control';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintEllipse extends PaintObject<Ellipse> {
  private targetStrokeWidth: number;

  instantiate(point: Point) {
    this.fabricObject = new Ellipse({ x: point.x, y: point.y, rx: 1, ry: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };
  }

  updateLayout(layout: LayoutRect) {
    const rx = layout.width / 2;
    const ry = layout.height / 2;
    const strokeWidth = Math.min(rx, ry, this.targetStrokeWidth);

    this.fabricObject.set({
      left: layout.x,
      top: layout.y,
      rx: layout.width / 2 - strokeWidth / 2,
      ry: layout.height / 2 - strokeWidth / 2,
      strokeWidth: strokeWidth,
    });
  }

  set(fields: Partial<PaintObjectFields>) {
    if (fields.strokeWidth) {
      this.targetStrokeWidth = fields.strokeWidth;

      const layout = this.getLayout();
      this.updateLayout({
        x: layout.left,
        y: layout.top,
        width: layout.width,
        height: layout.height,
      });
    }
    super.set(fields);
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
