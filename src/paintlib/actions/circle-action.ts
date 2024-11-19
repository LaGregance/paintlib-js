import { UIActionType } from './base-action';
import { Ellipse, Point } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';
import { LayoutRect } from '../models/layout-rect';

export class CircleAction extends BaseShapeAction<Ellipse> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CIRCLE);
  }

  protected createShape(): Ellipse {
    return new Ellipse({ rx: 1, ry: 1 });
  }

  protected updateShapePosition(_start: Point, _end: Point, rect: LayoutRect) {
    this.shape.setX(rect.x);
    this.shape.setY(rect.y);
    this.shape.set({ rx: rect.width / 2, ry: rect.height / 2 });
  }

  protected finishShape(): void {}
}
