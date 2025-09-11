// HTML Type System - 型安全なHTML構造を定義

export type Text = string;

export type HTMLNode =
  | Text
  | {
      children: (HTMLNode | Text)[] | HTMLNode | Text;
    };

// HTML Brand Types
declare const htmlBrand: unique symbol;
export type Html<T extends HTMLNode[] | HTMLNode> = T extends HTMLNode[]
  ? {
      [htmlBrand]: 'html';
      children: T;
    }
  : T extends HTMLNode
    ? {
        [htmlBrand]: 'html';
        children: T;
      }
    : T extends Text
      ? {
          [htmlBrand]: 'html';
          children: T;
        }
      : never;

declare const bodyBrand: unique symbol;
export type Body<T extends HTMLNode[] | HTMLNode> = T extends Html<HTMLNode | HTMLNode[]>
  ? never
  : T extends HTMLNode[]
    ? {
        [bodyBrand]: 'body';
        children: T;
      }
    : T extends HTMLNode
      ? {
          [bodyBrand]: 'body';
          children: T;
        }
      : never;

// エラー型定義
type InvalidDivContent<T> = {
  __error: `❌ <div> cannot contain <html> or <body> elements. Invalid HTML structure.`;
  __invalidType: T;
};

declare const divBrand: unique symbol;

export type Div<T extends HTMLNode[] | HTMLNode> = T extends Html<HTMLNode | HTMLNode[]>
  ? InvalidDivContent<T>
  : T extends Body<HTMLNode | HTMLNode[]>
    ? InvalidDivContent<T>
    : T extends HTMLNode[]
      ? {
          [divBrand]: 'div';
          children: T;
        }
      : T extends HTMLNode
        ? {
            [divBrand]: 'div';
            children: T;
          }
        : never;

type InvalidPContent<T> = {
  __error: `❌ <p> cannot contain block elements. Only inline elements are allowed in <p>.`;
  __invalidType: T;
};

declare const pBrand: unique symbol;
export type P<T extends HTMLNode[] | HTMLNode> = T extends Div<HTMLNode | HTMLNode[]>
  ? InvalidPContent<T>
  : T extends Html<HTMLNode | HTMLNode[]>
    ? InvalidPContent<T>
    : T extends Body<HTMLNode | HTMLNode[]>
      ? InvalidPContent<T>
      : T extends HTMLNode[]
        ? {
            [pBrand]: 'p';
            children: T;
          }
        : T extends HTMLNode
          ? {
              [pBrand]: 'p';
              children: T;
            }
          : never;

// HTML JSON構造体
export type HtmlJson = {
  tag: string;
  children: (HtmlJson | string)[];
};

// HTML レンダリング関数
export function renderToHtml(input: HtmlJson, indent: number = 0): string {
  const space = ' '.repeat(indent * 2);
  return `${space}<${input.tag}>
${input.children
  .map((item) => {
    if (typeof item === 'string') {
      return `${space}  ${item}`;
    } else {
      return renderToHtml(item, indent + 1);
    }
  })
  .join('\n')}
${space}</${input.tag}>`;
}

export function renderToStream(
  input: HtmlJson,
  writeStream: { write: (data: string) => void },
  indent: number = 0
) {
  const space = ' '.repeat(indent * 2);
  writeStream.write(`${space}<${input.tag}>\n`);
  input.children.forEach((item) => {
    if (typeof item === 'string') {
      writeStream.write(`${space}  ${item}\n`);
    } else {
      renderToStream(item, writeStream, indent + 1);
    }
  });
  writeStream.write(`${space}</${input.tag}>\n`);
}
