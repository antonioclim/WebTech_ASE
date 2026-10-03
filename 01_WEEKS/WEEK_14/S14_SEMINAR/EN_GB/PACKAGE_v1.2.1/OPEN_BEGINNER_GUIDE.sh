#!/bin/sh
set -eu
kit_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
case "$(uname -s)" in Darwin) exec open "$kit_dir/S14_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html" ;; *) exec xdg-open "$kit_dir/S14_INTERACTIVE_ULTRA_BEGINNER_GUIDE_EN_GB_v1.2.1.html" ;; esac
