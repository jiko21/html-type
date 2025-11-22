// HTML Type System - 型安全なHTML構造を定義

export type Text = string;

export type HTMLElement =
  | Text
  | {
      children: (HTMLElement | Text)[] | HTMLElement | Text;
    };

// HTML Brand Types
declare const htmlBrand: unique symbol;
export type Html<T extends HTMLElement[] | HTMLElement> = T extends HTMLElement[]
  ? {
      [htmlBrand]: 'html';
      children: T;
    }
  : T extends HTMLElement
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
export type Body<T extends HTMLElement[] | HTMLElement> = T extends Html<
  HTMLElement | HTMLElement[]
>
  ? never
  : T extends HTMLElement[]
    ? {
        [bodyBrand]: 'body';
        children: T;
      }
    : T extends HTMLElement
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

export type Div<T extends HTMLElement[] | HTMLElement> = T extends Html<HTMLElement | HTMLElement[]>
  ? InvalidDivContent<T>
  : T extends Body<HTMLElement | HTMLElement[]>
    ? InvalidDivContent<T>
    : T extends HTMLElement[]
      ? {
          [divBrand]: 'div';
          children: T;
        }
      : T extends HTMLElement
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

export type P<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidPContent<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidPContent<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidPContent<T>
      : T extends HTMLElement[]
        ? {
            [pBrand]: 'p';
            children: T;
          }
        : T extends HTMLElement
          ? {
              [pBrand]: 'p';
              children: T;
            }
          : never;

type InvalidH1Content<T> = {
  __error: `❌ <h1> cannot contain block elements. Only inline elements are allowed in <h1>.`;
  __invalidType: T;
};

declare const h1Brand: unique symbol;

export type H1<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidH1Content<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidH1Content<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidH1Content<T>
      : T extends P<HTMLElement | HTMLElement[]>
        ? InvalidH1Content<T>
        : T extends HTMLElement[]
          ? {
              [h1Brand]: 'h1';
              children: T;
            }
          : T extends HTMLElement
            ? {
                [h1Brand]: 'h1';
                children: T;
              }
            : never;

type InvalidH2Content<T> = {
  __error: `❌ <h2> cannot contain block elements. Only inline elements are allowed in <h2>.`;
  __invalidType: T;
};

declare const h2Brand: unique symbol;

export type H2<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidH2Content<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidH2Content<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidH2Content<T>
      : T extends P<HTMLElement | HTMLElement[]>
        ? InvalidH2Content<T>
        : T extends H1<HTMLElement | HTMLElement[]>
          ? InvalidH2Content<T>
          : T extends HTMLElement[]
            ? {
                [h2Brand]: 'h2';
                children: T;
              }
            : T extends HTMLElement
              ? {
                  [h2Brand]: 'h2';
                  children: T;
                }
              : never;

type InvalidH3Content<T> = {
  __error: `❌ <h3> cannot contain block elements. Only inline elements are allowed in <h3>.`;
  __invalidType: T;
};

declare const h3Brand: unique symbol;

export type H3<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidH3Content<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidH3Content<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidH3Content<T>
      : T extends P<HTMLElement | HTMLElement[]>
        ? InvalidH3Content<T>
        : T extends H1<HTMLElement | HTMLElement[]>
          ? InvalidH3Content<T>
          : T extends H2<HTMLElement | HTMLElement[]>
            ? InvalidH3Content<T>
            : T extends HTMLElement[]
              ? {
                  [h3Brand]: 'h3';
                  children: T;
                }
              : T extends HTMLElement
                ? {
                    [h3Brand]: 'h3';
                    children: T;
                  }
                : never;

type InvalidH4Content<T> = {
  __error: `❌ <h4> cannot contain block elements. Only inline elements are allowed in <h4>.`;
  __invalidType: T;
};

declare const h4Brand: unique symbol;

export type H4<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidH4Content<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidH4Content<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidH4Content<T>
      : T extends P<HTMLElement | HTMLElement[]>
        ? InvalidH4Content<T>
        : T extends H1<HTMLElement | HTMLElement[]>
          ? InvalidH4Content<T>
          : T extends H2<HTMLElement | HTMLElement[]>
            ? InvalidH4Content<T>
            : T extends H3<HTMLElement | HTMLElement[]>
              ? InvalidH4Content<T>
              : T extends HTMLElement[]
                ? {
                    [h4Brand]: 'h4';
                    children: T;
                  }
                : T extends HTMLElement
                  ? {
                      [h4Brand]: 'h4';
                      children: T;
                    }
                  : never;

type InvalidH5Content<T> = {
  __error: `❌ <h5> cannot contain block elements. Only inline elements are allowed in <h5>.`;
  __invalidType: T;
};

declare const h5Brand: unique symbol;

export type H5<T extends HTMLElement[] | HTMLElement> = T extends Div<HTMLElement | HTMLElement[]>
  ? InvalidH5Content<T>
  : T extends Html<HTMLElement | HTMLElement[]>
    ? InvalidH5Content<T>
    : T extends Body<HTMLElement | HTMLElement[]>
      ? InvalidH5Content<T>
      : T extends P<HTMLElement | HTMLElement[]>
        ? InvalidH5Content<T>
        : T extends H1<HTMLElement | HTMLElement[]>
          ? InvalidH5Content<T>
          : T extends H2<HTMLElement | HTMLElement[]>
            ? InvalidH5Content<T>
            : T extends H3<HTMLElement | HTMLElement[]>
              ? InvalidH5Content<T>
              : T extends H4<HTMLElement | HTMLElement[]>
                ? InvalidH5Content<T>
                : T extends HTMLElement[]
                  ? {
                      [h5Brand]: 'h5';
                      children: T;
                    }
                  : T extends HTMLElement
                    ? {
                        [h5Brand]: 'h5';
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
