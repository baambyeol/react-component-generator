# PR 본문 템플릿

프로젝트 성격에 따라 둘 중 하나만 사용한다. 선택 기준은 SKILL.md의 "템플릿 언어 선택"을 따른다.
`<...>`는 채워 넣을 자리이고, 해당 없는 섹션은 통째로 삭제한다. 안내 문구는 본문에 남기지 않는다.

---

## 한국어 템플릿 (한국 프로젝트)

```markdown
## 개요

<이 PR이 무엇을 하는지 1~3문장>

## 변경 배경

<왜 필요한 변경인지. 문제 상황, 요구사항, 관련 이슈>

Closes #<이슈 번호>

## 주요 변경 사항

- <변경 1>
- <변경 2>

## 테스트

- [ ] <실행한 테스트/검증 방법과 결과>
- [ ] <수동 확인 시나리오>

## 리뷰 포인트

<리뷰어가 특히 봐줬으면 하는 부분, 트레이드오프, 알려진 한계>

## 스크린샷

<UI 변경이 있을 때만>
```

---

## English Template (overseas open-source projects)

```markdown
## Summary

<What this PR does, in 1-3 sentences>

## Motivation

<Why this change is needed: the problem, the requirement, or the linked issue>

Closes #<issue number>

## Changes

- <Change 1>
- <Change 2>

## Testing

- [ ] <Tests/checks you ran, and their results>
- [ ] <Manual verification steps>

## Notes for Reviewers

<Areas that need careful review, trade-offs, known limitations>

## Screenshots

<Only if there are UI changes>
```

---

## 작성 규칙 / Writing rules

- 테스트 체크박스는 실제로 실행하고 통과한 것만 체크한다. / Check a box only for checks you actually ran and that passed.
- 추측으로 이슈 번호나 결과를 쓰지 않는다. / Never invent issue numbers or results.
- Breaking change가 있으면 "변경 배경" 또는 "Motivation" 아래에 별도 문단으로 명시한다. / Call out breaking changes in their own paragraph under Motivation.
