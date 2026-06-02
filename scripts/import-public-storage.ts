/**
 * One-shot file migration: walks public/storage/images and uploads each file to GridFS,
 * updating any matching Image document's `link` to /api/files/<gridfsId>.
 *
 * Usage: tsx scripts/import-public-storage.ts [--dir=public/storage/images] [--dry-run]
 */
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { connectDB } from '../src/lib/db';
import { Image } from '../src/models/Image';
import { saveImage } from '../src/lib/uploads';

interface Args { dir: string; dryRun: boolean }
function parseArgs(): Args {
  const out: Args = { dir: 'public/storage/images', dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--dir=')) out.dir = arg.slice('--dir='.length);
    else if (arg === '--dry-run') out.dryRun = true;
  }
  return out;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function guessContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function main() {
  const args = parseArgs();
  await connectDB();

  let count = 0;
  let skipped = 0;
  for await (const filePath of walk(args.dir)) {
    const filename = filePath.split(/[\\/]/).pop()!;
    const sizeOk = (await stat(filePath)).size > 0;
    if (!sizeOk) { skipped += 1; continue; }

    const matching = await Image.find({ link: { $regex: filename + '$' } });
    if (matching.length === 0) { skipped += 1; continue; }

    if (args.dryRun) {
      console.log('would upload', filename, '→', matching.length, 'image rows');
      continue;
    }

    const buf = await readFile(filePath);
    const saved = await saveImage(buf, filename, guessContentType(filename));
    for (const m of matching) {
      m.link = saved.url;
      m.gridfsId = saved.id;
      await m.save();
    }
    count += 1;
    if (count % 10 === 0) console.log(`uploaded ${count}…`);
  }
  console.log(`done. uploaded=${count} skipped=${skipped}`);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
