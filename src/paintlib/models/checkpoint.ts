import { Point, TBBox } from 'fabric';
import { PaintObjectOptions } from './paint-object-options';
import { GlobalTransformProps, PaintObjectTransformProps } from './global-transform-props';
import { PaintObject } from '../objects/abstract/paint-object';

export type PaintObjectCheckpoint = {
  object: PaintObject<any>;
  layout: TBBox;
  vector: Point;
  options: Partial<PaintObjectOptions>;
  transform: Partial<PaintObjectTransformProps>;
  extras?: any;
};

export type CanvasCheckpoint = {
  transform: Partial<GlobalTransformProps>;
  objects?: PaintObjectCheckpoint[];
  fullCanvas: boolean;
};

export type Checkpoint =
  | {
      type: 'canvas';
      checkpoint: CanvasCheckpoint;
    }
  | {
      type: 'object';
      checkpoint: PaintObjectCheckpoint;
    };
