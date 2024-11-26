import { Path, Point } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectJson } from '../models/paint-object-json';

export class PaintDraw extends PaintObject<Path> {
  instantiate(point: Point, data?: PaintObjectJson) {
    this.fabricObject = new Path(data.extras.path, data.extras);
  }

  attach(obj: Path) {
    this.fabricObject = obj;

    const layout = this.getLayout();
    this.options = {
      fgColor: obj.stroke as string,
      bgColor: obj.fill as string,
      tickness: obj.strokeWidth,
    };
    this.updateLayout(layout, new Point(layout.width, layout.height));
  }

  render() {
    this.fabricObject.set({
      stroke: this.options.fgColor,
      fill: this.options.bgColor,
      strokeWidth: this.options.tickness,
    });
  }

  serializeExtras(): any {
    return {
      path: this.fabricObject.path,
      strokeDashArray: this.fabricObject.strokeDashArray,
      strokeDashOffset: this.fabricObject.strokeDashOffset,
      strokeLineCap: this.fabricObject.strokeLineCap,
      strokeLineJoin: this.fabricObject.strokeLineJoin,
      strokeMiterLimit: this.fabricObject.strokeMiterLimit,
      strokeUniform: this.fabricObject.strokeUniform,
    };
  }
}
