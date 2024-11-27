import { PaintObjectOptions } from './paint-object-options';
import { TBBox } from 'fabric';
import { PaintObjectTransformProps } from './global-transform-props';

export type PaintObjectJson = {
  type: string;
  layout: TBBox;
  vector: { x: number; y: number };
  options: Partial<PaintObjectOptions>;
  transform: Partial<PaintObjectTransformProps>;
  extras?: any;
};
