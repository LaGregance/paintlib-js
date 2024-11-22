import { Line, Point, TBBox } from 'fabric';
import { PaintObjectFields } from '../models/paint-object-fields';
import { PaintObject } from './abstract/paint-object';
import { createResizeControlsVector } from '../utils/object-resize-controls-vector';
import { getEndPoint, getStartPoint } from '../utils/vector-utils';

export class PaintLine extends PaintObject<Line> {
  instantiate(point: Point) {
    this.fabricObject = new Line([point.x, point.y, point.x + 1, point.y + 1], {
      hasBorders: false,
      perPixelTargetFind: true,
    });
    this.fabricObject.controls = createResizeControlsVector(this);
  }

  updateLayout(layout: TBBox, vector: Point) {
    super.updateLayout(layout, vector);

    const start = getStartPoint(layout, this.vector);
    const end = getEndPoint(layout, this.vector);

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

  set(fields: PaintObjectFields) {
    super.set(fields);
    this.fabricObject.set(fields);
  }
}
