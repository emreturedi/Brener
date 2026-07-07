@echo off
title Brener Group - Local Development Server
echo ==========================================================
echo Starting local web server on http://localhost:8000 ...
echo ==========================================================
echo.
start "" "http://localhost:8000/index_inline.html"
"C:\Program Files\DVDFab\StreamFab\PYthon37\python.exe" -m http.server 8000
pause
