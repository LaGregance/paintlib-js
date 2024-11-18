import { UIActionType } from './base-action';
import { Textbox } from 'fabric';
import { PaintLib } from '../paintlib';
import { BaseShapeAction } from './base-shape-action';

export class TextAction extends BaseShapeAction<Textbox> {
  constructor(paintlib: PaintLib) {
    super(paintlib, UIActionType.TEXT);
  }

  protected createShape() {
    const textbox = new Textbox('Text');
    textbox.editable = true;
    return textbox;
  }

  protected updateShapePosition(x: number, y: number, width: number, height: number): void {
    this.shape.setX(x);
    this.shape.setY(y);
    this.shape.set({ fontSize: height });
  }

  protected finishShape(): void {}
}
