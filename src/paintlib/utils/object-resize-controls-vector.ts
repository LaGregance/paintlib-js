import { Control, Point, TBBox, TMat2D, TPointerEvent, Transform, util } from 'fabric';
import { PaintObject } from '../objects/abstract/paint-object';
import { TransformCorner } from './transform-corner';

export const createResizeControlsVector = (obj: PaintObject<any>): Record<string, Control> => {
  let originalEventInfo: { point: Point; vector: Point; invertMatrix: TMat2D; layout: TBBox } = undefined;
  let lastTransform: Transform = undefined;

  const changePoint = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    const target = transform.target;

    // Calculate new coordinates based on control movement
    if (transform.action === 'movePoint') {
      if (lastTransform !== transform) {
        const objectMatrix = target.calcTransformMatrix();
        const invertMatrix = util.invertTransform(objectMatrix);

        originalEventInfo = {
          point: new Point(eventX, eventY).transform(invertMatrix),
          vector: obj.getVector(),
          layout: obj.getLayout(),
          invertMatrix,
        };
      }
      lastTransform = transform;

      /**
       * Note object x, y (or top/left) are including transformation.
       * That's why we use cos/sin & invertTransform to calculate good offset
       */

      let vector = originalEventInfo.vector;
      const corner = TransformCorner.parseFromVector(
        originalEventInfo.vector,
        transform.corner === 'p1' ? 'start' : 'end',
      );
      const eventPoint = new Point(eventX, eventY).transform(originalEventInfo.invertMatrix);
      const deltaX = eventPoint.x - originalEventInfo.point.x;
      const deltaY = eventPoint.y - originalEventInfo.point.y;

      const angle = util.degreesToRadians(target.getTotalAngle());
      const scaleX = target.scaleX;
      const scaleY = target.scaleY;
      const offset = corner.getTransformOffset(angle, deltaX, deltaY, scaleX, scaleY);
      const newBox: TBBox = {
        left: originalEventInfo.layout.left + offset.left,
        top: originalEventInfo.layout.top + offset.top,
        width: originalEventInfo.layout.width + offset.width,
        height: originalEventInfo.layout.height + offset.height,
      };

      if (newBox.width < 0) {
        vector = vector.multiply(new Point(-1, 1));
        newBox.width = -newBox.width;
        newBox.left -= Math.cos(angle) * newBox.width * scaleX;
        newBox.top -= Math.sin(angle) * newBox.width * scaleY;
      }
      if (newBox.height < 0) {
        vector = vector.multiply(new Point(1, -1));
        newBox.height = -newBox.height;
        newBox.left -= Math.cos(angle + Math.PI / 2) * newBox.height * scaleX;
        newBox.top -= Math.sin(angle + Math.PI / 2) * newBox.height * scaleY;
      }

      obj.updateLayout(
        newBox,
        vector
          .divide(new Point(Math.abs(vector.x), Math.abs(vector.y)))
          .multiply(new Point(newBox.width, newBox.height)),
      );
      target.setCoords();
      return true;
    }

    return false;
  };

  return {
    p1: new Control({
      positionHandler: (dim, finalMatrix, fabricObj) => {
        const vector = obj.getVector().scalarDivide(-2).scalarMultiply(fabricObj.scaleX);
        return vector.transform(finalMatrix);
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
