import { UIActionType } from './base-action';
import { Group, Line, Point, Triangle } from 'fabric';
import { PaintLib } from '../paintlib';
import { LayoutRect } from '../models/layout-rect';
import { BaseShapeAction } from './base-shape-action';

export class ArrowAction extends BaseShapeAction<Group> {
  private line: Line;
  private arrow: Triangle;

  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.ARROW);
  }

  private update(start: Point, end: Point, rect: LayoutRect): void {
    // Arrowhead size
    const arrowWidth = 15;
    const arrowHeight = 15;

    // In group object are positioned relative to center, that's why we use width/2 & height/2
    start = new Point(start.x - rect.x - rect.width / 2, start.y - rect.y - rect.height / 2);
    end = new Point(end.x - rect.x - rect.width / 2, end.y - rect.y - rect.height / 2);

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
      stroke: 'red',
      strokeWidth: 3,
      selectable: true,
    });

    this.arrow.set({
      left: end.x - deltaX,
      top: end.y - deltaY,
      width: arrowWidth,
      height: arrowHeight,
      fill: 'red',
      angle: (angle * 180) / Math.PI + 90,
      originX: 'center',
      originY: 'center',
    });

    if (this.shape) {
      this.shape.setX(rect.x);
      this.shape.setY(rect.y);
      this.shape.set({
        width: rect.width,
        height: rect.height,
      });
    }
  }

  protected createShape() {
    this.line = new Line(undefined);
    this.arrow = new Triangle();
    this.update(new Point(0, 0), new Point(100, 100), { x: 0, y: 0, width: 100, height: 100 });
    return new Group([this.line, this.arrow], { hasControls: false, hasBorders: false, perPixelTargetFind: true });
  }

  protected updateShapePosition(start: Point, end: Point, rect: LayoutRect): void {
    this.update(start, end, rect);
  }

  protected finishShape(): void {}
}
