import { Control, Point, TBBox, TPointerEvent, Transform, util } from 'fabric';
import { TransformCorner } from './transform-corner';
import { PaintObject } from '../objects/abstract/paint-object';
import { PaintLib } from '../paintlib';
import { renderControl } from './improve-default-control';

export const createResizeControls = (paintlib: PaintLib, obj: PaintObject<any>, mode: 'box' | 'vector') => {
  let originalEventInfo: { point: Point; vector: Point; layout: TBBox } = undefined;
  let lastTransform: Transform = undefined;
  const resize = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    // Calculate new coordinates based on control movement
    if (transform.action === 'resize') {
      if (lastTransform !== transform) {
        originalEventInfo = {
          point: paintlib.getRealPosFromCanvas(new Point(eventX, eventY)),
          layout: obj.getLayout(),
          vector: obj.getVector(),
        };
        paintlib.saveCheckpoint(obj);
      }
      lastTransform = transform;

      /**
       * Note object x, y (or top/left) are including transformation.
       * That's why we use cos/sin & invertTransform to calculate good offset
       */

      const objTransform = obj.getTransform();
      const rotation = util.degreesToRadians(objTransform.rotation);

      const corner =
        mode === 'box'
          ? TransformCorner.parse(transform.corner)
          : TransformCorner.parseFromVector(originalEventInfo.vector, transform.corner as 'start' | 'end');

      const eventPoint = paintlib.getRealPosFromCanvas(new Point(eventX, eventY));
      const delta = new Point(
        eventPoint.x - originalEventInfo.point.x,
        eventPoint.y - originalEventInfo.point.y,
      ).rotate(-rotation);

      const [layout, vector] = corner.transformLayoutVectorWithRotation(
        originalEventInfo.layout,
        originalEventInfo.vector,
        rotation,
        delta,
        new Point(objTransform.scaleX, objTransform.scaleY),
      );

      obj.updateLayout(layout, vector);
      obj.update(paintlib);
      return true;
    }

    return false;
  };

  if (mode === 'box') {
    const controls: Record<string, Control> = {};
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
          cursorStyle: 'pointer',
          actionHandler: resize,
          actionName: 'resize',
          render: renderControl,
          sizeX: 30,
          sizeY: 30,
          touchSizeX: 60,
          touchSizeY: 60,
        });
      }
    }
    return controls;
  } else {
    return {
      start: new Control({
        positionHandler: (dim, finalMatrix, fabricObj) => {
          const vector = obj
            .getVector()
            .multiply(new Point(fabricObj.width, fabricObj.height))
            .scalarDivide(-2)
            .scalarMultiply(fabricObj.scaleX);
          return vector.transform(finalMatrix);
        },
        cursorStyle: 'pointer',
        actionHandler: resize,
        actionName: 'resize',
        render: renderControl,
        sizeX: 30,
        sizeY: 30,
        touchSizeX: 60,
        touchSizeY: 60,
      }),
      end: new Control({
        positionHandler: (dim, finalMatrix, fabricObj) => {
          const vector = obj
            .getVector()
            .multiply(new Point(fabricObj.width, fabricObj.height))
            .scalarDivide(2)
            .scalarMultiply(fabricObj.scaleX);
          return vector.transform(finalMatrix);
        },
        cursorStyle: 'pointer',
        actionHandler: resize,
        actionName: 'resize',
        render: renderControl,
        sizeX: 30,
        sizeY: 30,
        touchSizeX: 60,
        touchSizeY: 60,
      }),
    };
  }
};
