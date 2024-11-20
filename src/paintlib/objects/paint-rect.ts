import { Point, Rect } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';
import { createResizeControls } from '../utils/object-resize-control';

export class PaintRect extends PaintObject<Rect> {
  instantiate(point: Point) {
    this.fabricObject = new Rect({ x: point.x, y: point.y, width: 1, height: 1 });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };
  }

  updateLayout(layout: LayoutRect) {
    this.fabricObject.setX(layout.x);
    this.fabricObject.setY(layout.y);
    this.fabricObject.set({ width: layout.width, height: layout.height });
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
