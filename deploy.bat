@echo off
REM Script automático para preparar o repositório Git
REM Execute este arquivo abrindo Command Prompt e digitando: deploy.bat

echo.
echo ========================================
echo  SEBO - Deploy Helper Script
echo ========================================
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git não está instalado!
    echo Baixe em: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [OK] Git encontrado
echo.

REM Verificar se já é um repositório git
if exist .git (
    echo [INFO] Repositório Git já existe
) else (
    echo [INICIANDO] Repositório Git...
    git init
    echo [OK] Git inicializado
)

echo.
echo ========================================
echo  Configuração de Usuário
echo ========================================
echo.

REM Pedir nome do usuário
set /p git_name="Digite seu nome para Git: "
set /p git_email="Digite seu email para Git: "

git config user.name "%git_name%"
git config user.email "%git_email%"

echo [OK] Usuário configurado: %git_name% <%git_email%>
echo.

REM Mostrar status
echo ========================================
echo  Status do Repositório
echo ========================================
echo.
git status
echo.

REM Perguntar se quer fazer commit
set /p make_commit="Deseja fazer commit agora? (s/n): "

if /i "%make_commit%"=="s" (
    echo.
    set /p commit_msg="Digite a mensagem do commit: "
    git add .
    git commit -m "%commit_msg%"
    echo [OK] Commit realizado
) else (
    echo [PULANDO] Commit não realizado
)

echo.
echo ========================================
echo  Próximos Passos
echo ========================================
echo.
echo 1. Crie um repositório em: https://github.com/new
echo 2. Copie o comando para repositório existente
echo 3. Cole aqui no terminal
echo.
echo Ou execute estes comandos manualmente:
echo   git branch -M main
echo   git remote add origin https://github.com/SEU-USUARIO/sebo-literario.git
echo   git push -u origin main
echo.

set /p add_remote="Deseja adicionar o repositório remoto agora? (s/n): "

if /i "%add_remote%"=="s" (
    set /p remote_url="Cole a URL do repositório (https://github.com/...): "
    git branch -M main
    git remote add origin %remote_url%
    git push -u origin main
    echo [OK] Repositório conectado e código enviado!
) else (
    echo [INFO] Você pode fazer isso depois manualmente
)

echo.
echo ========================================
echo  ✅ Pronto para Deploy!
echo ========================================
echo.
echo Próximos passos:
echo 1. Acesse: https://app.netlify.com
echo 2. Clique em "Add new site"
echo 3. Selecione seu repositório
echo 4. Configure e deploy!
echo.
pause
