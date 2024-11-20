import { Point, Rect } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';

export class PaintRect extends PaintObject<Rect> {
  instantiate(point: Point) {
    this.fabricObject = new Rect({ x: point.x, y: point.y, width: 1, height: 1 });
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
