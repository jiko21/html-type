export type HtmlJson = {
  tag: string;
  children: (HtmlJson | string)[];
  attributes: {
    key: string;
    value: string;
  }[] | undefined;
};

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