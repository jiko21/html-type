// TypeScript AST Processing Utilities

import {createWriteStream} from 'node:fs';
import ts, {SyntaxKind} from 'typescript';
import {type HtmlJson, renderToStream} from './html';
import assert from "node:assert";

function parseAttributes(node: ts.Node | undefined): HtmlJson['attributes'] | undefined {
  if (node && ts.isTypeLiteralNode(node)) {
    return node.members.map((obj) => {
      if (
        ts.isPropertySignature(obj) &&
        ts.isIdentifier(obj.name) &&
        obj.type &&
        ts.isLiteralTypeNode(obj.type) &&
        ts.isStringLiteral(obj.type.literal)
      ) {
        return {key: obj.name.escapedText.toString(), value: obj.type.literal.text}
      } else {
        throw new Error('Invalid attribute was found in attributes.')
      }
    });
  }
  throw new Error('Unexpected error when parsing attributes.');
}

function parseChild(node: ts.Node, indent: number): HtmlJson | string {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return node.literal.text;
  } else if (ts.isTypeLiteralNode(node)) {
    return traverseNode(node, indent);
  } else if (ts.isTypeReferenceNode(node)) {
    // Handle Image and other void elements that may remain as TypeReference
    if (ts.isIdentifier(node.typeName)) {
      const tagName = node.typeName.escapedText.toString().toLowerCase();
      // Parse attributes from type arguments if present
      let attributes: { key: string, value: string }[] | undefined;
      if (node.typeArguments && node.typeArguments.length > 0) {
        attributes = parseAttributes(node.typeArguments[0]);
      }
      return {
        tag: tagName,
        children: [],
        attributes
      };
    }
    throw new Error(`unexpected type reference while parsing children elements.`)
  } else {
    console.log(node)
    throw new Error(`unexpected type while parsing children elements. node kind is ${SyntaxKind[node.kind]}`)
  }
}

function parseChildren(node: ts.Node, indent: number): HtmlJson['children'] {
  // node should be propertySignature
  assert(ts.isPropertySignature(node));
  // type is not undefined
  assert(node.type)
  if (ts.isTypeLiteralNode(node.type)) {
    return [traverseNode(node.type, indent + 2)];
  } else if (ts.isLiteralTypeNode(node.type) && ts.isStringLiteral(node.type.literal)) {
    return [node.type.literal.text];
  } else if (ts.isTupleTypeNode(node.type)) {
    return node.type.elements.map((val) => parseChild(val, indent));
  } else {
    throw new Error("Unexpected error when parsing children.");
  }
}

export function traverseNode(node: ts.Node, indent: number = 0): HtmlJson {
  if (ts.isTypeLiteralNode(node)) {
    let tag = '';
    let children: (HtmlJson | string)[] = [];
    let attributes: { key: string, value: string }[] | undefined;
    node.members.forEach(member => {
      if (ts.isPropertySignature(member) && ts.isComputedPropertyName(member.name) && ts.isIdentifier(member.name.expression)) {
        tag = member.name.expression.escapedText.toString().replace('Brand', '');
      } else if (ts.isPropertySignature(member) && ts.isIdentifier(member.name) && member.type) {
        switch (member.name.escapedText) {
          case 'attributes':
            attributes = parseAttributes(member.type);
            break;
          case 'children':
            children = parseChildren(member, indent + 2);
            break;
          default:
            throw new Error(`unexpected type ${member.type}`);
        }
      }
    });
    return {
      tag,
      children,
      attributes,
    };
  } else {
    throw new Error('Unexpected type');
  }
}

export function visit(node: ts.Node, checker: ts.TypeChecker, outPath: string) {
  if (ts.isSourceFile(node)) {
    ts.forEachChild(node, (childNode) => {
      visit(childNode, checker, outPath);
    });
  } else if (ts.isTypeAliasDeclaration(node)) {
    if (
      ts.isTypeReferenceNode(node.type) &&
      node.type.typeName &&
      ts.isIdentifier(node.type.typeName) &&
      (node.type.typeName.escapedText === 'Html' || node.type.typeName.escapedText === 'Body')
    ) {
      try {
        const type = checker.getTypeAtLocation(node);
        const typeNode = checker.typeToTypeNode(
          type,
          undefined,
          ts.NodeBuilderFlags.NoTruncation |
          ts.NodeBuilderFlags.NoTypeReduction
        );
        if (typeNode) {
          const result = traverseNode(typeNode, 0);
          const writeStream = createWriteStream(outPath, {flags: 'w'});
          renderToStream(result, writeStream);
          writeStream.end('\n');
        }
      } catch (error) {
        console.error(`Error processing type alias ${node.name.text}:`, error);
      }
    }
  }
}

export function createProgram(
  filePath: string
): { program: ts.Program; sourceFile: ts.SourceFile; checker: ts.TypeChecker } | null {
  try {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);

    if (!sourceFile) {
      return null;
    }

    const checker = program.getTypeChecker();

    return {
      program,
      sourceFile,
      checker,
    };
  } catch (error) {
    console.error('Error creating TypeScript program:', error);
    return null;
  }
}

export function processTypeScript(filePath: string, outPath: string): boolean {
  const result = createProgram(filePath);

  if (!result) {
    console.error(`Could not process TypeScript file: ${filePath}`);
    return false;
  }

  const {sourceFile, checker} = result;

  try {
    visit(sourceFile, checker, outPath);
    return true;
  } catch (error) {
    console.error('Error processing TypeScript AST:', error);
    return false;
  }
}
