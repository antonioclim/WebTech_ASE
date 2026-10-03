#!/bin/sh
KIT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd) || exit 1
open "$KIT_DIR/00_START_HERE/index.html"
