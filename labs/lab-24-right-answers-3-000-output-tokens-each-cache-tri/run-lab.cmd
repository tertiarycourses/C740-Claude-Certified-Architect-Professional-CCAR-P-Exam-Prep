@echo off
rem Lab 24: runs the simulator lab live in this window (needs Node.js and ANTHROPIC_API_KEY in the repo-root .env)
cd /d "%~dp0..\.."
node docs\tools\test_lab.mjs 24
pause
