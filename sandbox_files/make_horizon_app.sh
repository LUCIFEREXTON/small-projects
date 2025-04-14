# !bin/bash

HOME=/home/bv-utkarsh

source_path="$HOME/blogvault"
destination_path="$HOME/horizon_app"
amoeba_path="$HOME/amoeba/sandbox_files"

copy_files() {
  file_path=$1
  mkdir -p "$destination_path/$(dirname "$file_path")"
  rm -rf "$destination_path/$file_path"
  cp -r "$source_path/$file_path" "$destination_path/$file_path"
}

copy_src_folders() {
  src_folders=(
    'apis'
    'constants'
    'middlewares'
    'redux'
    'shared'
    'pages/GlobalNoAccessErrorPage.js'
    'pages/NotFoundPage.js'
    'pages/Products'
  )
  src_path='app/javascript/horizon/src'

  for folder in "${src_folders[@]}"; do
    copy_files "$src_path/$folder"
  done
}

copy_tests_folders() {
  test_folders=(
    'apis'
    'App.js'
    'ErrorBoundary.js'
    'index.js'
    'shared'
    'pages/Product'
    'pages/generated_routes.js'
  )

  test_path='app/javascript/horizon/tests'

  for folder in "${test_folders[@]}"; do
    copy_files "$test_path/$folder"
  done
}

copy_from_amoeba() {
  cp "$amoeba_path/builder.js" "$destination_path/builder.js"
  cp "$amoeba_path/components.json" "$destination_path/components.json"
  cp "$amoeba_path/esbuild.config.js" "$destination_path/esbuild.config.js"
  cp "$amoeba_path/jsconfig.json" "$destination_path/jsconfig.json"
  cp "$amoeba_path/package.json" "$destination_path/package.json"
  cp "$amoeba_path/postcss.config.js" "$destination_path/postcss.config.js"
  cp "$amoeba_path/tailwind.config.js" "$destination_path/tailwind.config.js"
  cp "$amoeba_path/server.js" "$destination_path/server.js"
  cp "$amoeba_path/nodemon.json" "$destination_path/nodemon.json"

  cp "$amoeba_path/RenderRoutes.js" "$destination_path/app/javascript/horizon/tests/pages/RenderRoutes.js"
  cp "$amoeba_path/TestsPagesIndex.js" "$destination_path/app/javascript/horizon/tests/pages/index.js"
}

make_modifications() {
  find "$destination_path/app/javascript/horizon/tests/index.js" -exec sed -i '1i import { name as projectName } from "../../../../package.json"\nimport "@shadcn/index.css"' {} \;

  sed -i 's|basename='\''/tests'\''|basename={`/${projectName}/tests`}|g' "$destination_path/app/javascript/horizon/tests/index.js"
}

echo "Deleting existing destination path: $destination_path"
sudo rm -rf "$destination_path"

echo "Creating new destination path: $destination_path"
mkdir -p "$destination_path"

echo "Copying files from $source_path to $destination_path"
copy_src_folders
copy_tests_folders
copy_from_amoeba
make_modifications

echo "Switching to destination path: $destination_path"
cd "$destination_path"

source "$HOME/.nvm/nvm.sh"
nvm use 16

echo "Installing dependencies"
/usr/bin/yarn install

echo "Building the project"
sudo "$HOME/.nvm/versions/node/v16.20.2/bin/node" builder.js
