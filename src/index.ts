// Re-export types and functions from modularized files
export * from './html';
export * from './tsUtil';

import { processTypeScript } from './tsUtil';

export function main() {
  const targetPath = process.argv[2];
  const outPath = process.argv[3] || './index.html';
  
  if (!targetPath) {
    console.error('Usage: node index.js <input.ts> [output.html]');
    process.exit(1);
  }
  
  const success = processTypeScript(targetPath, outPath);
  
  if (success) {
    console.log(`✅ Successfully processed ${targetPath} → ${outPath}`);
  } else {
    console.error(`❌ Failed to process ${targetPath}`);
    process.exit(1);
  }
}

// メイン実行部分
if (require.main === module) {
  main();
}
