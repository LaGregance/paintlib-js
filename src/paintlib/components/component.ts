export abstract class Component<K extends keyof HTMLElementTagNameMap> {
  public readonly element: HTMLElementTagNameMap[K];

  constructor(tagName: K) {
    this.element = document.createElement(tagName);
  }

  abstract init(): void;

  add(child: Component<any>) {
    this.element.appendChild(child.element);
    child.init();
  }
}
