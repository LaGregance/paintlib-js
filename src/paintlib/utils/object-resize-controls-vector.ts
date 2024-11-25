import { Control, Point, TBBox, TPointerEvent, Transform, util } from 'fabric';
import { PaintObject } from '../objects/abstract/paint-object';

export const createResizeControlsVector = (obj: PaintObject<any>): Record<string, Control> => {
  let originalEventInfo: {
    point: Point;
    start: Point;
    end: Point;
    layout: TBBox;
  } = undefined;

  let lastTransform: Transform = undefined;

  const changePoint = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    const target = transform.target;

    // Calculate new coordinates based on control movement
    if (transform.action === 'movePoint') {
      const angle = util.degreesToRadians(target.getTotalAngle());
      const scale = target.scaleX;

      if (lastTransform !== transform) {
        originalEventInfo = {
          point: new Point(eventX, eventY),
          start: obj.getStart(),
          end: obj.getStart().add(obj.getVector().rotate(angle).scalarMultiply(scale)),
          layout: obj.getLayout(),
        };
      }
      lastTransform = transform;

      const delta = new Point(eventX - originalEventInfo.point.x, eventY - originalEventInfo.point.y);

      let start: Point;
      let end: Point;

      if (transform.corner === 'p1') {
        start = originalEventInfo.start.add(delta);
        end = originalEventInfo.end;
      } else if (transform.corner === 'p2') {
        start = originalEventInfo.start;
        end = originalEventInfo.end.add(delta);
      }

      obj['fabricObject'].set({ angle: 0 });
      obj.updateLayout(
        {
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(start.x - end.x) / scale,
          height: Math.abs(start.y - end.y) / scale,
        },
        end.subtract(start).scalarDivide(scale),
      );

      target.setCoords();
      return true;
    }

    return false;
  };

  return {
    p1: new Control({
      positionHandler: (dim, finalMatrix, fabricObj) => {
        const vector = obj.getVector().scalarDivide(2).scalarMultiply(fabricObj.scaleX);
        return vector.scalarMultiply(-1).transform(finalMatrix);
      },
      actionHandler: changePoint,
      cursorStyle: 'pointer',
      actionName: 'movePoint',
    }),
    p2: new Control({
      positionHandler: (dim, finalMatrix, fabricObj) => {
        const vector = obj.getVector().scalarDivide(2).scalarMultiply(fabricObj.scaleX);
        return vector.transform(finalMatrix);
      },
      actionHandler: changePoint,
      cursorStyle: 'pointer',
      actionName: 'movePoint',
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
