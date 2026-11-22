@echo off
title SPACE GRAVEYARD - Local Server Launcher
echo ========================================================
echo        SPACE GRAVEYARD // NASA SPACE APPS CHALLENGE
echo ========================================================
echo.
echo Starting local development server...
echo.
set PATH=C:\Program Files\nodejs;%PATH%
start "" http://127.0.0.1:5173
npm run dev -- --host 127.0.0.1
pause
