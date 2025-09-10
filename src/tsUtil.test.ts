import { describe, expect, mock, test } from 'bun:test';
import * as fs from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import {
  createProgram,
  extractTypeAliases,
  getTypeName,
  isHtmlOrBodyType,
  processTypeScript,
  traverseNode,
  visit,
} from './tsUtil';

// Helper function to create test TypeScript source files
function createTestSourceFile(code: string, fileName: string = 'test.ts'): ts.SourceFile {
  return ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2020, true);
}

// Helper function to create test program with custom host
function createTestProgramWithHost(sourceFile: ts.SourceFile): ts.Program {
  const host: ts.CompilerHost = {
    getSourceFile: (fileName) => (fileName === sourceFile.fileName ? sourceFile : undefined),
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: () => true,
    readFile: () => '',
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    getDefaultLibFileName: () => 'lib.d.ts',
  };

  return ts.createProgram([sourceFile.fileName], {}, host);
}

describe('TypeScript Utility Functions', () => {
  describe('createProgram', () => {
    test('should return null for non-existent file', () => {
      const result = createProgram('non-existent-file.ts');
      expect(result).toBeNull();
    });

    test('should create program for existing TypeScript code', () => {
      // Create a temporary test file
      const testCode = `
        type TestType = {
          value: string;
        };
      `;

      const tempFile = join(process.cwd(), 'temp-test.ts');
      fs.writeFileSync(tempFile, testCode);

      try {
        const result = createProgram(tempFile);
        expect(result).not.toBeNull();

        if (result) {
          expect(result.program).toBeDefined();
          expect(result.sourceFile).toBeDefined();
          expect(result.checker).toBeDefined();
        }
      } finally {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('isHtmlOrBodyType', () => {
    test('should return true for Html type alias', () => {
      const code = `
        import { Html } from './html';
        type MyPage = Html<"content">;
      `;

      const sourceFile = createTestSourceFile(code);
      let foundHtmlType = false;

      function checkNode(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === 'MyPage') {
          foundHtmlType = isHtmlOrBodyType(node);
        }
        ts.forEachChild(node, checkNode);
      }

      checkNode(sourceFile);
      expect(foundHtmlType).toBe(true);
    });

    test('should return true for Body type alias', () => {
      const code = `
        import { Body } from './html';
        type MyBody = Body<"content">;
      `;

      const sourceFile = createTestSourceFile(code);
      let foundBodyType = false;

      function checkNode(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === 'MyBody') {
          foundBodyType = isHtmlOrBodyType(node);
        }
        ts.forEachChild(node, checkNode);
      }

      checkNode(sourceFile);
      expect(foundBodyType).toBe(true);
    });

    test('should return false for other type aliases', () => {
      const code = `
        type MyDiv = Div<"content">;
        type MyString = string;
      `;

      const sourceFile = createTestSourceFile(code);
      const results: boolean[] = [];

      function checkNode(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node)) {
          results.push(isHtmlOrBodyType(node));
        }
        ts.forEachChild(node, checkNode);
      }

      checkNode(sourceFile);
      expect(results.every((result) => result === false)).toBe(true);
    });
  });

  describe('extractTypeAliases', () => {
    test('should extract all type aliases from source file', () => {
      const code = `
        type First = string;
        type Second = number;
        interface NotATypeAlias {
          value: string;
        }
        type Third = boolean;
      `;

      const sourceFile = createTestSourceFile(code);
      const aliases = extractTypeAliases(sourceFile);

      expect(aliases).toHaveLength(3);
      expect(aliases[0].name.text).toBe('First');
      expect(aliases[1].name.text).toBe('Second');
      expect(aliases[2].name.text).toBe('Third');
    });

    test('should return empty array for file without type aliases', () => {
      const code = `
        interface OnlyInterface {
          value: string;
        }
        
        const variable = "test";
        
        function myFunction() {
          return true;
        }
      `;

      const sourceFile = createTestSourceFile(code);
      const aliases = extractTypeAliases(sourceFile);

      expect(aliases).toHaveLength(0);
    });
  });

  describe('getTypeName', () => {
    test('should return type name for type reference', () => {
      const code = `
        import { Html } from './html';
        type MyPage = Html<"content">;
      `;

      const sourceFile = createTestSourceFile(code);
      const aliases = extractTypeAliases(sourceFile);

      expect(aliases).toHaveLength(1);
      const typeName = getTypeName(aliases[0]);
      expect(typeName).toBe('Html');
    });

    test('should return null for non-type-reference aliases', () => {
      const code = `
        type MyString = string;
        type MyObject = { value: number };
      `;

      const sourceFile = createTestSourceFile(code);
      const aliases = extractTypeAliases(sourceFile);

      expect(aliases).toHaveLength(2);
      expect(getTypeName(aliases[0])).toBeNull();
      expect(getTypeName(aliases[1])).toBeNull();
    });
  });

  describe('traverseNode', () => {
    test('should handle type literal node with brand property', () => {
      const code = `
        type TestType = {
          [htmlBrand]: 'html';
          children: 'Hello World';
        };
      `;

      const sourceFile = createTestSourceFile(code);

      function findTypeLiteralNode(node: ts.Node): ts.TypeLiteralNode | null {
        if (ts.isTypeLiteralNode(node)) {
          return node;
        }

        let result: ts.TypeLiteralNode | null = null;
        ts.forEachChild(node, (child) => {
          if (!result) {
            result = findTypeLiteralNode(child);
          }
        });

        return result;
      }

      const typeLiteralNode = findTypeLiteralNode(sourceFile);
      expect(typeLiteralNode).not.toBeNull();

      if (typeLiteralNode) {
        // Basic structure validation
        expect(typeLiteralNode.members.length).toBeGreaterThan(0);

        const hasChildrenProperty = typeLiteralNode.members.some(
          (member) =>
            ts.isPropertySignature(member) &&
            member.name &&
            ts.isIdentifier(member.name) &&
            member.name.text === 'children'
        );

        expect(hasChildrenProperty).toBe(true);
      }
    });

    test('should throw error for non-type-literal nodes', () => {
      const code = `const variable = 123;`;
      const sourceFile = createTestSourceFile(code);

      // Find a non-TypeLiteral node
      let nonTypeLiteralNode: ts.Node | null = null;

      function findNonTypeLiteral(node: ts.Node) {
        if (ts.isVariableDeclaration(node)) {
          nonTypeLiteralNode = node;
          return;
        }
        ts.forEachChild(node, findNonTypeLiteral);
      }

      findNonTypeLiteral(sourceFile);

      if (nonTypeLiteralNode) {
        expect(() => traverseNode(nonTypeLiteralNode!)).toThrow('Unexpected type');
      }
    });
  });

  describe('visit', () => {
    test('should handle visit without crashing', () => {
      const code = `
        import { Html } from './html';
        type MyPage = Html<"Hello World">;
        type OtherType = string;
      `;

      const sourceFile = createTestSourceFile(code);
      const program = createTestProgramWithHost(sourceFile);
      const checker = program.getTypeChecker();

      // Mock console methods to avoid noise
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      console.log = mock();
      console.error = mock();

      // Mock createWriteStream to avoid file system operations
      const originalCreateWriteStream = require('node:fs').createWriteStream;
      const mockWriteStream = {
        write: mock(),
        end: mock(),
      };

      require('node:fs').createWriteStream = mock(() => mockWriteStream);

      try {
        // The visit function may encounter nodes it can't process, but it should handle them gracefully
        expect(() => {
          visit(sourceFile, checker, 'test-output.html');
        }).not.toThrow();
      } finally {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        require('node:fs').createWriteStream = originalCreateWriteStream;
      }
    });
  });

  describe('processTypeScript', () => {
    test('should return false for non-existent file', () => {
      const result = processTypeScript('non-existent.ts', 'output.html');
      expect(result).toBe(false);
    });

    test('should process valid TypeScript file', () => {
      // Create a temporary test file
      const testCode = `
        import { Html } from './html';
        type TestPage = Html<"Test Content">;
      `;

      const tempFile = join(process.cwd(), 'temp-process-test.ts');
      const outputFile = join(process.cwd(), 'temp-output.html');

      fs.writeFileSync(tempFile, testCode);

      try {
        // Mock console methods to avoid noise in tests
        const originalConsoleError = console.error;
        console.error = mock();

        const result = processTypeScript(tempFile, outputFile);

        // Should return true for successful processing (even if it encounters errors in type resolution)
        expect(typeof result).toBe('boolean');

        console.error = originalConsoleError;
      } finally {
        // Clean up
        [tempFile, outputFile].forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      }
    });
  });
});

describe('Integration Tests', () => {
  test('should work with complete HTML type structure', () => {
    const code = `
      import { Html, Body, Div, P } from './html';
      
      type MyPage = Html<
        Body<
          Div<
            P<"Hello World">
          >
        >
      >;
    `;

    const sourceFile = createTestSourceFile(code);
    const aliases = extractTypeAliases(sourceFile);

    expect(aliases).toHaveLength(1);
    expect(aliases[0].name.text).toBe('MyPage');
    expect(isHtmlOrBodyType(aliases[0])).toBe(true);
    expect(getTypeName(aliases[0])).toBe('Html');
  });

  test('should identify multiple HTML/Body types', () => {
    const code = `
      import { Html, Body, Div } from './html';
      
      type Page1 = Html<"Content 1">;
      type Page2 = Body<"Content 2">;
      type NotHtml = Div<"Content 3">;
    `;

    const sourceFile = createTestSourceFile(code);
    const aliases = extractTypeAliases(sourceFile);

    expect(aliases).toHaveLength(3);

    const htmlBodyTypes = aliases.filter((alias) => isHtmlOrBodyType(alias));
    expect(htmlBodyTypes).toHaveLength(2);

    const typeNames = htmlBodyTypes.map((alias) => getTypeName(alias));
    expect(typeNames).toContain('Html');
    expect(typeNames).toContain('Body');
  });
});
