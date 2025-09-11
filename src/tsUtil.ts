// TypeScript AST Processing Utilities

import { createWriteStream } from 'node:fs';
import ts from 'typescript';
import { type HtmlJson, renderToStream } from './html';

export function traverseNode(
  node: ts.Node,
  checker?: ts.TypeChecker,
  sourceNode?: ts.Node,
  indent: number = 0
): HtmlJson {
  if (ts.isTypeLiteralNode(node)) {
    let tag = '';
    let children: (HtmlJson | string)[] = [];

    node.members.forEach((member) => {
      // rest elementsをスキップ
      if (member.name && ts.isIdentifier(member.name) && member.name.escapedText === '...') {
        return;
      }
      if (
        member.name &&
        ts.isComputedPropertyName(member.name) &&
        ts.isIdentifier(member.name.expression) &&
        member.name.expression.escapedText
      ) {
        tag = member.name.expression.escapedText.replace('Brand', '');
      } else if (
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
              .map((type) => traverseNode(type, checker, sourceNode, indent + 2))
              .filter((child) => child.tag !== ''); // 空のタグを除外

            // typeToTypeNodeを使用して型チェッカーに直接解決を依頼
            if (checker && sourceNode && ts.isTypeAliasDeclaration(sourceNode)) {
              console.log(
                `🔍 CALLED FROM: tag="${tag}", children.length=${children.length}, indent=${indent}`
              );
              console.log(
                `   Current context members: ${member.type && ts.isTupleTypeNode(member.type) ? member.type.elements.length : 'N/A'}`
              );

              try {
                // 元のtype aliasの型を取得
                const aliasType = checker.getTypeAtLocation(sourceNode);
                console.log(`   Alias type: ${checker.typeToString(aliasType)}`);

                // 型チェッカーに「この型を完全に解決した型ノード」を生成してもらう
                const fullyResolvedTypeNode = checker.typeToTypeNode(
                  aliasType,
                  sourceNode,
                  ts.NodeBuilderFlags.InTypeAlias | ts.NodeBuilderFlags.NoTruncation
                );

                if (fullyResolvedTypeNode && fullyResolvedTypeNode !== node) {
                  console.log(
                    `   ✅ Found fully resolved type node: ${ts.SyntaxKind[fullyResolvedTypeNode.kind]}`
                  );

                  // 解決された型ノードが TypeLiteral の場合、直接 traverse
                  if (ts.isTypeLiteralNode(fullyResolvedTypeNode)) {
                    console.log(
                      `   Processing fully resolved TypeLiteral with ${fullyResolvedTypeNode.members.length} members`
                    );

                    const fullyResolvedResult = traverseNode(
                      fullyResolvedTypeNode,
                      undefined,
                      undefined,
                      indent
                    ); // 無限ループを避けるため checker を渡さない
                    console.log(
                      `   Resolved result: tag="${fullyResolvedResult.tag}", children.length=${fullyResolvedResult.children.length}`
                    );

                    // 現在のコンテキストに適した子要素のみを抽出
                    const extractRelevantChildren = (
                      resolved: HtmlJson,
                      currentTag: string
                    ): HtmlJson[] => {
                      const relevantChildren: HtmlJson[] = [];

                      const findMatchingLevel = (node: HtmlJson): void => {
                        if (typeof node !== 'object') return;

                        // 現在のタグと一致する階層を見つけて、その子要素を取得
                        if (node.tag === currentTag && Array.isArray(node.children)) {
                          for (const child of node.children) {
                            if (typeof child === 'object' && child.tag) {
                              relevantChildren.push(child);
                            }
                          }
                        } else if (Array.isArray(node.children)) {
                          // 再帰的に探索
                          for (const child of node.children) {
                            if (typeof child === 'object') {
                              findMatchingLevel(child);
                            }
                          }
                        }
                      };

                      findMatchingLevel(resolved);
                      return relevantChildren;
                    };

                    // 現在のコンテキストに基づいて適切なタグを決定
                    // tag が空の場合は、インデントレベルから推測
                    let contextTag = tag;
                    if (!contextTag) {
                      // インデントレベルから階層を推定
                      if (indent === 4) {
                        contextTag = 'div'; // divレベルでの処理
                      } else if (indent === 2) {
                        contextTag = 'body'; // bodyレベルでの処理
                      } else {
                        contextTag = 'body'; // デフォルト
                      }
                    }
                    console.log(`   Looking for children of: "${contextTag}" (indent=${indent})`);

                    const relevantChildren = extractRelevantChildren(
                      fullyResolvedResult,
                      contextTag
                    );
                    console.log(
                      `   Found ${relevantChildren.length} relevant children for "${contextTag}"`
                    );

                    // 関連する子要素から、まだ存在しないもののみを追加
                    for (const relevantChild of relevantChildren) {
                      const isDuplicate = children.some(
                        (child) =>
                          typeof child === 'object' &&
                          child.tag === relevantChild.tag &&
                          JSON.stringify(child.children) === JSON.stringify(relevantChild.children)
                      );

                      if (!isDuplicate) {
                        console.log(
                          `   ➕ Adding context-specific missing element: ${relevantChild.tag}`,
                          relevantChild.children
                        );
                        children.push(relevantChild);
                      } else {
                        console.log(
                          `   ❌ Context-specific duplicate detected: ${relevantChild.tag}`
                        );
                      }
                    }
                  }
                } else {
                  console.log(`   ❌ No resolved type node or same as input`);
                }
              } catch (e) {
                console.log('   ❌ Type resolution failed:', e);
              }
            }
          } else if (ts.isTypeLiteralNode(member.type)) {
            children = [traverseNode(member.type, checker, sourceNode, indent + 2)];
          }
        }
      }
    });

    return {
      tag,
      children,
    };
  } else if (ts.isTypeReferenceNode(node)) {
    // P<"text"> のようなTypeReferenceの処理
    if (node.typeName && ts.isIdentifier(node.typeName)) {
      const typeName = node.typeName.escapedText.toString().toLowerCase();

      if (node.typeArguments && node.typeArguments.length > 0) {
        const firstArg = node.typeArguments[0];
        if (ts.isLiteralTypeNode(firstArg) && ts.isStringLiteral(firstArg.literal)) {
          return {
            tag: typeName,
            children: [firstArg.literal.text],
          };
        }
        // 引数が複雑な型の場合は再帰的に処理
        else {
          return {
            tag: typeName,
            children: [traverseNode(firstArg, checker, sourceNode, indent + 2)],
          };
        }
      }
    }
    return { tag: '', children: [] };
  } else if (ts.isTupleTypeNode(node)) {
    // TupleTypeの処理 - 配列として展開
    const elements = node.elements
      .filter((type) => type)
      .map((type) => traverseNode(type, checker, sourceNode, indent + 2))
      .filter((child) => child.tag !== '');

    // Tupleは通常コンテナなので、最初の要素を返すか、適切なラップを行う
    if (elements.length === 1) {
      return elements[0];
    } else if (elements.length > 1) {
      // 複数要素の場合は、適切なコンテナで包む（contextに依存）
      return {
        tag: 'fragment', // or determine from context
        children: elements,
      };
    }
    return { tag: '', children: [] };
  } else {
    throw new Error(`Unexpected type: ${ts.SyntaxKind[node.kind]}`);
  }
}

export function visit(node: ts.Node, checker: ts.TypeChecker, outPath: string) {
  if (
    ts.isTypeAliasDeclaration(node) &&
    ts.isTypeReferenceNode(node.type) &&
    node.type.typeName &&
    ts.isIdentifier(node.type.typeName)
  ) {
    try {
      const type = checker.getTypeAtLocation(node);
      const typeNode = checker.typeToTypeNode(type, undefined, undefined);
      if (typeNode) {
        const result = traverseNode(typeNode, checker, node);
        const writeStream = createWriteStream(outPath, { flags: 'w' });
        console.log(JSON.stringify(result, null, 2));
        renderToStream(result, writeStream);
        writeStream.end('\n');
      }
    } catch (error) {
      console.error(`Error processing type alias ${node.name.text}:`, error);
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
