import { PaintLib } from '../paintlib';
import * as fabric from 'fabric';

export async function init(container: HTMLElement) {
  const paintlib = new PaintLib(container, {
    proactivelyShowOptions: false,
    // actions: new PaintActionBuilder().basics().objects().save().build(),
  });

  await paintlib.load({
    image: '/assets/dummy_hz.jpeg',
    imageSizeMode: 'viewport',
    onSave: () => {
      console.log(paintlib.saveState());
    },
  });
  (window as any).paintlib = paintlib;
  (window as any).fabric = fabric;
}

const container = document.getElementById('root');
if (container) {
  init(container);
}
