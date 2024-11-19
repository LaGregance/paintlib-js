import { UIActionType } from './base-action';
import { Object, Point, TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';
import { BaseSelectableAction } from './base-selectable-action';
import { setFabricField } from '../utils/fabric-utils';
import { LayoutRect } from '../models/layout-rect';

export abstract class BaseShapeAction<T extends Object> extends BaseSelectableAction {
  protected shape: T;
  protected originalXY: Point;

  constructor(paintlib: PaintLib, type: UIActionType) {
    super(paintlib, type);
  }

  protected abstract createShape(): T;
  protected abstract updateShapePosition(start: Point, end: Point, rect: LayoutRect): void;
  protected abstract finishShape(): void;

  onClick() {}
  onSelected() {}
  onDeselected() {}

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    this.originalXY = event.scenePoint;
    console.log('originql: ', this.originalXY);

    this.shape = this.createShape();

    const options = this.paintlib.uiStore.getState().options;
    setFabricField(this.shape, 'strokeWidth', options.tickness);
    setFabricField(this.shape, 'stroke', options.fgColor);
    setFabricField(this.shape, 'fill', options.bgColor);

    this.shape.setXY(event.scenePoint);
    this.shape.width = 1;
    this.shape.height = 1;

    this.shape.selectable = false;
    this.shape.lockMovementY = true;
    this.shape.lockMovementX = true;

    this.paintlib.canvas.add(this.shape);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    let x = this.originalXY.x;
    let y = this.originalXY.y;
    let width = event.scenePoint.x - this.originalXY.x;
    let height = event.scenePoint.y - this.originalXY.y;

    if (width < 0) {
      width = -width;
      x = this.originalXY.x - width;
    }

    if (height < 0) {
      height = -height;
      y = this.originalXY.y - height;
    }

    this.updateShapePosition(this.originalXY, event.scenePoint, { x, y, width, height });
    this.paintlib.canvas.renderAll();
  }

  onMouseUp(): void {
    if (this.shape.width <= 2 || this.shape.height <= 2) {
      this.paintlib.canvas.remove(this.shape);
      return;
    }
    this.finishShape();
    this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib, this.shape));
  }
}
