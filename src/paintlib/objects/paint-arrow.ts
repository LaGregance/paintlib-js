import { Group, Line, Point, Triangle } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { getEndPoint, getStartPoint } from '../utils/vector-utils';
import { PaintLib } from '../paintlib';
import { createResizeControls } from '../utils/object-resize-controls';

const ARROW_WIDTH_BASE = 10;
const ARROW_HEIGHT_BASE = 10;
const ARROW_WIDTH_FACTOR = 2;
const ARROW_HEIGHT_FACTOR = 2;

export class PaintArrow extends PaintObject<Group> {
  public static getName() {
    return 'PaintArrow';
  }

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
    this.fabricObject.controls = {};
  }

  bind(paintLib: PaintLib) {
    this.fabricObject.controls = createResizeControls(paintLib, this, 'vector');
  }

  isValidForCreation() {
    return Math.sqrt(this.layout.width * this.layout.width + this.layout.height * this.layout.height) > 5;
  }

  render() {
    // Arrowhead size
    const arrowWidth = ARROW_WIDTH_BASE + ARROW_WIDTH_FACTOR * this.line.strokeWidth;
    const arrowHeight = ARROW_HEIGHT_BASE + ARROW_HEIGHT_FACTOR * this.line.strokeWidth;

    const layout = this.layout;
    let start = getStartPoint(layout, this.vector);
    let end = getEndPoint(layout, this.vector);

    // In group object are positioned relative to center, that's why we use width/2 & height/2
    start = new Point(start.x - layout.left - layout.width / 2, start.y - layout.top - layout.height / 2);
    end = new Point(end.x - layout.left - layout.width / 2, end.y - layout.top - layout.height / 2);

    // Calculate the angle for the arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const deltaX = (arrowHeight / 2) * Math.cos(angle);
    const deltaY = (arrowHeight / 2) * Math.sin(angle);

    this.fabricObject.set({
      left: this.layout.left,
      top: this.layout.top,
      width: this.layout.width,
      height: this.layout.height,
    });

    this.line.set({
      x1: start.x,
      y1: start.y,
      x2: end.x - deltaX,
      y2: end.y - deltaY,
      strokeWidth: this.options.tickness,
      stroke: this.options.fgColor,
    });

    this.arrow.set({
      left: end.x - deltaX,
      top: end.y - deltaY,
      width: arrowWidth,
      height: arrowHeight,
      angle: (angle * 180) / Math.PI + 90,
      originX: 'center',
      originY: 'center',
      fill: this.options.fgColor,
    });
  }
}
