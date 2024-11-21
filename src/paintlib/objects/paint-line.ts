import { Line, Point, TBBox } from 'fabric';
import { PaintVectorObject } from './abstract/paint-vector-object';

export class PaintLine extends PaintVectorObject<Line> {
  instantiate(point: Point) {
    this.fabricObject = new Line([point.x, point.y, point.x + 1, point.y + 1], { hasBorders: false, perPixelTargetFind: true });
    super.instantiate(point);
  }

  updateLayout(_layout: TBBox, start: Point, end: Point) {
    super.updateLayout(_layout, start, end);
    this.fabricObject.set({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    });
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
