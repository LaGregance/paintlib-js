import { Ellipse, Point } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { createResizeControls2D } from '../utils/object-resize-controls-2d';

export class PaintEllipse extends PaintObject<Ellipse> {
  instantiate(point: Point) {
    this.fabricObject = new Ellipse({ x: point.x, y: point.y, rx: 1, ry: 1, objectCaching: false });
    this.fabricObject.controls = {
      // Keep only existing resize control
      mtr: this.fabricObject.controls.mtr,
      ...createResizeControls2D(this),
    };
  }

  render() {
    const rx = this.layout.width / 2;
    const ry = this.layout.height / 2;
    const strokeWidth = Math.min(rx, ry, this.options.tickness);

    this.fabricObject.set({
      left: this.layout.left,
      top: this.layout.top,
      rx: this.layout.width / 2 - strokeWidth / 2,
      ry: this.layout.height / 2 - strokeWidth / 2,
      strokeWidth: strokeWidth,
      fill: this.options.bgColor,
      stroke: this.options.fgColor,
    });
  }
}
