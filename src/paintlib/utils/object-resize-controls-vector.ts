import { Control, Point, TPointerEvent, Transform } from 'fabric';
import { PaintObject } from '../objects/abstract/paint-object';

export const createResizeControlsVector = (obj: PaintObject<any>): Record<string, Control> => {
  const changePoint = (eventData: TPointerEvent, transform: Transform, x: number, y: number) => {
    const target = transform.target;

    // Calculate new coordinates based on control movement
    if (transform.action === 'movePoint') {
      let start: Point;
      let end: Point;

      if (transform.corner === 'p1') {
        start = new Point(x, y);
        end = obj.getEnd();
      } else if (transform.corner === 'p2') {
        start = obj.getStart();
        end = new Point(x, y);
      }

      obj.updateLayout(
        {
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(start.x - end.x),
          height: Math.abs(start.y - end.y),
        },
        end.subtract(start),
      );

      target.setCoords();
      return true;
    }

    return false;
  };

  return {
    p1: new Control({
      positionHandler: (dim, finalMatrix) => {
        const controlPoint = obj.getStart();
        const centerPoint = obj.getEnd().subtract(controlPoint).scalarDivide(2).add(controlPoint);
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
        const start = obj.getStart();
        const controlPoint = obj.getEnd();
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
};
