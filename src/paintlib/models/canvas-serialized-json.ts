import { PaintObjectJson } from './paint-object-json';
import { GlobalTransformProps } from './global-transform-props';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  format?: 'png' | 'jpeg';
  transform: GlobalTransformProps;
  objects: PaintObjectJson[];
};
