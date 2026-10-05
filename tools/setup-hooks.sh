#!/bin/sh
# 저장소에 들어 있는 git 훅(.githooks/)을 켠다. 클론한 뒤 한 번만 실행하면 된다.
cd "$(git rev-parse --show-toplevel)" || exit 1
git config core.hooksPath .githooks
chmod +x .githooks/* tools/*.sh
echo "git 훅 사용: .githooks (커밋마다 ?v= 캐시 버전을 새로 찍는다)"
