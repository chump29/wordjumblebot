#!/usr/bin/env -S bash -e

_red="\e[4;91m"
_green="\e[4;92m"
_yellow="\e[4;93m"
_nc="\e[0m"
_title=✨
_task="🛠️ "
_lint=🔍
_done="✔️ "

clear

echo -e "${_title} ${_red}WordJumbleBot${_nc} ${_title}\n"

echo -e "${_task} ${_yellow}Installing dependencies${_nc}:\n"
bun install --frozen-lockfile

echo -e "\n${_lint} ${_yellow}Linting${_nc}:\n"
bun run lint

./docker.sh

echo -e "\n${_done} ${_green}Done${_nc}!\n"
