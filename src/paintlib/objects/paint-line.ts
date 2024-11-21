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

  getLayout(): TBBox {
    return {
      top: Math.min(this.fabricObject.y1, this.fabricObject.y2),
      left: Math.min(this.fabricObject.x1, this.fabricObject.x2),
      width: Math.abs(this.fabricObject.x1 - this.fabricObject.x2),
      height: Math.abs(this.fabricObject.y1 - this.fabricObject.y2),
    };
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
