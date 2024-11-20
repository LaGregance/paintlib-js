import { Ellipse, Point } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';

export class PaintEllipse extends PaintObject<Ellipse> {
  instantiate(point: Point) {
    this.fabricObject = new Ellipse({ x: point.x, y: point.y, rx: 1, ry: 1, objectCaching: false });
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
