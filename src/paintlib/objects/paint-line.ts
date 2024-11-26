import { Line, Point } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControlsVector } from '../utils/object-resize-controls-vector';
import { getEndPoint, getStartPoint } from '../utils/vector-utils';

export class PaintLine extends PaintObject<Line> {
  instantiate(point: Point) {
    this.fabricObject = new Line([point.x, point.y, point.x + 1, point.y + 1], {
      hasBorders: false,
      perPixelTargetFind: true,
      objectCaching: false,
    });
    this.fabricObject.controls = createResizeControlsVector(this);
  }

  render() {
    const start = getStartPoint(this.layout, this.vector);
    const end = getEndPoint(this.layout, this.vector);

    this.fabricObject.set({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      stroke: this.options.fgColor,
      strokeWidth: this.options.tickness,
    });
  }
}
