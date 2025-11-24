// HTML Type System - 型安全なHTML構造を定義

export type Text = string;

export type HTMLElement =
  | Text
  | {
      children: (HTMLElement | Text)[] | HTMLElement | Text;
      attributes?: Record<string, string | number | boolean>;
    };

// HTML Brand Types
declare const htmlBrand: unique symbol;
export type Html<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends HTMLElement[]
  ? {
      [htmlBrand]: 'html';
      children: T;
      attributes: A;
    }
  : T extends HTMLElement
    ? {
        [htmlBrand]: 'html';
        children: T;
        attributes: A;
      }
    : T extends Text
      ? {
          [htmlBrand]: 'html';
          children: T;
          attributes: A;
        }
      : never;

declare const bodyBrand: unique symbol;
export type Body<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Html<HTMLElement | HTMLElement[], A>
  ? never
  : T extends HTMLElement[]
    ? {
        [bodyBrand]: 'body';
        children: T;
        attributes: A;
      }
    : T extends HTMLElement
      ? {
          [bodyBrand]: 'body';
          children: T;
          attributes: A;
        }
      : never;

// エラー型定義
type InvalidDivContent<T> = {
  __error: `❌ <div> cannot contain <html> or <body> elements. Invalid HTML structure.`;
  __invalidType: T;
};

declare const divBrand: unique symbol;

export type Div<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Html<HTMLElement | HTMLElement[], any>
  ? InvalidDivContent<T>
  : T extends Body<HTMLElement | HTMLElement[], any>
    ? InvalidDivContent<T>
    : T extends HTMLElement[]
      ? {
          [divBrand]: 'div';
          children: T;
          attributes: A;
        }
      : T extends HTMLElement
        ? {
            [divBrand]: 'div';
            children: T;
            attributes: A;
          }
        : never;

type InvalidPContent<T> = {
  __error: `❌ <p> cannot contain block elements. Only inline elements are allowed in <p>.`;
  __invalidType: T;
};

declare const pBrand: unique symbol;

export type P<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidPContent<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidPContent<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidPContent<T>
      : T extends HTMLElement[]
        ? {
            [pBrand]: 'p';
            children: T;
            attributes: A;
          }
        : T extends HTMLElement
          ? {
              [pBrand]: 'p';
              children: T;
              attributes: A;
            }
          : never;

type InvalidH1Content<T> = {
  __error: `❌ <h1> cannot contain block elements. Only inline elements are allowed in <h1>.`;
  __invalidType: T;
};

declare const h1Brand: unique symbol;

export type H1<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidH1Content<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidH1Content<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidH1Content<T>
      : T extends P<HTMLElement | HTMLElement[], any>
        ? InvalidH1Content<T>
        : T extends HTMLElement[]
          ? {
              [h1Brand]: 'h1';
              children: T;
              attributes: A;
            }
          : T extends HTMLElement
            ? {
                [h1Brand]: 'h1';
                children: T;
                attributes: A;
              }
            : never;

type InvalidH2Content<T> = {
  __error: `❌ <h2> cannot contain block elements. Only inline elements are allowed in <h2>.`;
  __invalidType: T;
};

declare const h2Brand: unique symbol;

export type H2<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidH2Content<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidH2Content<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidH2Content<T>
      : T extends P<HTMLElement | HTMLElement[], any>
        ? InvalidH2Content<T>
        : T extends H1<HTMLElement | HTMLElement[], any>
          ? InvalidH2Content<T>
          : T extends HTMLElement[]
            ? {
                [h2Brand]: 'h2';
                children: T;
                attributes: A;
              }
            : T extends HTMLElement
              ? {
                  [h2Brand]: 'h2';
                  children: T;
                  attributes: A;
                }
              : never;

type InvalidH3Content<T> = {
  __error: `❌ <h3> cannot contain block elements. Only inline elements are allowed in <h3>.`;
  __invalidType: T;
};

declare const h3Brand: unique symbol;

export type H3<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidH3Content<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidH3Content<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidH3Content<T>
      : T extends P<HTMLElement | HTMLElement[], any>
        ? InvalidH3Content<T>
        : T extends H1<HTMLElement | HTMLElement[], any>
          ? InvalidH3Content<T>
          : T extends H2<HTMLElement | HTMLElement[], any>
            ? InvalidH3Content<T>
            : T extends HTMLElement[]
              ? {
                  [h3Brand]: 'h3';
                  children: T;
                  attributes: A;
                }
              : T extends HTMLElement
                ? {
                    [h3Brand]: 'h3';
                    children: T;
                    attributes: A;
                  }
                : never;

type InvalidH4Content<T> = {
  __error: `❌ <h4> cannot contain block elements. Only inline elements are allowed in <h4>.`;
  __invalidType: T;
};

declare const h4Brand: unique symbol;

export type H4<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidH4Content<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidH4Content<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidH4Content<T>
      : T extends P<HTMLElement | HTMLElement[], any>
        ? InvalidH4Content<T>
        : T extends H1<HTMLElement | HTMLElement[], any>
          ? InvalidH4Content<T>
          : T extends H2<HTMLElement | HTMLElement[], any>
            ? InvalidH4Content<T>
            : T extends H3<HTMLElement | HTMLElement[], any>
              ? InvalidH4Content<T>
              : T extends HTMLElement[]
                ? {
                    [h4Brand]: 'h4';
                    children: T;
                    attributes: A;
                  }
                : T extends HTMLElement
                  ? {
                      [h4Brand]: 'h4';
                      children: T;
                      attributes: A;
                    }
                  : never;

type InvalidH5Content<T> = {
  __error: `❌ <h5> cannot contain block elements. Only inline elements are allowed in <h5>.`;
  __invalidType: T;
};

declare const h5Brand: unique symbol;

export type H5<
  T extends HTMLElement[] | HTMLElement,
  A extends Record<string, string | number | boolean> = {}
> = T extends Div<HTMLElement | HTMLElement[], any>
  ? InvalidH5Content<T>
  : T extends Html<HTMLElement | HTMLElement[], any>
    ? InvalidH5Content<T>
    : T extends Body<HTMLElement | HTMLElement[], any>
      ? InvalidH5Content<T>
      : T extends P<HTMLElement | HTMLElement[], any>
        ? InvalidH5Content<T>
        : T extends H1<HTMLElement | HTMLElement[], any>
          ? InvalidH5Content<T>
          : T extends H2<HTMLElement | HTMLElement[], any>
            ? InvalidH5Content<T>
            : T extends H3<HTMLElement | HTMLElement[], any>
              ? InvalidH5Content<T>
              : T extends H4<HTMLElement | HTMLElement[], any>
                ? InvalidH5Content<T>
                : T extends HTMLElement[]
                  ? {
                      [h5Brand]: 'h5';
                      children: T;
                      attributes: A;
                    }
                  : T extends HTMLElement
                    ? {
                        [h5Brand]: 'h5';
                        children: T;
                        attributes: A;
                      }
                    : never;

// HTML JSON構造体
export type HtmlJson = {
  tag: string;
  children: (HtmlJson | string)[];
  attributes: {
    key: string;
    value: string;
  }[] | undefined;
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
  const attributes = input.attributes?.map((item) => `${item.key}="${item.value}"`).join(" ");
  writeStream.write(`${space}<${input.tag}${attributes ? ` ${attributes}` : ''}>\n`);
  input.children.forEach((item) => {
    if (typeof item === 'string') {
      writeStream.write(`${space}  ${item}\n`);
    } else {
      renderToStream(item, writeStream, indent + 1);
    }
  });
  writeStream.write(`${space}</${input.tag}>\n`);
}
