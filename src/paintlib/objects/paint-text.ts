import { Point, TBBox, Textbox } from 'fabric';
import { PaintObject } from './paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintText extends PaintObject<Textbox> {
  instantiate(point: Point) {
    this.fabricObject = new Textbox('Text', { top: point.y, left: point.x });
    this.fabricObject.editable = true;
  }

  updateLayout(layout: TBBox) {
    this.fabricObject.set({ top: layout.top, left: layout.left, fontSize: layout.height });
  }

  set(fields: PaintObjectFields) {
    fields = { ...fields };

    delete fields.strokeWidth;
    delete fields.fill;

    if (fields.stroke) {
      fields.fill = fields.stroke;
    }

    super.set(fields);
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
