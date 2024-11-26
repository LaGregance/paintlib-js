import { PaintObjectFields } from './paint-object-fields';
import { TBBox } from 'fabric';

export type PaintObjectJson = {
  type: string;
  layout: TBBox;
  vector: { x: number; y: number };
  angle: number;
  scaleX: number;
  scaleY: number;
  fields: Partial<PaintObjectFields>;
  extras?: any;
};
