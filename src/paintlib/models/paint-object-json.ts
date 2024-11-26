import { PaintObjectOptions } from './paint-object-options';
import { TBBox } from 'fabric';
import { TransformProps } from './transform-props';

export type PaintObjectJson = {
  type: string;
  layout: TBBox;
  vector: { x: number; y: number };
  options: Partial<PaintObjectOptions>;
  transform: Partial<TransformProps>;
  extras?: any;
};
