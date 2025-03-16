const fs = require('fs');

// Получаем текущую версию
const manifest = require('./manifest.json');
const [major, minor, patch] = manifest.version.split('.').map(Number);

// Получаем тип обновления из аргумента
const releaseType = process.argv[2] || 'patch';

// Вычисляем новую версию
let newVersion;
switch(releaseType.toLowerCase()) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

// Обновляем manifest
manifest.version = newVersion;
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

// Создаем тег
const { execSync } = require('child_process');
execSync(`git tag v${newVersion}`);

console.log(`
  🚀 Версия обновлена:
  Старая: ${manifest.version}
  Новая: ${newVersion}
  Тип: ${releaseType.toUpperCase()}
`);