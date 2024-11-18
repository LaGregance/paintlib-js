import { Object, Textbox } from 'fabric';

export const setFabricField = (obj: Object, field: string, value: any) => {
  if (obj instanceof Textbox && field === 'stroke') {
    field = 'fill';
  } else if (obj instanceof Textbox && ['strokeWidth', 'fill'].includes(field)) {
    return;
  }
  obj.set(field, value);
};
