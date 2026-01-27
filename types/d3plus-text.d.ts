declare module 'd3plus-text' {
  export class TextBox {
    constructor();
    data(data: Array<{ text: string; [key: string]: any }>): this;
    select(selector: SVGElement): this;
    fontResize(resize: boolean): this;
    fontSize(size: number): this;
    fontMin(size: number): this;
    fontMax(size: number): this;
    fontWeight(weight: number | string): this;
    width(width: number): this;
    height(height: number): this;
    x(x: (d: { text: string; [key: string]: any }) => number): this;
    y(y: (d: { text: string; [key: string]: any }) => number): this;
    verticalAlign(align: string): this;
    textAnchor(anchor: string): this;
    fontColor(color: string | ((d: { text: string; [key: string]: any }) => string)): this;
    render(): void;
  }
}
