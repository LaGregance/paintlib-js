import { Control, Point, TBBox, TMat2D, TPointerEvent, Transform, util } from 'fabric';
import { TransformCorner } from './transform-corner';
import { PaintObject } from '../objects/abstract/paint-object';

export const createResizeControls2D = (obj: PaintObject<any>) => {
  const controls: Record<string, Control> = {};

  let originalEventInfo: { point: Point; invertMatrix: TMat2D; layout: TBBox } = undefined;
  let lastTransform: Transform = undefined;
  const resize = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    const target = transform.target;

    // Calculate new coordinates based on control movement
    if (transform.action === 'resize') {
      if (lastTransform !== transform) {
        const objectMatrix = target.calcTransformMatrix();
        const invertMatrix = util.invertTransform(objectMatrix);

        originalEventInfo = {
          point: new Point(eventX, eventY).transform(invertMatrix),
          layout: obj.getLayout(),
          invertMatrix,
        };
      }
      lastTransform = transform;

      /**
       * Note object x, y (or top/left) are including transformation.
       * That's why we use cos/sin & invertTransform to calculate good offset
       */

      const corner = TransformCorner.parse(transform.corner);
      const eventPoint = new Point(eventX, eventY).transform(originalEventInfo.invertMatrix);
      const deltaX = eventPoint.x - originalEventInfo.point.x;
      const deltaY = eventPoint.y - originalEventInfo.point.y;

      const angle = util.degreesToRadians(target.getTotalAngle());
      const offset = corner.getTransformOffset(angle, deltaX, deltaY);
      const newBox: TBBox = {
        left: originalEventInfo.layout.left + offset.left,
        top: originalEventInfo.layout.top + offset.top,
        width: originalEventInfo.layout.width + offset.width,
        height: originalEventInfo.layout.height + offset.height,
      };

      if (newBox.width < 0) {
        newBox.width = -newBox.width;

        newBox.left -= Math.cos(angle) * newBox.width;
        newBox.top -= Math.sin(angle) * newBox.width;
      }
      if (newBox.height < 0) {
        newBox.height = -newBox.height;
        newBox.left -= Math.cos(angle + Math.PI / 2) * newBox.height;
        newBox.top -= Math.sin(angle + Math.PI / 2) * newBox.height;
      }

      obj.updateLayout(
        newBox,
        new Point(newBox.left, newBox.top),
        new Point(newBox.left + newBox.width, newBox.top + newBox.height),
      );
      target.setCoords();
      return true;
    }

    return false;
  };

  for (const vertical of ['t', 'm', 'b']) {
    let y = 0;
    if (vertical === 't') y = -0.5;
    else if (vertical === 'b') y = 0.5;

    for (const horizontal of ['l', 'm', 'r']) {
      if (vertical === 'm' && horizontal === 'm') {
        continue;
      }

      let x = 0;
      if (horizontal === 'l') x = -0.5;
      else if (horizontal === 'r') x = 0.5;

      controls[vertical + horizontal] = new Control({
        x,
        y,
        actionHandler: resize,
        cursorStyle: 'pointer',
        actionName: 'resize',
        offsetX: 0,
        offsetY: 0,
      });
    }
  }

  return controls;
};
