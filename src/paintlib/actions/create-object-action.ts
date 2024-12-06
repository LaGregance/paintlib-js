import { Point, TBBox, TPointerEvent, TPointerEventInfo, util } from 'fabric';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';
import { BaseSelectableAction } from './abstract/base-selectable-action';
import { PaintObject } from '../objects/abstract/paint-object';
import { PaintActionType } from '../models/paint-action-type';
import { PaintText } from '../objects/paint-text';
import { rotateBox } from '../utils/box-utils';

export class CreateObjectAction<T extends PaintObject<any>> extends BaseSelectableAction {
  protected object: T;
  protected originalXY: Point;

  constructor(
    paintlib: PaintLib,
    type: PaintActionType,
    private objectConstructor: new () => T,
  ) {
    super(paintlib, type);
  }

  onClick() {}
  onSelected() {}
  onDeselected() {}

  /**
   * Fix for altitude to keep a minimum size on text but it's really weird and it should be an option on public
   * library
   *
   * @param layout
   * @param vector
   * @private
   */
  private fixMinimumLayoutSize(layout: TBBox, vector?: Point) {
    if (this.object instanceof PaintText) {
      vector = new Point(vector?.x || layout.width || 1, vector?.y || layout.height || 1);

      const minSide = Math.min(50, this.paintlib.canvas.height / 10, this.paintlib.canvas.width / 10);
      let minSize = new Point(minSide * 2, minSide);

      const rotation = -this.object.getTransform().rotation;
      if (rotation % 180 === 90) {
        minSize = new Point(minSize.y, minSize.x);
      }

      if (layout.width < minSize.x) {
        if (vector.x < 0) {
          layout.left += layout.width - minSize.x;
        }
        layout.width = minSize.x;
      }

      if (layout.height < minSize.y) {
        if (vector.y < 0) {
          layout.top += layout.height - minSize.y;
        }
        layout.height = minSize.y;
      }
    }
    return layout;
  }

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    this.originalXY = this.paintlib.getRealPosFromCanvas(event.scenePoint);

    this.object = new this.objectConstructor();
    this.object.create(this.originalXY);

    const options = this.paintlib.uiStore.getState().options;
    this.object.setOptions({
      tickness: options.tickness,
      fgColor: options.fgColor,
      bgColor: options.bgColor,
    });

    this.object.setTransform({ rotation: -this.paintlib.getTransform().rotation });

    this.object['fabricObject'].set({
      selectable: false,
      lockMovementX: false,
      lockMovementY: false,
    });

    this.object.updateLayout(
      this.fixMinimumLayoutSize({ left: this.originalXY.x, top: this.originalXY.y, width: 1, height: 1 }),
      // { left: this.originalXY.x, top: this.originalXY.y, width: 1, height: 1 },
      new Point(1, 1),
    );
    this.paintlib.add(this.object);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    const eventPoint = this.paintlib.getRealPosFromCanvas(event.scenePoint);

    let layout: TBBox = {
      left: this.originalXY.x,
      top: this.originalXY.y,
      width: eventPoint.x - this.originalXY.x,
      height: eventPoint.y - this.originalXY.y,
    };

    if (layout.width < 0) {
      layout.left = this.originalXY.x + layout.width;
      layout.width = -layout.width;
    }
    if (layout.height < 0) {
      layout.top = this.originalXY.y + layout.height;
      layout.height = -layout.height;
    }

    let vector = eventPoint.subtract(this.originalXY);
    layout = this.fixMinimumLayoutSize(layout, vector);

    const rotation = -this.object.getTransform().rotation;
    if (rotation) {
      const initialLayout = layout;
      layout = rotateBox(layout, rotation);
      layout.top = initialLayout.top;
      layout.left = initialLayout.left;

      if (rotation === 90) {
        // Add initial height to top (it's layout width after rotation)
        layout.top += initialLayout.height;
      } else if (rotation === 180) {
        layout.left += layout.width;
        layout.top += layout.height;
      } else if (rotation === 270) {
        // Add initial width to left (it's layout height after rotation)
        layout.left += initialLayout.width;
      }

      vector = vector.rotate(util.degreesToRadians(rotation));
    }

    this.object.updateLayout(layout, vector);
    this.object.update(this.paintlib);
    this.paintlib.canvas.renderAll();
  }

  onMouseUp(): void {
    if (!this.object.isValidForCreation()) {
      this.paintlib.remove(this.object);
      return;
    }

    this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib, this.object['fabricObject']));
    this.object.onCreated();
    this.paintlib.saveCheckpoint(this.object, true);
  }
}
