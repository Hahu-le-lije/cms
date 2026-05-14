#!/usr/bin/env bash

set -euo pipefail

node20_dir="$HOME/.nvm/versions/node/v20.20.2"

if [ -x "$node20_dir/bin/node" ]; then
  export PATH="$node20_dir/bin:$PATH"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use 20.20.2 >/dev/null
fi

exec next dev "$@"