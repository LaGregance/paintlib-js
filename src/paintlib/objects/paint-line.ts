import { Control, Line, Point, TBBox, TPointerEvent, Transform } from 'fabric';
import { PaintObject } from './paint-object';

export class PaintLine extends PaintObject<Line> {
  instantiate(point: Point) {
    this.fabricObject = new Line([point.x, point.y, point.x + 1, point.y + 1], { hasBorders: false, perPixelTargetFind: true });

    // Add the custom actionHandler function
    const changePoint = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
      const target = transform.target;

      // Calculate new coordinates based on control movement
      if (transform.action === 'movePoint') {
        if (transform.corner === 'p1') {
          // Move left end (p1)
          target.set({ x1: x, y1: y });
        } else if (transform.corner === 'p2') {
          // Move right end (p2)
          target.set({ x2: x, y2: y });
        }
        target.setCoords();
        return true;
      }

      return false;
    };

    this.fabricObject.controls = {
      p1: new Control({
        positionHandler: function (dim, finalMatrix, fabricObject) {
          const line = fabricObject as Line;
          const controlPoint = new Point(line.x1, line.y1);
          const centerPoint = new Point(line.x1 + (line.x2 - line.x1) / 2, line.y1 + (line.y2 - line.y1) / 2);
          const relativePoint = controlPoint.subtract(centerPoint);
          return relativePoint.transform(finalMatrix);
        },
        actionHandler: changePoint,
        cursorStyle: 'pointer',
        actionName: 'movePoint',
        offsetX: 0,
        offsetY: 0,
        /*render: function (ctx, left, top, styleOverride, fabricObject) {
          const size = 6;
          ctx.fillStyle = 'lime';
          ctx.beginPath();
          ctx.arc(left, top, size, 0, Math.PI * 2, false);
          ctx.fill();
        },*/
      }),
      p2: new Control({
        positionHandler: function (dim, finalMatrix, fabricObject) {
          const line = fabricObject as Line;
          const controlPoint = new Point(line.x2, line.y2);
          const centerPoint = new Point(line.x1 + (line.x2 - line.x1) / 2, line.y1 + (line.y2 - line.y1) / 2);
          const relativePoint = controlPoint.subtract(centerPoint);
          return relativePoint.transform(finalMatrix);
        },
        actionHandler: changePoint,
        cursorStyle: 'pointer',
        actionName: 'movePoint',
        offsetX: 0,
        offsetY: 0,
      }),
    };
  }

  updateLayout(_layout: TBBox, start: Point, end: Point) {
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
