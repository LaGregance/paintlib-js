import { Control, Object, Point, TBBox, TPointerEvent, Transform } from 'fabric';
import { PaintObject } from './paint-object';

export abstract class PaintVectorObject<T extends Object> extends PaintObject<T> {
  protected vector: Point;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  instantiate(_point: Point) {
    const changePoint = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
      const target = transform.target;

      // Calculate new coordinates based on control movement
      if (transform.action === 'movePoint') {
        let start: Point;
        let end: Point;

        if (transform.corner === 'p1') {
          start = new Point(x, y);
          end = this.getEnd();
        } else if (transform.corner === 'p2') {
          start = this.getStart();
          end = new Point(x, y);
        }

        console.log('start = ', start);
        console.log('end = ', end);
        console.log('=====');

        this.updateLayout(
          {
            left: Math.min(start.x, end.x),
            top: Math.min(start.y, end.y),
            width: Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y),
          },
          start,
          end,
        );

        target.setCoords();
        return true;
      }

      return false;
    };

    this.fabricObject.controls = {
      p1: new Control({
        positionHandler: (dim, finalMatrix) => {
          const controlPoint = this.getStart();
          const centerPoint = this.getEnd().subtract(controlPoint).scalarDivide(2).add(controlPoint);
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
          const start = this.getStart();
          const controlPoint = this.getEnd();
          const centerPoint = controlPoint.subtract(start).scalarDivide(2).add(start);
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

  getStart() {
    const layout = this.getLayout();

    if (this.vector.x >= 0 && this.vector.y >= 0) {
      return new Point(layout.left, layout.top);
    } else if (this.vector.x >= 0 && this.vector.y < 0) {
      return new Point(layout.left, layout.top + layout.height);
    } else if (this.vector.x < 0 && this.vector.y >= 0) {
      return new Point(layout.left + layout.width, layout.top);
    } else {
      // x < 0 && y < 0
      return new Point(layout.left + layout.width, layout.top + layout.height);
    }
  }

  getEnd() {
    const layout = this.getLayout();

    if (this.vector.x >= 0 && this.vector.y >= 0) {
      return new Point(layout.left + layout.width, layout.top + layout.height);
    } else if (this.vector.x >= 0 && this.vector.y < 0) {
      return new Point(layout.left + layout.width, layout.top);
    } else if (this.vector.x < 0 && this.vector.y >= 0) {
      return new Point(layout.left, layout.top + layout.height);
    } else {
      // x < 0 && y < 0
      return new Point(layout.left, layout.top);
    }
  }

  updateLayout(_layout: TBBox, start: Point, end: Point) {
    this.vector = end.subtract(start);
  }
}
