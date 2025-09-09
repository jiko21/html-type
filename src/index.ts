import ts from 'typescript';
import {createWriteStream, write, WriteStream} from 'node:fs';
export type Text = string;

export type HTMLElement = Text | {
  children: (HTMLElement | Text)[] | HTMLElement | Text;
};

declare const htmlBrand: unique symbol;
export type Html<T extends HTMLElement[] | HTMLElement> =
  T extends HTMLElement[] ? {
    [htmlBrand]: 'html';
    children: T;
  } : T extends HTMLElement ? {
    [htmlBrand]: 'html';
    children: T;
  } : T extends Text ? {
    [htmlBrand]: 'html';
    children: T;
  } : never;

declare const bodyBrand: unique symbol;
export type Body<T extends HTMLElement[] | HTMLElement> = T extends Html<HTMLElement | HTMLElement[]>
  ? never : T extends HTMLElement[] ? {
    [bodyBrand]: 'body';
    children: T;
  } : T extends HTMLElement ? {
    [bodyBrand]: 'body';
    children: T;
  } : never;
type InvalidDivContent<T> = {
  __error: `❌ <div> cannot contain <html> or <body> elements. Invalid HTML structure.`;
  __invalidType: T;
};
declare const pBrand: unique symbol;

export type Div<T extends HTMLElement[] | HTMLElement> =
  T extends Html<HTMLElement | HTMLElement[]> ? InvalidDivContent<T> :
    T extends Body<HTMLElement | HTMLElement[]> ? InvalidDivContent<T> :
      T extends HTMLElement[] ? {
        children: T;
      } : T extends HTMLElement ? {
        children: T;
      } : never;

type InvalidPContent<T> = {
  __error: `❌ <p> cannot contain block elements. Only inline elements are allowed in <p>.`;
  __invalidType: T;
};

export type P<T extends HTMLElement[] | HTMLElement> =
  T extends Div<HTMLElement | HTMLElement[]> ? InvalidPContent<T> :
    T extends Html<HTMLElement | HTMLElement[]> ? InvalidPContent<T> :
      T extends Body<HTMLElement | HTMLElement[]> ? InvalidPContent<T> :
        T extends HTMLElement[] ? {
          [pBrand]: 'p';
          children: T;
        } : T extends HTMLElement ? {
          [pBrand]: 'p';
          children: T;
        } : never;


const targetPath = process.argv[2];
const outPath = process.argv[3] || './index.html';
const program = ts.createProgram([targetPath], {});
const sourceFile = program.getSourceFile(targetPath)!;
const checker = program.getTypeChecker();

type HtmlJson = {
  tag: string;
  children: (HtmlJson | string)[];
}

function traverseNode(node: ts.Node, indent: number = 0): HtmlJson {
  const spaces = ' '.repeat(indent);
  if (ts.isTypeLiteralNode(node)) {
    let tag = ''
    let children: (HtmlJson | string)[] = [];
    node.members.forEach((member) => {
      if (ts.isIdentifierOrThisTypeNode(member.name!) && ts.isPropertySignature(member)) {
        console.log(member.name.escapedText);
        if (member.type && ts.isLiteralTypeNode(member.type) && ts.isStringLiteral(member.type.literal)) {
          children = [member.type.literal.text]
        } else if (member.type && ts.isPropertySignature(member)) {
          if (ts.isTupleTypeNode(member.type)) {
            // loop
            children = member.type.elements.filter((type) =>
              type
            ).map((type) => traverseNode(type, indent + 2));
          } else if (ts.isTypeLiteralNode(member.type)) {
            children = [traverseNode(member.type, indent + 2)];
          }
        }
      }
      else if (ts.isComputedPropertyName(member.name!) && ts.isIdentifier(member.name.expression) && member.name.expression.escapedText) {
        tag = member.name.expression.escapedText.replace('Brand', '');
      }
    })
    return {
      tag,
      children,
    }
  } else {
    throw new Error('Unexpected type');
  }
}

function renderToHtml(input: HtmlJson, indent: number = 0): string {
  const space = ' '.repeat(indent * 2);
  return `${space}<${input.tag}>
${input.children.map((item) => {
  if (typeof item === 'string') {
    return `${space}  ${item}`;
  } else {
    return renderToHtml(item, indent + 1);
  }
}).join('\n')}
${space}</${input.tag}>`
}

function renderToStream(input: HtmlJson, writeStream: WriteStream, indent: number = 0) {
    const space = ' '.repeat(indent * 2);
    writeStream.write(`${space}<${input.tag}>\n`);
    input.children.map((item) => {
        if (typeof item === 'string') {
            writeStream.write(`${space}  ${item}\n`);
        } else {
            renderToStream(item, writeStream, indent + 1);
        }
    })
    writeStream.write(`${space}</${input.tag}>\n`);
}

function visit(node: ts.Node) {
  if (ts.isTypeAliasDeclaration(node)) {
    const inferredType = checker.typeToString(
      checker.getTypeAtLocation(node),
      node,
      ts.TypeFormatFlags.InTypeAlias
    );
    if (ts.isTypeReferenceNode(node.type) && node.type.typeName &&
      ts.isIdentifier(node.type.typeName) &&
      (node.type.typeName.escapedText === 'Html' || node.type.typeName.escapedText === 'Body')) {
      const type = checker.getTypeAtLocation(node);
      const stringJSON = checker.typeToTypeNode(type ,undefined, undefined);
      const result = traverseNode(stringJSON!);
      const writeStream = createWriteStream(outPath, { flags: 'w'});
      renderToStream(result, writeStream);
      writeStream.end('\n');
    }
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
