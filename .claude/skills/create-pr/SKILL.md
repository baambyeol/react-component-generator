---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 Pull Request를 만든다. 프로젝트가 한국 프로젝트면 한국어 템플릿, 해외 오픈소스 프로젝트면 영문 템플릿(references/ 폴더의 언어별 템플릿)으로 본문을 작성하고 gh CLI로 생성한다. "PR 만들어줘", "PR 올려줘", "풀리퀘스트 생성", "create a PR", "open a pull request", "작업 끝났으니 PR로 올려" 같은 요청이나, 브랜치 작업을 마치고 리뷰를 받으려는 맥락에서 반드시 이 스킬을 사용한다. 커밋은 하지 않는다(commit 스킬 담당).
context: fork
agent: general-purpose
allowed-tools: Bash(git *), Bash(gh *), Bash(bun *), Read, Grep, Glob
---

# create-pr

브랜치의 변경 전체를 읽고, 프로젝트의 언어 관례에 맞는 템플릿으로 본문을 채워 PR을 만든다. 사용자가 PR 생성을 요청한 것 자체가 승인이므로 확인을 되묻지 않고 끝까지 진행한다.

이 스킬은 `context: fork`로 실행되어 서브 에이전트(`agent: general-purpose`)가 PR 생성까지 전부 수행한다. diff와 로그를 읽는 데 쓴 긴 탐색 내용이 메인 대화에 쌓이지 않도록 분리하기 위해서다. 메인 대화의 맥락을 볼 수 없다는 전제로, 아래 절차에서 필요한 정보를 직접 수집하고, 마지막에 PR URL과 핵심 요약만 돌려준다.

## 절차

### 1. 상태 확인

```bash
git status --short
git branch --show-current
git remote -v
gh auth status
```

- 커밋되지 않은 변경이 있으면 PR에 포함되지 않는다는 점을 최종 보고에 적는다. 직접 커밋하지 않는다(커밋 단위 판단은 commit 스킬의 역할이다).
- `gh` 인증이 없거나 `origin` 원격이 없으면 중단하고 필요한 조치(`gh auth login`, 저장소 생성)를 알린다. 사용자가 `! gh auth login`으로 직접 실행할 수 있다.
- 현재 브랜치가 기본 브랜치(main/master)면 PR을 만들 수 없다. 변경 내용에 맞는 이름으로 새 브랜치를 만들고(`feat/...`, `fix/...`) 이어서 진행한다. 로컬 기본 브랜치를 되돌려야 하는 상황이면 직접 건드리지 말고 사용자에게 알린다.

### 2. 기준 브랜치와 변경 범위 파악

```bash
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
git fetch origin
git log --oneline origin/<base>..HEAD
git diff origin/<base>...HEAD --stat
git diff origin/<base>...HEAD
```

- 변경 범위는 마지막 커밋이 아니라 기준 브랜치와의 차이 전체다. PR 본문은 리뷰어가 보게 될 diff 전체를 설명해야 하기 때문이다.
- 커밋이 없으면(`origin/<base>..HEAD`가 비어 있음) 그렇게 알리고 끝낸다.
- diff가 매우 크면 `--stat`으로 구조를 먼저 잡고 핵심 파일만 읽는다.
- 같은 브랜치의 열린 PR이 이미 있는지 확인한다: `gh pr list --head <branch> --state open`. 있으면 새로 만들지 않고 그 URL을 알린다.

### 3. 템플릿 언어 선택

한국 프로젝트인지 해외 오픈소스인지에 따라 템플릿 파일 하나를 고른다.

| 판단 | 템플릿 파일 |
|---|---|
| 한국 프로젝트 | `references/pr-template.ko.md` |
| 해외 오픈소스 프로젝트 | `references/pr-template.en.md` |

 리뷰어가 읽는 언어와 맞아야 PR이 실제로 읽히기 때문이다. 아래 신호를 위에서부터 보고, 처음 확실한 결론이 나오면 멈춘다.

1. **프로젝트가 명시한 규칙**: `AGENTS.md`/`CLAUDE.md`/`CONTRIBUTING.md`에 언어·PR 규칙이 있으면 그대로 따른다.
2. **기존 PR**: `gh pr list --state all --limit 5`의 제목·본문 언어.
3. **커밋 메시지**: `git log -20 --format=%s`의 언어.
4. **README와 소스 주석/UI 문자열**의 언어.
5. **저장소 맥락**: 해외 오픈소스는 보통 영문 README, 외부 기여자, 공개 `LICENSE`/`CODE_OF_CONDUCT`가 있다. 한국 프로젝트는 한국어 README·커밋·주석이 섞여 있다.

신호가 엇갈리면 **PR을 읽을 사람**이 누구인지를 우선한다. 그래도 결정이 안 되면 한국어 템플릿을 쓰고 최종 보고에 "언어를 추정했다"고 적는다. 잘못 골랐을 때 사용자가 한 줄로 바꿀 수 있게 하기 위해서다.

### 4. 본문 작성

선택한 템플릿 파일 하나만 읽어서 채운다(다른 언어 파일은 읽지 않는다).

- 제목은 한 줄, 70자 이내. 프로젝트가 커밋 컨벤션(`feat|fix|refactor|chore: 요약`)을 쓰면 PR 제목도 같은 형식을 따른다. 커밋이 하나면 그 메시지를 기반으로 하고, 여러 개면 전체를 아우르는 한 줄을 쓴다.
- "무엇을 바꿨는지"는 diff로 알 수 있으니 짧게, "왜 바꿨는지"와 리뷰어가 주의할 점에 분량을 쓴다.
- 확인하지 않은 것을 확인했다고 쓰지 않는다. 테스트 항목은 실제로 실행한 것만 체크한다. 프로젝트 `AGENTS.md`에 완료 전 실행할 명령(테스트·린트·빌드)이 있으면 실행해서 결과를 반영한다.
- 해당 없는 섹션은 비워두지 말고 삭제한다. 빈 섹션은 리뷰어에게 소음이다.
- 관련 이슈가 브랜치명·커밋에서 드러나면 `Closes #N`을 적는다. 추측으로 이슈 번호를 만들지 않는다.
- 시스템/하네스가 PR 본문 끝에 붙이라고 지정한 attribution이 있으면 그대로 붙인다.
- 비밀값(`.env` 내용, 키, 토큰)이 diff에 보이면 PR을 만들지 말고 사용자에게 알린다. 한번 푸시된 비밀값은 회수할 수 없다.

### 5. 푸시와 PR 생성

```bash
git push -u origin <branch>
gh pr create --base <base> --head <branch> --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)"
```

- 푸시는 현재 브랜치만 한다. 기준 브랜치로 직접 푸시하거나 `--force`를 쓰지 않는다.
- 사용자가 draft를 요청하면 `--draft`를 붙인다. 기본은 일반 PR이다.
- 푸시/생성이 거부되면(권한, 보호 브랜치, 포크 필요) 우회하지 말고 에러 원인과 다음 조치를 알린다.

### 6. 최종 보고

메인 대화로 돌려줄 것은 짧게 한정한다.

- PR URL
- 사용한 템플릿 언어와 그 근거 한 줄(추정이었다면 명시)
- PR에 포함되지 않은 것(미커밋 변경)이나 실행하지 못한 검증이 있으면 그 내용
