import { Point, TBBox, Textbox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintText extends PaintObject<Textbox> {
  instantiate(point: Point) {
    this.fabricObject = new Textbox('Text', { top: point.y, left: point.x });
    this.fabricObject.editable = true;
    /*this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls(this),
    };*/
  }

  updateLayout(layout: TBBox, vector: Point) {
    super.updateLayout(layout, vector);
    this.fabricObject.set({
      top: layout.top,
      left: layout.left,
      fontSize: layout.height,
      height: layout.height,
      width: layout.width,
    });
  }

  set(fields: PaintObjectFields) {
    super.set(fields);

    delete fields.strokeWidth;
    delete fields.fill;

    if (fields.stroke) {
      fields.fill = fields.stroke;
    }
    this.fabricObject.set(fields);
  }
}
