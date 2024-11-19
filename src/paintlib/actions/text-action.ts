import { UIActionType } from './base-action';
import { Point, Textbox } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';
import { LayoutRect } from '../models/layout-rect';

export class TextAction extends BaseShapeAction<Textbox> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.TEXT);
  }

  protected createShape() {
    const textbox = new Textbox('Text');
    textbox.editable = true;
    return textbox;
  }

  protected updateShapePosition(_start: Point, _end: Point, rect: LayoutRect): void {
    this.shape.setX(rect.x);
    this.shape.setY(rect.y);
    this.shape.set({ fontSize: rect.height });
  }

  protected finishShape(): void {}
}
