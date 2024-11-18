import { UIActionType } from './base-action';
import { Rect } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';

export class RectAction extends BaseShapeAction<Rect> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.RECT);
  }

  protected createShape(): Rect {
    return new Rect({ fill: 'red', stroke: 'blue' });
  }

  protected updateShapePosition(x: number, y: number, width: number, height: number): void {
    this.shape.setX(x);
    this.shape.setY(y);
    this.shape.set({ width, height });
  }

  protected finishShape(): void {}
}
