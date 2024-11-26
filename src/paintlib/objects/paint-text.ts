import { Point, TBBox, Textbox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';
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

  onCreated() {
    this.fabricObject.enterEditing();
    this.fabricObject.selectAll();
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

  serializeExtras(): any {
    return {
      fontSize: this.fabricObject.fontSize,
    };
  }
}
