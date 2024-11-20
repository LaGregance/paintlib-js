import { Control, Point, TPointerEvent, Transform } from 'fabric';
import { TransformCorner } from './transform-corner';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from '../objects/paint-object';

export const createResizeControls = (obj: PaintObject<any>) => {
  const controls: Record<string, Control> = {};

  const resize = (eventData: TPointerEvent, transform: Transform, eventX: number, eventY: number) => {
    const target = transform.target;

    // Calculate new coordinates based on control movement
    if (transform.action === 'resize') {
      let corner = TransformCorner.parse(transform.corner);
      const box = { left: target.getX(), top: target.getY(), width: target.width, height: target.height };
      const offset = corner.getTransformOffset(box, eventX, eventY);
      const newBox: LayoutRect = {
        x: box.left + offset.left,
        y: box.top + offset.top,
        width: box.width + offset.width,
        height: box.height + offset.height,
      };

      if (newBox.width < 0) {
        corner = corner.getOpposite('horizontal');
        transform.corner = corner.toString();

        newBox.width = -newBox.width;
        newBox.x -= newBox.width;
      }
      if (newBox.height < 0) {
        corner = corner.getOpposite('vertical');
        transform.corner = corner.toString();

        newBox.height = -newBox.height;
        newBox.y -= newBox.height;
      }

      // TODO: Direction
      obj.updateLayout(newBox, new Point(newBox.x, newBox.y), new Point(newBox.x + newBox.width, newBox.y + newBox.height));
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
