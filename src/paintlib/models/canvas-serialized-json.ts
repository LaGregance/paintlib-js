import { PaintObjectJson } from './paint-object-json';
import { GlobalTransformProps } from './global-transform-props';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  format?: 'png' | 'jpeg';
  transform: Omit<GlobalTransformProps, 'scale'>;
  objects: PaintObjectJson[];
};
