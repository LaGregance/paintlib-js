import { Group, Line, Point, TBBox, Triangle } from 'fabric';
import { PaintVectorObject } from './abstract/paint-vector-object';
import { PaintObjectFields } from '../models/paint-object-fields';

const ARROW_WIDTH_BASE = 10;
const ARROW_HEIGHT_BASE = 10;
const ARROW_WIDTH_FACTOR = 2;
const ARROW_HEIGHT_FACTOR = 2;

export class PaintArrow extends PaintVectorObject<Group> {
  private line: Line;
  private arrow: Triangle;

  instantiate(point: Point) {
    this.line = new Line(undefined);
    this.arrow = new Triangle();
    this.fabricObject = new Group([this.line, this.arrow], { hasControls: false, hasBorders: false, perPixelTargetFind: true });
    this.updateLayout({ left: point.x, top: point.y, width: 1, height: 1 }, point, new Point(point.x + 1, point.y + 1));
    super.instantiate(point);
  }

  updateLayout(layout: TBBox, start: Point, end: Point) {
    super.updateLayout(layout, start, end);

    // Arrowhead size
    const arrowWidth = ARROW_WIDTH_BASE + ARROW_WIDTH_FACTOR * this.line.strokeWidth;
    const arrowHeight = ARROW_HEIGHT_BASE + ARROW_HEIGHT_FACTOR * this.line.strokeWidth;

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
    if (fields.strokeWidth) {
      this.line.set({ strokeWidth: fields.strokeWidth });
      this.updateLayout(this.getLayout(), this.getStart(), this.getEnd());
    }
    if (fields.stroke) {
      this.line.set({ stroke: fields.stroke });
      this.arrow.set({ fill: fields.stroke });
    }
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
