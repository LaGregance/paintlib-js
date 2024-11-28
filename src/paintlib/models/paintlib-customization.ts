import { PaintActionType } from '../config/paint-action-type';

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
   * When true the clear action only trigger the onCancel callback.
   * When false, cancel action restart the edition from the beginning (onCancel callback is still fire in every case).
   */
  cancelOnlyCustom?: boolean;

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
