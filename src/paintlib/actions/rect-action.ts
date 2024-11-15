import { BaseAction, UIActionType } from './base-action';
import { Canvas, Point, Rect, TPointerEvent, TPointerEventInfo } from 'fabric';

export class RectAction extends BaseAction {
  private shape: Rect;
  private originalXY: Point;

  constructor(canvas: Canvas) {
    super(canvas, UIActionType.RECT);
  }

  onSelected() {}
  onDeselected() {}

  onMouseDown(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseDown: ', this.type);
    this.shape = new Rect({ fill: 'red', stroke: 'blue' });
    this.shape.setXY(event.scenePoint);
    this.shape.width = 1;
    this.shape.height = 1;
    this.originalXY = event.scenePoint;
    this.canvas.add(this.shape);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>): void {
    console.log('onMouseMove: ', this.type, event.scenePoint);
    const width = event.scenePoint.x - this.originalXY.x;
    const height = event.scenePoint.y - this.originalXY.y;

    if (width > 0) {
      this.shape.set({ width });
      this.shape.setX(this.originalXY.x);
    } else {
      this.shape.set({ width: -width });
      this.shape.setX(this.originalXY.x + width);
    }

    if (height > 0) {
      this.shape.set({ height, y: this.originalXY.y });
      this.shape.setY(this.originalXY.y);
    } else {
      this.shape.set({ height: -height });
      this.shape.setY(this.originalXY.y + height);
    }

    this.canvas.renderAll();
  }

  onMouseUp(event: TPointerEventInfo<TPointerEvent>): void {
    if (this.shape.width <= 2 || this.shape.height <= 2) {
      this.canvas.remove(this.shape);
    }
    console.log('onMouseUp: ', this.type);
  }
}
