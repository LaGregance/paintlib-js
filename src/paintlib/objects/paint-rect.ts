import { Point, Rect } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControls2D } from '../utils/object-resize-controls-2d';

export class PaintRect extends PaintObject<Rect> {
  instantiate(point: Point) {
    this.fabricObject = new Rect({ left: point.x, top: point.y, width: 1, height: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls2D(this),
    };
  }

  render() {
    const strokeWidth = Math.min(
      Math.trunc(this.layout.width / 2),
      Math.trunc(this.layout.height / 2),
      this.options.tickness,
    );
    this.fabricObject.set({
      left: this.layout.left,
      top: this.layout.top,
      width: this.layout.width - strokeWidth,
      height: this.layout.height - strokeWidth,
      strokeWidth: strokeWidth,
      fill: this.options.bgColor,
      stroke: this.options.fgColor,
    });
  }
}
