import { Point, TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';
import { BaseSelectableAction } from './abstract/base-selectable-action';
import { PaintObject } from '../objects/abstract/paint-object';
import { UIActionType } from '../config/ui-action-type';

export class CreateObjectAction<T extends PaintObject<any>> extends BaseSelectableAction {
  protected object: T;
  protected originalXY: Point;

  constructor(
    paintlib: PaintLib,
    type: UIActionType,
    private objectConstructor: new () => T,
  ) {
    super(paintlib, type);
  }

  onClick() {}
  onSelected() {}
  onDeselected() {}

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    this.originalXY = event.scenePoint;

    this.object = new this.objectConstructor();
    this.object.create(event.scenePoint);

    const options = this.paintlib.uiStore.getState().options;
    this.object.set({
      strokeWidth: options.tickness,
      stroke: options.fgColor,
      fill: options.bgColor,
    });

    const scale = this.paintlib.uiStore.getState().globalScale;
    this.object['fabricObject'].set({
      selectable: false,
      lockMovementX: false,
      lockMovementY: false,
      scaleX: scale,
      scaleY: scale,
    });

    this.object.updateLayout(
      { left: event.scenePoint.x, top: event.scenePoint.y, width: 1, height: 1 },
      event.scenePoint.subtract(this.originalXY),
    );

    this.paintlib.add(this.object);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    const scale = this.object['fabricObject'].scaleX;

    let x = this.originalXY.x;
    let y = this.originalXY.y;
    let width = event.scenePoint.x - this.originalXY.x;
    let height = event.scenePoint.y - this.originalXY.y;

    if (width < 0) {
      x = this.originalXY.x + width;
      width = -width / scale;
    } else {
      width /= scale;
    }

    if (height < 0) {
      y = this.originalXY.y + height;
      height = -height / scale;
    } else {
      height /= scale;
    }

    this.object.updateLayout(
      {
        left: x,
        top: y,
        width,
        height,
      },
      event.scenePoint.subtract(this.originalXY),
    );
    this.paintlib.canvas.renderAll();
  }

  onMouseUp(): void {
    if (!this.object.isValidForCreation()) {
      this.paintlib.remove(this.object);
      return;
    }

    this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib, this.object['fabricObject']));
    this.object.onCreated();
  }
}
