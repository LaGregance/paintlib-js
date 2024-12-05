import { PaintActionType } from './paint-action-type';

export type PaintlibCustomization = {
  /**
   * Define available colors in color picker
   */
  palette?: string[];

  /**
   * Define available tickness in picker
   */
  tickness?: number[];

  /**
   * Define available actions. Pro tips: use PaintActionBuilder to build the array.
   *
   * Default: All
   */
  actions?: PaintActionType[];

  /**
   * When false, the options bar (for color, tickness picker) is always visible
   */
  proactivelyShowOptions?: boolean;

  /**
   * Customize the style of the UI
   */
  style?: {
    menuColor?: string;
    iconColor?: string;
    backgroundColor?: string;
    buttonSize?: number;
    iconSize?: number;
    buttonGap?: number;
    groupGap?: number;
  };
};
