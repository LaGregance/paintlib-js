import { Point, TBBox, TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';
import { BaseSelectableAction } from './abstract/base-selectable-action';
import { PaintObject } from '../objects/abstract/paint-object';
import { PaintActionType } from '../config/paint-action-type';
import { ObjectRegistry } from '../config/object-registry';

export class CreateObjectAction<T extends PaintObject<any>> extends BaseSelectableAction {
  protected object: T;
  protected originalXY: Point;
  private alwaysHorizontal?: boolean;

  constructor(
    paintlib: PaintLib,
    type: PaintActionType,
    private objectConstructor: new () => T,
  ) {
    super(paintlib, type);
    this.alwaysHorizontal = ObjectRegistry.getObjectMeta(type).creationAlwaysHorizontal;
  }

  onClick() {}
  onSelected() {}
  onDeselected() {}

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

    if (this.alwaysHorizontal) {
      this.object.setTransform({ rotation: -this.paintlib.getTransform().rotation });
    }

    this.object['fabricObject'].set({
      selectable: false,
      lockMovementX: false,
      lockMovementY: false,
    });

    this.object.updateLayout(
      { left: event.scenePoint.x, top: event.scenePoint.y, width: 1, height: 1 },
      new Point(1, 1),
    );

    this.paintlib.add(this.object);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    const eventPoint = this.paintlib.getRealPosFromCanvas(event.scenePoint);

    let x = this.originalXY.x;
    let y = this.originalXY.y;
    let width = eventPoint.x - this.originalXY.x;
    let height = eventPoint.y - this.originalXY.y;

    if (width < 0) {
      x = this.originalXY.x + width;
      width = -width;
    }
    if (height < 0) {
      y = this.originalXY.y + height;
      height = -height;
    }

    let layout: TBBox = {
      left: x,
      top: y,
      width,
      height,
    };

    // === Layout correction if alwaysHorizontal ===
    const rotation = this.object.getTransform().rotation;
    if (this.alwaysHorizontal && rotation !== 0) {
      // Calculate correct layout when create with rotation
      if (rotation === -90) {
        layout = {
          left: layout.left,
          top: layout.top + layout.height,
          width: layout.height,
          height: layout.width,
        };
      } else if (rotation === -180) {
        layout = {
          left: layout.left + layout.width,
          top: layout.top + layout.height,
          width: layout.width,
          height: layout.height,
        };
      } else if (rotation === -270) {
        layout = {
          left: layout.left + layout.width,
          top: layout.top,
          width: layout.height,
          height: layout.width,
        };
      }
    }
    // =============================================

    this.object.updateLayout(layout, eventPoint.subtract(this.originalXY));
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
