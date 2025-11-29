const NON_CHILDREN_TAGS = ['img', 'link'];
export type HtmlJson = {
  tag: string;
  children: (HtmlJson | string)[] | undefined;
  attributes:
    | {
        key: string;
        value: string;
      }[]
    | undefined;
};

export function renderToStream(
  input: HtmlJson,
  writeStream: { write: (data: string) => void },
  indent: number = 0
) {
  const space = ' '.repeat(indent * 2);
  const attributes = input.attributes?.map((item) => `${item.key}="${item.value}"`).join(' ');
  if (input.children) {
    writeStream.write(`${space}<${input.tag}${attributes ? ` ${attributes}` : ''}>\n`);
    input.children?.forEach((item) => {
      if (typeof item === 'string') {
        writeStream.write(`${space}  ${item}\n`);
      } else {
        renderToStream(item, writeStream, indent + 1);
      }
    });
    writeStream.write(`${space}</${input.tag}>\n`);
  } else {
    writeStream.write(`${space}<${input.tag}${attributes ? ` ${attributes}` : ''} />\n`);
  }
}
