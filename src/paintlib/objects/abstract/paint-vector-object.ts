import { Control, Object, Point, TBBox, TPointerEvent, Transform } from 'fabric';
import { PaintObject } from './paint-object';

export abstract class PaintVectorObject<T extends Object> extends PaintObject<T> {
  protected start: Point;
  protected end: Point;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  instantiate(_point: Point) {
    const changePoint = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
      const target = transform.target;

      // Calculate new coordinates based on control movement
      if (transform.action === 'movePoint') {
        if (transform.corner === 'p1') {
          this.start = new Point(x, y);
        } else if (transform.corner === 'p2') {
          this.end = new Point(x, y);
        }

        this.updateLayout(
          {
            left: Math.min(this.start.x, this.end.x),
            top: Math.min(this.start.y, this.end.y),
            width: Math.abs(this.start.x - this.end.x),
            height: Math.abs(this.start.y - this.end.y),
          },
          this.start,
          this.end,
        );

        target.setCoords();
        return true;
      }

      return false;
    };

    this.fabricObject.controls = {
      p1: new Control({
        positionHandler: (dim, finalMatrix) => {
          const controlPoint = this.start;
          const centerPoint = this.end.subtract(this.start).scalarDivide(2).add(this.start);
          const relativePoint = controlPoint.subtract(centerPoint);
          return relativePoint.transform(finalMatrix);
        },
        actionHandler: changePoint,
        cursorStyle: 'pointer',
        actionName: 'movePoint',
        offsetX: 0,
        offsetY: 0,
      }),
      p2: new Control({
        positionHandler: (dim, finalMatrix) => {
          const controlPoint = this.end;
          const centerPoint = this.end.subtract(this.start).scalarDivide(2).add(this.start);
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
    };
  }

  updateLayout(_layout: TBBox, start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }
}
