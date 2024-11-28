import { TBBox } from 'fabric';

export type GlobalTransformProps = {
  scale: number;
  rotation: number;
  crop?: TBBox;
};

export type PaintObjectTransformProps = {
  scaleX: number;
  scaleY: number;
  rotation: number;
};
