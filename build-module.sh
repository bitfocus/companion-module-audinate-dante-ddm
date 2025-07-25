#!/bin/bash
set -euxo pipefail

check_module_versions() {
  local PACKAGE_FILE="package.json"
  local MANIFEST_FILE="companion/manifest.json"

  pkg_version=$(jq -r '.version' "$PACKAGE_FILE" | tr -d '^~')
  api_version=$(jq -r '.version' "$MANIFEST_FILE")

  if [ "$pkg_version" == "$api_version" ]; then
    echo "✅ Manifest module version and package.json version match: $pkg_version"
    return 0
  else
    echo "❌ Manifest module version and package.json version mismatch!" >&2
    echo "   package.json dependency: $pkg_version" >&2
    echo "   manifest.json apiVersion:  $api_version" >&2
    return 1
  fi
}

check_module_versions

# Creates a .tgz file ready to be imported into Companion v4.
# This script should not be called directly. Instead, run it through:
#   > yarn run build:module

MODULE_NAME="companion-module-audinate-dante-ddm"

# Cleanup any previous runs
rm -rf $MODULE_NAME

mkdir $MODULE_NAME

cp -R \
	LICENSE \
	README.md \
	companion \
	dist \
	node_modules \
	$MODULE_NAME

tar -czf "$MODULE_NAME.tgz" $MODULE_NAME

rm -rf $MODULE_NAME
