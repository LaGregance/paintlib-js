import { Point, TBBox, Textbox, util } from 'fabric';
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

  updateLayout(layout: TBBox, start: Point, end: Point) {
    super.updateLayout(layout, start, end);
    this.fabricObject.set({ top: layout.top, left: layout.left, fontSize: layout.height, height: layout.height, width: layout.width });
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

  rotateWithCanvas(direction: 'left' | 'right', scale: number, rotation: number, translation: Point) {
    const start = this.getStart().scalarMultiply(scale).rotate(rotation).add(translation);

    this.fabricObject.set({
      left: start.x,
      top: start.y,
      angle: this.fabricObject.angle + util.radiansToDegrees(rotation),
      scaleX: this.fabricObject.scaleX * scale,
      scaleY: this.fabricObject.scaleY * scale,
    });
    this.fabricObject.setCoords();
  }

  restore(data: any) {}

  toJSON(): any {
    return {};
  }
}
