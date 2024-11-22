import { PaintObjectJson } from './paint-object-json';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  image?: {
    angle: number;
  };
  objects: PaintObjectJson[];
};
