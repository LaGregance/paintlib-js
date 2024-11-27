import { Point, Textbox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectJson } from '../models/paint-object-json';

export class PaintText extends PaintObject<Textbox> {
  instantiate(point: Point, restoreData?: PaintObjectJson) {
    this.fabricObject = new Textbox('Text', {
      top: point.y,
      left: point.x,
      objectCaching: false,
      fontSize: restoreData?.extras?.fontSize ?? 5,
    });
    this.fabricObject.editable = true;
  }

  render() {
    this.fabricObject.set({
      top: this.layout.top,
      left: this.layout.left,
      fontSize: this.layout.height * 0.9,
      height: this.layout.height,
      width: this.layout.width,
      fill: this.options.fgColor,
    });

    // Adjust fontSize to fit precise height
    const ratio = this.layout.height / this.fabricObject.calcTextHeight();
    this.fabricObject.set({
      fontSize: this.fabricObject.fontSize * ratio,
    });

    if (this.layout.width < this.fabricObject.width) {
      this.layout.width = this.fabricObject.width;
    }
  }

  onCreated() {
    this.fabricObject.enterEditing();
    this.fabricObject.selectAll();
  }

  serializeExtras(): any {
    return {
      fontSize: this.fabricObject.fontSize,
    };
  }
}
