#!/bin/bash
set -euxo pipefail

# The versions in manifest.json->runtime.apiVersion and companion-module/base version must match
check_companion_base_versions() {
  local PACKAGE_FILE="package.json"
  local MANIFEST_FILE="companion/manifest.json"

  pkg_version=$(jq -r '.dependencies."@companion-module/base"' "$PACKAGE_FILE" | tr -d '^~')
  api_version=$(jq -r '.runtime.apiVersion' "$MANIFEST_FILE")

  if [ "$pkg_version" == "$api_version" ]; then
    echo "✅ Manifest version and companion/base version match: $pkg_version"
    return 0 # Success
  else
    echo "❌ Manifest version and companion/base version mismatch!" >&2
    echo "   package.json dependency: $pkg_version" >&2
    echo "   manifest.json apiVersion:  $api_version" >&2
    return 1 # Failure
  fi
}

check_module_versions() {
  local PACKAGE_FILE="package.json"
  local MANIFEST_FILE="companion/manifest.json"

  pkg_version=$(jq -r '.version' "$PACKAGE_FILE" | tr -d '^~')
  api_version=$(jq -r '.version' "$MANIFEST_FILE")

  if [ "$pkg_version" == "$api_version" ]; then
    echo "✅ Manifest module version and package.json version match: $pkg_version"
    return 0 # Success
  else
    echo "❌ Manifest module version and package.json version mismatch!" >&2
    echo "   package.json dependency: $pkg_version" >&2
    echo "   manifest.json apiVersion:  $api_version" >&2
    return 1 # Failure
  fi
}

check_companion_base_versions
check_module_versions

# Creates a .tgz file ready to be imported into Companion v4.
# This script should not be called directly. Instead, run it through:
#   > yarn run build:module

MODULE_NAME="companion-module-audinate-dante-ddm"

# Cleanup any previous runs
rm -rf $MODULE_NAME

# *** Manually check that the manifest.json 

# Create a new directory to form the output staging area
# 
# We can't use tar --transform since it is only in GNU Tar
# We can't use tar -C .. since it makes Bitbucket Pipelines sad
# 
# The layout of the module must be as follows
# $ tar -tf companion-module-audinate-dante-ddm.tgz | grep manifest.json
# companion-module-audinate-dante-ddm/companion/manifest.json
mkdir $MODULE_NAME

# Copy in *only* the output files we want to include in the module
# e.g. the original src and all the tsconfig.json etc are not required
cp -R \
	LICENSE \
	README.md \
	companion \
	dist \
	node_modules \
	$MODULE_NAME

tar -czf "$MODULE_NAME.tgz" $MODULE_NAME

# Cleanup after ourselves
rm -rf $MODULE_NAME
