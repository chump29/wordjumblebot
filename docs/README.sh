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

echo -e "📌 Packages:\n"

_biome=$(jq '.peerDependencies."@biomejs/biome"' ../node_modules/@postfmly/config/package.json)
_biome=$(strip "$_biome")
export _biome
echo -e " • @biomejs/biome: $_biome"

_version=$(bun --version)
bun pm pkg set packageManager="bun@$_version" engines.bun="~$_version" > /dev/null 2>&1
_bun=$(jq .engines.bun ../package.json)
_bun=$(strip "$_bun")
export _bun
echo -e " • Bun: $_bun"

_discord=$(jq '.dependencies."discord.js"' ../package.json)
_discord=$(strip "$_discord")
export _discord
echo -e " • discord.js: $_discord"

_drizzle=$(jq '.dependencies."drizzle-orm"' ../package.json)
_drizzle=$(strip "$_drizzle")
_drizzle=${_drizzle/-/--}
export _drizzle
echo -e " • drizzle-orm: ${_drizzle/--/-}"

_name=$(jq -r .name ../package.json)
_sqlite=$(docker exec "$_name" apk info sqlite | head -n 1 | cut -d " " -f 1)
_sqlite=${_sqlite:7:-3}
export _sqlite
echo -e " • SQLite: $_sqlite"

if [ ! -f "../coverage/lcov.info" ]; then
  bun run test > /dev/null 2>&1
fi
_coverage=$(bun run lcov-total ../coverage/lcov.info)
export _coverage
echo -e "\n☂️  Coverage: $_coverage%"

echo -e "\n🛠️  Creating README.md..."

envsubst < README.template.md > ../README.md

echo -e "\n✔️  Done!\n"
