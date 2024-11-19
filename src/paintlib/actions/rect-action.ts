import { UIActionType } from './base-action';
import { Point, Rect } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';
import { LayoutRect } from '../models/layout-rect';

export class RectAction extends BaseShapeAction<Rect> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.RECT);
  }

  protected createShape() {
    return new Rect();
  }

  protected updateShapePosition(_start: Point, _end: Point, rect: LayoutRect): void {
    this.shape.setX(rect.x);
    this.shape.setY(rect.y);
    this.shape.set({ width: rect.width, height: rect.height });
  }

  protected finishShape(): void {}
}
