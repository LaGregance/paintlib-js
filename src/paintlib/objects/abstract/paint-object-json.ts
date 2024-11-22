import { PaintObjectFields } from '../../models/paint-object-fields';
import { Point, TBBox } from 'fabric';

export type PaintObjectJson = {
  type: string;
  layout: TBBox;
  vector: Point;
  angle: number;
  scaleX: number;
  scaleY: number;
  fields: Partial<PaintObjectFields>;
  extras?: any;
};
