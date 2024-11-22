import { Point, Path, util } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';
import { getStartPoint } from '../utils/vector-utils';

export class PaintDraw extends PaintObject<Path> {
  instantiate(point: Point) {}

  attach(obj: Path) {
    this.fabricObject = obj;

    const layout = this.getLayout();
    this.updateLayout(layout, new Point(layout.width, layout.height));
  }

  rotateWithCanvas(scale: number, rotation: number, translation: Point) {
    const start = getStartPoint(this.getLayout(), this.vector).scalarMultiply(scale).rotate(rotation).add(translation);

    this.fabricObject.set({
      left: start.x,
      top: start.y,
      angle: this.fabricObject.angle + util.radiansToDegrees(rotation),
      scaleX: this.fabricObject.scaleX * scale,
      scaleY: this.fabricObject.scaleY * scale,
    });
    this.fabricObject.setCoords();
  }

  set(fields: PaintObjectFields) {
    super.set(fields);
    this.fabricObject.set(fields);
  }
}
