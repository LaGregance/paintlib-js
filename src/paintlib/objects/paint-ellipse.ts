import { Ellipse, Point } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';
import { createResizeControls } from '../utils/object-resize-control';

export class PaintEllipse extends PaintObject<Ellipse> {
  instantiate(point: Point) {
    this.fabricObject = new Ellipse({ x: point.x, y: point.y, rx: 1, ry: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };
  }

  updateLayout(layout: LayoutRect) {
    this.fabricObject.setX(layout.x);
    this.fabricObject.setY(layout.y);
    this.fabricObject.set({ rx: layout.width / 2, ry: layout.height / 2 });
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
