import { UIActionType } from './base-action';
import { Line, Point } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';

export class LineAction extends BaseShapeAction<Line> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.LINE);
  }

  protected createShape() {
    return new Line();
  }

  protected updateShapePosition(start: Point, end: Point): void {
    this.shape.set({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
    });
  }

  protected finishShape(): void {}
}
