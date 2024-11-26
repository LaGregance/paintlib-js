import { PaintObjectJson } from './paint-object-json';

export type CanvasSerializedJson = {
  width: number;
  height: number;
  globalScale: number;
  image?: {
    angle: number;
  };
  objects: PaintObjectJson[];
};
