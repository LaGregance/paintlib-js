import { Control, Point, TBBox, TPointerEvent, Transform, util } from 'fabric';
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

      const objTransform = obj.getTransform();
      const rotation = util.degreesToRadians(objTransform.rotation);

      const corner = TransformCorner.parse(transform.corner);
      const eventPoint = paintlib.getRealPosFromCanvas(new Point(eventX, eventY));
      const delta = new Point(
        eventPoint.x - originalEventInfo.point.x,
        eventPoint.y - originalEventInfo.point.y,
      ).rotate(-rotation);

      const newBox: TBBox = { ...originalEventInfo.layout };

      if (corner.horizontal === 'l') {
        // We move the left point: adjust x & width
        newBox.width -= delta.x;

        newBox.left += Math.cos(rotation) * delta.x * objTransform.scaleX;
        newBox.top += Math.sin(rotation) * delta.x * objTransform.scaleY;
      } else if (corner.horizontal === 'r') {
        // We move the right point: adjust width
        newBox.width += delta.x;
      }

      if (corner.vertical === 't') {
        // We move the top point: adjust x,y & height
        newBox.height -= delta.y;

        newBox.left += Math.cos(rotation + Math.PI / 2) * delta.y * objTransform.scaleX;
        newBox.top += Math.sin(rotation + Math.PI / 2) * delta.y * objTransform.scaleY;
      } else if (corner.vertical === 'b') {
        // We move the bottom point: adjust height
        newBox.height += delta.y;
      }

      if (newBox.width < 0) {
        newBox.width = -newBox.width;

        newBox.left -= Math.cos(rotation) * newBox.width * objTransform.scaleX;
        newBox.top -= Math.sin(rotation) * newBox.width * objTransform.scaleY;
      }
      if (newBox.height < 0) {
        newBox.height = -newBox.height;

        newBox.left -= Math.cos(rotation + Math.PI / 2) * newBox.height * objTransform.scaleX;
        newBox.top -= Math.sin(rotation + Math.PI / 2) * newBox.height * objTransform.scaleY;
      }

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
