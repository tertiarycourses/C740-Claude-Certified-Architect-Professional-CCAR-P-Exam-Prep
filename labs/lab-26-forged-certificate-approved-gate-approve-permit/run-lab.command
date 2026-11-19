#!/bin/bash
# Lab 26: runs the simulator lab live in this terminal (needs Node.js and ANTHROPIC_API_KEY in the repo-root .env)
cd "$(dirname "$0")/../.." || exit 1
node docs/tools/test_lab.mjs 26
read -r -p "Press Enter to close this window" _
