export enum Orientation {
  PORTRAIT = 1,
  LANDSCAPE = 2,
}

export abstract class OrientationUtil {
  static fromSize(width: number, height: number): Orientation {
    if (width > height) return Orientation.LANDSCAPE;
    else return Orientation.PORTRAIT;
  }
}
