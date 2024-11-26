import { PaintObjectJson } from './paint-object-json';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  globalScale: number;
  format?: 'png' | 'jpeg';
  image?: {
    angle: number;
  };
  objects: PaintObjectJson[];
};
