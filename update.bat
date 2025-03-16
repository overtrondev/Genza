@echo off
chcp 65001 >nul
title Обновление Genza
color 0A

:menu
cls
echo =====================================
echo         Обновление версии
echo =====================================
echo 1. Новая функция (feat) → minor
echo 2. Исправление (fix) → patch
echo 3. Крупное изменение (breaking) → major
echo 4. Пропустить
echo =====================================
set /p choice=Выберите тип [1-4]: 

if %choice% == 1 (
  set "type=minor"
  set "prefix=feat"
)
if %choice% == 2 (
  set "type=patch"
  set "prefix=fix"
)
if %choice% == 3 (
  set "type=major"
  set "prefix=refactor!"
)
if %choice% == 4 (
  echo Обновление пропущено
  pause
  exit /b
)

set /p message=Описание: 
set "commit_msg=%prefix%: %message%"

echo Обновление версии...
node autoversion.js %type%

echo Создание коммита...
git add .
git commit -m "%commit_msg%"

echo Создание тега...
for /f "tokens=*" %%v in ('node -e "console.log(require('./manifest.json').version)"') do set new_version=%%v
git tag v%new_version%

echo Отправка изменений...
git push origin main
git push --tags

echo =====================================
echo ✅ Версия обновлена до v%new_version%
echo =====================================
pause