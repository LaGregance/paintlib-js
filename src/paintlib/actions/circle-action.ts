import { UIActionType } from './base-action';
import { Ellipse } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';

export class CircleAction extends BaseShapeAction<Ellipse> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.CIRCLE);
  }

  protected createShape(): Ellipse {
    return new Ellipse({ fill: 'red', stroke: 'blue', rx: 1, ry: 1 });
  }

  protected updateShapePosition(x: number, y: number, width: number, height: number): void {
    this.shape.setX(x);
    this.shape.setY(y);
    this.shape.set({ rx: width / 2, ry: height / 2 });
  }

  protected finishShape(): void {}
}
