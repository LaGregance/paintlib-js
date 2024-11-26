import { Group, Line, Point, TBBox, Triangle } from 'fabric';
import { PaintObjectFields } from '../models/paint-object-fields';
import { PaintObject } from './abstract/paint-object';
import { createResizeControlsVector } from '../utils/object-resize-controls-vector';
import { getEndPoint, getStartPoint } from '../utils/vector-utils';

const ARROW_WIDTH_BASE = 10;
const ARROW_HEIGHT_BASE = 10;
const ARROW_WIDTH_FACTOR = 2;
const ARROW_HEIGHT_FACTOR = 2;

export class PaintArrow extends PaintObject<Group> {
  private line: Line;
  private arrow: Triangle;

  instantiate(point: Point) {
    this.line = new Line(undefined, { objectCaching: false });
    this.arrow = new Triangle({ objectCaching: false });
    this.fabricObject = new Group([this.line, this.arrow], {
      hasControls: false,
      hasBorders: false,
      perPixelTargetFind: true,
      objectCaching: false,
    });
    this.updateLayout({ left: point.x, top: point.y, width: 1, height: 1 }, new Point(1, 1));
    this.fabricObject.controls = createResizeControlsVector(this);
  }

  updateLayout(layout: TBBox, vector: Point) {
    super.updateLayout(layout, vector);

    // Arrowhead size
    const arrowWidth = ARROW_WIDTH_BASE + ARROW_WIDTH_FACTOR * this.line.strokeWidth;
    const arrowHeight = ARROW_HEIGHT_BASE + ARROW_HEIGHT_FACTOR * this.line.strokeWidth;

    let start = getStartPoint(layout, vector);
    let end = getEndPoint(layout, vector);

    // In group object are positioned relative to center, that's why we use width/2 & height/2
    start = new Point(start.x - layout.left - layout.width / 2, start.y - layout.top - layout.height / 2);
    end = new Point(end.x - layout.left - layout.width / 2, end.y - layout.top - layout.height / 2);

    // Calculate the angle for the arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const deltaX = (arrowHeight / 2) * Math.cos(angle);
    const deltaY = (arrowHeight / 2) * Math.sin(angle);

    // Line properties
    this.line.set({
      x1: start.x,
      y1: start.y,
      x2: end.x - deltaX,
      y2: end.y - deltaY,
      selectable: true,
    });

    this.arrow.set({
      left: end.x - deltaX,
      top: end.y - deltaY,
      width: arrowWidth,
      height: arrowHeight,
      angle: (angle * 180) / Math.PI + 90,
      originX: 'center',
      originY: 'center',
    });

    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
    });
  }

  set(fields: PaintObjectFields) {
    super.set(fields);

    if (fields.strokeWidth) {
      this.line.set({ strokeWidth: fields.strokeWidth });
      this.updateLayout(this.getLayout(), this.vector);
    }
    if (fields.stroke) {
      this.line.set({ stroke: fields.stroke });
      this.arrow.set({ fill: fields.stroke });
    }
  }
}
