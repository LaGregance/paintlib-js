import { Path, Point, TBBox } from 'fabric';
import { PaintObject } from './abstract/paint-object';
import { PaintObjectFields } from '../models/paint-object-fields';
import { PaintObjectJson } from '../models/paint-object-json';

export class PaintDraw extends PaintObject<Path> {
  instantiate(point: Point, data?: PaintObjectJson) {
    this.fabricObject = new Path(data.extras.path, data.extras);
  }

  attach(obj: Path) {
    this.fabricObject = obj;

    const layout = this.getLayout();
    this.fields = {
      stroke: obj.stroke as string,
      fill: obj.fill as string,
      strokeWidth: obj.strokeWidth,
    };
    this.updateLayout(layout, new Point(layout.width, layout.height));
  }

  updateLayout(layout: TBBox, vector: Point) {
    super.updateLayout(layout, vector);

    this.fabricObject.set({
      left: layout.left,
      top: layout.top,
    });
  }

  set(fields: Partial<PaintObjectFields>) {
    super.set(fields);
    this.fabricObject.set(fields);
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
