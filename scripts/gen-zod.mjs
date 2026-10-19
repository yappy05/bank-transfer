/**
 * Generate zod schemas (with paired `z.infer` types) from the TypeScript
 * files emitted by ts-proto into the proto/generate directory.
 *
 * Run: npx tsx scripts/gen-zod.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { generate } from 'ts-to-zod';

const DIR = 'libs/my-library/src/contracts/proto/generate';

const SCHEMA_SUFFIX = 'Schema'; // VerifyJwtRequest -> VerifyJwtRequestSchema
const TYPE_SUFFIX = 'Zod'; //      VerifyJwtRequestSchema -> VerifyJwtRequestZod

// Only skip the service/plumbing types that ts-proto emits alongside messages.
const SKIP_TYPE = /(Client|Controller|Methods|Service|Package|Name)$/;

const files = readdirSync(DIR).filter((file) => {
  if (!file.endsWith('.ts')) return false;
  if (file.startsWith('zod-')) return false;
  if (file.includes('.zod.')) return false;
  if (file === 'index.ts') return false;
  return true;
});

if (files.length === 0) {
  console.log(`No .ts files to process in ${DIR}`);
  process.exit(0);
}

for (const file of files) {
  const base = basename(file, extname(file));
  const inputPath = join(DIR, file);
  const outputPath = join(DIR, `zod-${base}.ts`);

  const sourceText = readFileSync(inputPath, 'utf8');

  const { zodSchemas } = generate({
    sourceText,
    nameFilter: (name) => !SKIP_TYPE.test(name),
    getSchemaName: (name) => `${name}${SCHEMA_SUFFIX}`,
    skipValidation: true,
  });

  if (!zodSchemas) {
    console.warn(`⚠ ${file}: nothing to generate, skipped`);
    continue;
  }

  const inferredTypes = buildInferTypes(
    zodSchemas,
    SCHEMA_SUFFIX,
    TYPE_SUFFIX,
  );

  const output = [
    zodSchemas.replace(/\s+$/, ''),
    '',
    inferredTypes,
    '',
  ].join('\n');

  writeFileSync(outputPath, output);
  console.log(`✔ ${file} → zod-${base}.ts`);
}

/**
 * For every `export const xxxSchema` produced by ts-to-zod, append a matching
 * `export type XxxZod = z.infer<typeof xxxSchema>;` to the same file.
 */
function buildInferTypes(text, schemaSuffix, typeSuffix) {
  const seen = new Set();
  const lines = [];
  const regex = /export const (\w+)\s*[:=]/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const schemaName = match[1];
    if (seen.has(schemaName)) continue;
    if (!schemaName.endsWith(schemaSuffix)) continue;
    seen.add(schemaName);

    const base = schemaName.slice(0, -schemaSuffix.length);
    const typeName = `${base.replace(/^./, (char) => char.toUpperCase())}${typeSuffix}`;

    lines.push(`export type ${typeName} = z.infer<typeof ${schemaName}>;`);
  }

  return lines.join('\n');
}
