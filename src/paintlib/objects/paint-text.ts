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

    delete this.fabricObject.controls.ml;
    delete this.fabricObject.controls.mr;
    delete this.fabricObject.controls.mb;
    delete this.fabricObject.controls.mt;
  }

  render() {
    this.fabricObject.set({
      top: this.layout.top,
      left: this.layout.left,
      fontSize: this.layout.height,
      height: this.layout.height,
      width: this.layout.width,
      fill: this.options.fgColor,
    });
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
