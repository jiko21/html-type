// TypeScript AST Processing Utilities

import { createWriteStream } from 'node:fs';
import ts from 'typescript';
import { type HtmlJson, renderToStream } from './html';

export function traverseNode(node: ts.Node, indent: number = 0): HtmlJson {
  const _spaces = ' '.repeat(indent);
  if (ts.isTypeLiteralNode(node)) {
    let tag = '';
    let children: (HtmlJson | string)[] = [];
    node.members.forEach((member) => {
      if (
        member.name &&
        ts.isIdentifierOrThisTypeNode(member.name) &&
        ts.isPropertySignature(member)
      ) {
        if (
          member.type &&
          ts.isLiteralTypeNode(member.type) &&
          ts.isStringLiteral(member.type.literal)
        ) {
          children = [member.type.literal.text];
        } else if (member.type && ts.isPropertySignature(member)) {
          if (ts.isTupleTypeNode(member.type)) {
            // loop
            children = member.type.elements
              .filter((type) => type)
              .map((type) => traverseNode(type, indent + 2));
          } else if (ts.isTypeLiteralNode(member.type)) {
            children = [traverseNode(member.type, indent + 2)];
          }
        }
      } else if (
        member.name &&
        ts.isComputedPropertyName(member.name) &&
        ts.isIdentifier(member.name.expression) &&
        member.name.expression.escapedText
      ) {
        tag = member.name.expression.escapedText.replace('Brand', '');
      }
    });
    return {
      tag,
      children,
    };
  } else {
    throw new Error('Unexpected type');
  }
}

export function visit(node: ts.Node, checker: ts.TypeChecker, outPath: string) {
  if (ts.isTypeAliasDeclaration(node)) {
    const _inferredType = checker.typeToString(
      checker.getTypeAtLocation(node),
      node,
      ts.TypeFormatFlags.InTypeAlias
    );
    if (
      ts.isTypeReferenceNode(node.type) &&
      node.type.typeName &&
      ts.isIdentifier(node.type.typeName) &&
      (node.type.typeName.escapedText === 'Html' || node.type.typeName.escapedText === 'Body')
    ) {
      try {
        const type = checker.getTypeAtLocation(node);
        const stringJSON = checker.typeToTypeNode(
          type,
          undefined,
          ts.NodeBuilderFlags.InTypeAlias | ts.NodeBuilderFlags.NoTruncation
        );
        if (stringJSON) {
          const result = traverseNode(stringJSON, 0);
          const writeStream = createWriteStream(outPath, { flags: 'w' });
          renderToStream(result, writeStream);
          writeStream.end('\n');
        }
      } catch (error) {
        console.error(`Error processing type alias ${node.name.text}:`, error);
      }
    }
  }
  ts.forEachChild(node, (childNode) => visit(childNode, checker, outPath));
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

  const { sourceFile, checker } = result;

  try {
    visit(sourceFile, checker, outPath);
    return true;
  } catch (error) {
    console.error('Error processing TypeScript AST:', error);
    return false;
  }
}

// TypeScript AST Helper Functions
export function isHtmlOrBodyType(node: ts.Node): boolean {
  if (ts.isTypeAliasDeclaration(node)) {
    if (
      ts.isTypeReferenceNode(node.type) &&
      node.type.typeName &&
      ts.isIdentifier(node.type.typeName)
    ) {
      const typeName = node.type.typeName.escapedText;
      return typeName === 'Html' || typeName === 'Body';
    }
  }
  return false;
}

export function extractTypeAliases(node: ts.Node): ts.TypeAliasDeclaration[] {
  const aliases: ts.TypeAliasDeclaration[] = [];

  function collectAliases(n: ts.Node) {
    if (ts.isTypeAliasDeclaration(n)) {
      aliases.push(n);
    }
    ts.forEachChild(n, collectAliases);
  }

  collectAliases(node);
  return aliases;
}

export function getTypeName(typeAlias: ts.TypeAliasDeclaration): string | null {
  if (
    ts.isTypeReferenceNode(typeAlias.type) &&
    typeAlias.type.typeName &&
    ts.isIdentifier(typeAlias.type.typeName)
  ) {
    return typeAlias.type.typeName.escapedText.toString();
  }
  return null;
}
