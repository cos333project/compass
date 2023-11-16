#!/bin/bash

for file in $(git diff --cached --name-only); do
  if [[ $file == compass/backend/* ]]; then
    ruff --fix "$file"
    ruff-format "$file"
  fi
done