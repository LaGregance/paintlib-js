import { BaseAction, UIActionType } from './base-action';
import { Ellipse, Point, TPointerEvent, TPointerEventInfo } from 'fabric';
import { PaintLib } from '../paintlib';
import { SelectAction } from './select-action';

export class CircleAction extends BaseAction {
  private shape: Ellipse;
  private originalXY: Point;

  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CIRCLE);
  }

  onSelected() {
    console.log('Circle select');
  }

  onDeselected() {
    console.log('Circle deselect');
  }

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    this.shape = new Ellipse({ fill: 'red', stroke: 'blue', rx: 1, ry: 1 });
    this.shape.setXY(event.scenePoint);
    this.shape.width = 1;
    this.shape.height = 1;
    this.originalXY = event.scenePoint;
    this.paintlib.canvas.add(this.shape);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseMove: ', this.type, event.scenePoint);
    const width = event.scenePoint.x - this.originalXY.x;
    const height = event.scenePoint.y - this.originalXY.y;

    this.shape.set({ rx: Math.abs(width) / 2, ry: Math.abs(height) / 2 });

    if (width > 0) {
      this.shape.setX(this.originalXY.x);
    } else {
      this.shape.setX(this.originalXY.x + width);
    }

    if (height > 0) {
      this.shape.setY(this.originalXY.y);
    } else {
      this.shape.setY(this.originalXY.y + height);
    }

    this.paintlib.canvas.renderAll();
  }

  onMouseUp(): void {
    if (this.shape.width <= 2 || this.shape.height <= 2) {
      this.paintlib.canvas.remove(this.shape);
    }
    this.paintlib.uiStore.getState().setAction(new SelectAction(this.paintlib, this.shape));
  }
}
