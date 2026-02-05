import { readdir, mkdir, rename, stat } from 'fs/promises';
import { join, extname, basename } from 'path';

const targetDir = process.argv[2];

if (!targetDir) {
  console.error('> Укажите директорию');
  console.error('> Пример: group-files.ts ./input');
  process.exit(1);
}

async function run(dir: string) {
  const entries = await readdir(dir);
  const groups = new Map<string, string[]>();

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const entryStat = await stat(fullPath);

    if (!entryStat.isFile()) continue;

    const name = basename(entry, extname(entry));

    if (!groups.has(name)) {
      groups.set(name, []);
    }

    groups.get(name)!.push(entry);
  }

  for (const [name, files] of groups) {
    //if (files.length < 2) continue; // ← убери, если нужно группировать одиночные

    const folderPath = join(dir, name);
    await mkdir(folderPath, { recursive: true });

    for (const file of files) {
      const from = join(dir, file);
      const to = join(folderPath, file);

      await rename(from, to); // 🔥 перемещение
    }

    console.log(`📁 ${name} → ${files.length} файлов`);
  }

  console.log('✅ Готово');
}

run(targetDir).catch((err) => {
  console.error('Ошибка:', err);
  process.exit(1);
});
