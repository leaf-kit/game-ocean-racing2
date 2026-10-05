#!/bin/sh
# 캐시 무효화 버전 찍기.
#
# index.html 과 src/ 의 JS·CSS 가 서로를 부르는 상대 경로(./ ../)마다 ?v=<버전> 을 붙인다.
# 이미 붙어 있으면 새 버전으로 바꾸고, 빠진 곳에는 새로 붙인다.
# 브라우저와 GitHub Pages(CDN)는 주소가 같으면 예전 파일을 그대로 쓰므로,
# 배포할 때마다 주소를 바꿔 줘야 새 코드를 받아 간다.
#
#   tools/stamp-version.sh            → 지금 시각(UTC)으로 찍는다 (예: 20261005143012)
#   tools/stamp-version.sh 20261005a  → 지정한 값으로 찍는다
#   tools/stamp-version.sh --staged   → 커밋에 올라간(staged) 내용과 작업 파일 둘 다에 찍는다 (pre-commit 훅이 쓴다)
set -e
cd "$(git rev-parse --show-toplevel)"

STAGED=0
if [ "$1" = "--staged" ]; then STAGED=1; shift; fi
VER="${1:-$(date -u +%Y%m%d%H%M%S)}"
export VER

# 상대 경로로 부르는 .js/.css/.mjs 뒤의 ?v= 를 바꾸거나 새로 붙인다. CDN 주소나 'three/...' 같은 이름은 건드리지 않는다.
stamp() { perl -pe 's{(["'"'"'])(\.{1,2}/[^"'"'"'?\s]+\.(?:m?js|css))(?:\?v=[\w.-]*)?\1}{$1$2?v=$ENV{VER}$1}g'; }

FILES=$(git ls-files index.html 'src/*.js' 'src/*.mjs' 'src/*.css')

for f in $FILES; do
  [ -f "$f" ] || continue
  # 작업 파일
  stamp < "$f" > "$f.stamp.tmp" && { cmp -s "$f" "$f.stamp.tmp" && rm "$f.stamp.tmp" || mv "$f.stamp.tmp" "$f"; }
  # 커밋할 내용(index). 작업 파일 전체를 add 하지 않으므로, 일부만 stage 한 변경이 섞여 들어가지 않는다.
  if [ "$STAGED" = 1 ] && git cat-file -e ":$f" 2>/dev/null; then
    mode=$(git ls-files -s -- "$f" | cut -d' ' -f1)
    old=$(git rev-parse ":$f")
    new=$(git show ":$f" | stamp | git hash-object -w --stdin)
    [ "$old" = "$new" ] || git update-index --cacheinfo "$mode,$new,$f"
  fi
done
echo "캐시 버전: ?v=$VER"
