@echo off
title Rebuilding SPACE_GRAVEYARD.html...
echo ========================================================
echo   REBUILDING STANDALONE SPACE_GRAVEYARD.html
echo ========================================================
echo.
echo Compiling source code and packaging into single file...
echo.
set PATH=C:\Program Files\nodejs;%PATH%
call npm run build
if %ERRORLEVEL% EQU 0 (
    copy /Y "dist\index.html" "SPACE_GRAVEYARD.html" >nul
    echo.
    echo ========================================================
    echo   SUCCESS! SPACE_GRAVEYARD.html has been updated!
    echo ========================================================
    echo.
) else (
    echo.
    echo [ERROR] Build failed. Please check your source code for errors.
)
pause
