import { PaintObjectJson } from './paint-object-json';
import { TransformProps } from './transform-props';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  format?: 'png' | 'jpeg';
  transform: TransformProps;
  objects: PaintObjectJson[];
};
