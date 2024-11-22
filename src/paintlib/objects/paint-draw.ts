import { Point, Path, util } from 'fabric';
import { PaintObject } from './abstract/paint-object';

export class PaintDraw extends PaintObject<Path> {
  instantiate(point: Point) {}

  rotateWithCanvas(scale: number, rotation: number, translation: Point) {
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
