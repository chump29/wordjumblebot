#!/usr/bin/env -S bash -e

strip() {
  echo "${1:1:-1}"
}

clear

if [ ! -d ../node_modules ]; then
  echo -e "🛠️ Installing packages\n"
  bun install
  echo
fi

echo -e "📌 Variables:\n"

_biome=$(jq '.peerDependencies."@biomejs/biome"' ../node_modules/@postfmly/config/package.json)
_biome=$(strip "$_biome")
export _biome
echo -e " • _biome: $_biome"

_bun=$(jq .engines.bun ../package.json)
_bun=$(strip "$_bun")
export _bun
echo -e " • _bun: $_bun"

_discord=$(jq '.dependencies."discord.js"' ../package.json)
_discord=$(strip "$_discord")
export _discord
echo -e " • _discord: $_discord"

_drizzle=$(jq '.dependencies."drizzle-orm"' ../package.json)
_drizzle=$(strip "$_drizzle")
_drizzle=${_drizzle/-/--}
export _drizzle
echo -e " • _drizzle: ${_drizzle/--/-}"

_sqlite=3.49.2
export _sqlite
echo -e " • _sqlite: $_sqlite"

echo -e "\n🛠️  Creating README.md..."

envsubst < README.template.md > ../README.md

echo -e "\n✔️  Done!\n"
