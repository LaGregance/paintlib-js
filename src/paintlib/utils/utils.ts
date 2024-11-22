export const xor = (a: boolean, b: boolean) => {
  return (a || b) && !(a && b);
};

export const px = (value: number) => {
  return `${value}px`;
};

export const setCssProperty = (style: any, field: string, property: string, defaultValue: any) => {
  let rawValue: any;

  if (style[field]) {
    rawValue = style[field];
  } else {
    style[field] = defaultValue;
    rawValue = defaultValue;
  }

  if (typeof rawValue === 'number') {
    document.documentElement.style.setProperty(property, rawValue + 'px');
  } else if (typeof rawValue === 'string') {
    document.documentElement.style.setProperty(property, rawValue);
  } else {
    throw new Error(`Invalid style property value: ${rawValue}`);
  }
};
