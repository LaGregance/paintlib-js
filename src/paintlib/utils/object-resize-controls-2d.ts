import { Control, Point, TBBox, TPointerEvent, Transform } from 'fabric';
import { TransformCorner } from './transform-corner';
import { PaintObject } from '../objects/abstract/paint-object';
import { PaintLib } from '../paintlib';

export const createResizeControls2D = (paintlib: PaintLib, obj: PaintObject<any>) => {
  const controls: Record<string, Control> = {};

  let originalEventInfo: { point: Point; layout: TBBox } = undefined;
  let lastTransform: Transform = undefined;
  const resize = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    // Calculate new coordinates based on control movement
    if (transform.action === 'resize') {
      if (lastTransform !== transform) {
        originalEventInfo = {
          point: paintlib.getRealPosFromCanvas(new Point(eventX, eventY)),
          layout: obj.getLayout(),
        };
      }
      lastTransform = transform;

      /**
       * Note object x, y (or top/left) are including transformation.
       * That's why we use cos/sin & invertTransform to calculate good offset
       */

      const corner = TransformCorner.parse(transform.corner);
      const eventPoint = paintlib.getRealPosFromCanvas(new Point(eventX, eventY));
      const deltaX = eventPoint.x - originalEventInfo.point.x;
      const deltaY = eventPoint.y - originalEventInfo.point.y;

      const newBox: TBBox = { ...originalEventInfo.layout };

      if (corner.horizontal === 'l') {
        // We move the left point: adjust x & width
        newBox.width -= deltaX;
        newBox.left += deltaX;
      } else if (corner.horizontal === 'r') {
        // We move the right point: adjust width
        newBox.width += deltaX;
      }

      if (corner.vertical === 't') {
        // We move the top point: adjust x,y & height
        newBox.height -= deltaY;
        newBox.top += deltaY;
      } else if (corner.vertical === 'b') {
        // We move the bottom point: adjust height
        newBox.height += deltaY;
      }

      if (newBox.width < 0) {
        newBox.width = -newBox.width;
        newBox.left -= newBox.width;
      }
      if (newBox.height < 0) {
        newBox.height = -newBox.height;
        newBox.top -= newBox.height;
      }

      /*const angle = util.degreesToRadians(target.getTotalAngle());
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
        newBox.width = -newBox.width;
        newBox.left -= Math.cos(angle) * newBox.width * scaleX;
        newBox.top -= Math.sin(angle) * newBox.width * scaleY;
      }
      if (newBox.height < 0) {
        newBox.height = -newBox.height;
        newBox.left -= Math.cos(angle + Math.PI / 2) * newBox.height * scaleX;
        newBox.top -= Math.sin(angle + Math.PI / 2) * newBox.height * scaleY;
      }*/

      obj.updateLayout(newBox, new Point(1, 1));
      obj.update(paintlib);
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
      });
    }
  }

  return controls;
};
