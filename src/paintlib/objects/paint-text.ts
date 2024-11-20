import { Point, Textbox } from 'fabric';
import { LayoutRect } from '../models/layout-rect';
import { PaintObject } from './paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';

export class PaintText extends PaintObject<Textbox> {
  instantiate(point: Point) {
    this.fabricObject = new Textbox('Text', { top: point.y, left: point.x });
    this.fabricObject.editable = true;
  }

  updateLayout(layout: LayoutRect) {
    this.fabricObject.setX(layout.x);
    this.fabricObject.setY(layout.y);
    this.fabricObject.set({ fontSize: layout.height });
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
