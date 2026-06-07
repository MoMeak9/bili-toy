# Local Audio Lab Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the approved release-readiness gaps for Local Audio Lab by documenting P0 manual QA, adding the P1 first-editor keyboard hint and MP3 export note, updating browser/permission documentation, and verifying the release gate.

**Architecture:** Keep production code changes small and localized to existing UI state owners: `src/app/App.tsx` owns entry-to-editor Toast behavior, `src/components/dialogs/ExportDialog.tsx` owns export copy, and `README.md` owns public compatibility guidance. Manual release evidence lives under `docs/superpowers/qa/` so P0 browser/download checks can be filled without changing application code.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Radix Dialog/Toast, Tailwind CSS, Tone.js, wavesurfer.js, lamejs.

---

## Scope

This plan implements the approved **P0 发布阻断** documentation/verification workflow and the selected **P1 发布前建议** items:

- P0 manual QA checklist for microphone allow/deny, WAV/MP3 playable downloads, export failure recovery, and mobile core loop.
- P1 first editor keyboard Toast.
- P1 README browser compatibility, microphone permission, recording format, and MP3 lazy-loading notes.
- P1 manual QA matrix document.
- P1 keyboard path regression verification.

Phase 3 remains backlog only. Do not implement P2 or Phase 3 items in this plan.

## Current Workspace Note

At plan-writing time, `master` contains uncommitted source changes in:

- `src/audio/toneEngine.ts`
- `src/components/recording/RecordingPanel.tsx`
- `src/components/waveform/WaveformEditor.tsx`

Treat those as existing user/workspace changes. Do not revert them. During execution, inspect the live files before editing and stage only the files touched by the current task.

## File Structure

- Create: `docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md`
  - Manual QA matrix and release gate evidence for P0 and keyboard regression.
- Modify: `src/app/App.tsx`
  - Show the first-editor keyboard Toast once per browser session after upload, recording, or sample enters the editor.
- Modify: `src/components/dialogs/ExportDialog.tsx`
  - Add short MP3-first-export local encoder copy when the selected export format is MP3.
- Modify: `README.md`
  - Add recommended browsers, microphone permission privacy notes, recording MIME/format caveat, and MP3 first-export lazy-load note.
- No change: Phase 3 backlog specs.

---

### Task 1: Manual QA Matrix Document

**Files:**
- Create: `docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md`

- [ ] **Step 1: Create the QA directory**

Run:

```bash
mkdir -p docs/superpowers/qa
```

Expected: command exits with status `0`.

- [ ] **Step 2: Add the manual QA matrix**

Create `docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md` with this exact content:

```markdown
# Local Audio Lab Release Readiness Manual QA

- Date: 2026-06-07
- Scope: MVP + Phase 2 release readiness
- Source spec: `docs/superpowers/specs/2026-06-07-local-audio-lab-requirements-completion-todo.md`
- Status: In progress until every P0 row has evidence

## How To Run

1. Start the app with `npm run dev`.
2. Open the app in the target browser.
3. Prefer real Chrome or Edge for microphone permission checks.
4. Use the built-in sample for export checks when microphone access is not available.
5. Record exact browser, OS, viewport/device, result, and notes in the matrix below.

## P0 Release Gate

| Area | Browser / Device | Steps | Expected Result | Result | Evidence / Notes |
| --- | --- | --- | --- | --- | --- |
| Microphone allow path | Chrome desktop | Click `开始录音`, allow microphone, record at least 3 seconds, stop recording. | App enters editor; waveform renders; playback works; presets, analysis, WAV export, and MP3 export are reachable. | Pending |  |
| Microphone deny path | Chrome desktop | Reset site microphone permission, click `开始录音`, deny permission. | Error text is understandable; app does not white-screen; user can cancel/return; repeating the flow behaves predictably. | Pending |  |
| WAV playable download | Chrome desktop | Open sample, choose a preset, open export dialog, export WAV, play the downloaded file locally. | Downloaded `.wav` is not 0 bytes, plays in local player/browser, duration is close to source, selected preset is audible. | Pending |  |
| MP3 playable download | Chrome desktop | Open sample, choose MP3 in export dialog, export MP3, play the downloaded file locally. | Downloaded `.mp3` is not 0 bytes, plays in local player/browser, duration is close to source. | Pending |  |
| Export failure recovery | Chrome desktop | In DevTools Console before exporting, run `const originalCreateObjectURL = URL.createObjectURL; URL.createObjectURL = () => { throw new Error("Manual QA forced download failure."); };`, then export once, restore with `URL.createObjectURL = originalCreateObjectURL`, and reload. | Dialog shows error; current project, preset, and params remain; user can close dialog or retry after restoring browser state. | Pending | Do not edit source files for this check. |
| Mobile core loop | Real mobile browser or responsive viewport | Confirm landing CTAs, recording entry, sample-to-editor, bottom tabs `预设` / `效果` / `参数` / `分析`, and export dialog. | Core loop is usable and controls do not overlap. | Pending |  |

## P1 Keyboard Regression

| Area | Browser / Device | Steps | Expected Result | Result | Evidence / Notes |
| --- | --- | --- | --- | --- | --- |
| First editor Toast | Chrome desktop | Open a fresh browser session, enter editor from sample/upload/recording. | Toast appears once: `提示：按 Space 播放/暂停，按 ? 查看全部快捷键。` | Pending |  |
| Toast does not repeat in session | Chrome desktop | Return to landing, enter editor again in the same tab session. | Keyboard hint Toast does not appear again. Other success/error Toasts still work. | Pending |  |
| Space shortcut | Chrome desktop | In editor, press `Space`. | Playback toggles without scrolling the page. | Pending |  |
| Shortcut dialog | Chrome desktop | In editor, press `?`, then close the dialog. | Shortcut dialog opens and can be closed; focus does not block continued use. | Pending |  |
| Tab path | Chrome desktop | Use `Tab` through top bar, transport, preset, inspector, analysis, and export dialog controls. | Main controls are reachable; dialog close/export controls are reachable. | Pending |  |

## Browser Compatibility Notes

| Browser | Desktop / Mobile | Upload | Recording | WAV Export | MP3 Export | Analysis | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chrome | Desktop | Pending | Pending | Pending | Pending | Pending | Recommended primary target. |
| Edge | Desktop | Pending | Pending | Pending | Pending | Pending | Recommended Chromium fallback. |
| Safari | Desktop | Pending | Pending | Pending | Pending | Pending | Recording MIME type may differ. |
| Mobile browser | Mobile | Pending | Pending | Pending | Pending | Pending | Use real device if available. |

## Release Decision

Release may be called ready when:

- Every P0 row is marked Pass with evidence.
- Any P0 Fail has a committed fix and a passing retest row.
- P1 keyboard regression rows are either Pass or explicitly accepted as non-blocking by product owner.
```

- [ ] **Step 3: Verify the document renders as Markdown**

Run:

```bash
sed -n '1,220p' docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md
```

Expected: the output includes `## P0 Release Gate`, `## P1 Keyboard Regression`, and no empty template placeholders except intentional `Pending` result cells.

- [ ] **Step 4: Commit the QA matrix**

Run:

```bash
git add docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md
git commit -m "docs: add release readiness qa matrix"
```

Expected: a commit is created. Source files with pre-existing uncommitted changes are not staged.

---

### Task 2: First Editor Keyboard Toast

**Files:**
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Inspect current App state**

Run:

```bash
sed -n '1,240p' src/app/App.tsx
```

Expected: the file imports `useEffect`, `useRef`, and `useState`; `handleRecorded`, `handleFileChange`, and `handleSample` each call `enterEditorWithBuffer`; `ToastLayer` receives a single `toast` state object.

- [ ] **Step 2: Add the session Toast helper**

In `src/app/App.tsx`, add this constant below `type ToastState`:

```tsx
const EDITOR_HINT_SESSION_KEY = "local-audio-lab-editor-keyboard-hint-shown";
const EDITOR_HINT_MESSAGE = "提示：按 Space 播放/暂停，按 ? 查看全部快捷键。";
```

Inside `App`, after the existing `useState<ToastState>(...)` block, add:

```tsx
  const showEditorHintOnce = () => {
    if (window.sessionStorage.getItem(EDITOR_HINT_SESSION_KEY) === "true") return;
    window.sessionStorage.setItem(EDITOR_HINT_SESSION_KEY, "true");
    setToast({ open: true, message: EDITOR_HINT_MESSAGE, variant: "info" });
  };
```

Rationale: `sessionStorage` satisfies "same session does not repeat" without permanently hiding the hint across future browser sessions.

- [ ] **Step 3: Call the helper after editor entry**

In `handleRecorded`, replace:

```tsx
    setToast({ open: true, message: "录音已载入。", variant: "info" });
```

with:

```tsx
    showEditorHintOnce();
```

In `handleFileChange`, replace:

```tsx
      setToast({ open: true, message: "音频已载入。", variant: "info" });
```

with:

```tsx
      showEditorHintOnce();
```

In `handleSample`, replace the success Toast block:

```tsx
      setToast({
        open: true,
        message: "示例已打开。试试点击机器人或魔鬼低音。",
        variant: "info",
      });
```

with:

```tsx
      showEditorHintOnce();
```

Expected behavior: the first successful editor entry in a tab session shows the keyboard hint; later entries in the same tab session do not replace other Toasts.

- [ ] **Step 4: Verify TypeScript and lint**

Run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: both commands exit with status `0`.

- [ ] **Step 5: Browser-check the Toast**

Run:

```bash
npm run dev
```

Then in the browser:

1. Open a fresh tab/session at the Vite URL.
2. Click `打开示例`.
3. Confirm the Toast text is exactly `提示：按 Space 播放/暂停，按 ? 查看全部快捷键。`
4. Click new project / return to landing.
5. Click `打开示例` again.
6. Confirm the keyboard hint does not repeat in the same session.

Expected: the hint appears only once. Stop the dev server after checking.

- [ ] **Step 6: Commit the Toast change**

Run:

```bash
git add src/app/App.tsx
git commit -m "feat: show first editor keyboard hint"
```

Expected: a commit is created with only `src/app/App.tsx` staged, unless execution intentionally touched another file in this task.

---

### Task 3: MP3 Lazy-Load Copy In Export Dialog

**Files:**
- Modify: `src/components/dialogs/ExportDialog.tsx`

- [ ] **Step 1: Inspect the current export dialog**

Run:

```bash
sed -n '1,240p' src/components/dialogs/ExportDialog.tsx
```

Expected: the file has a WAV/MP3 `role="radiogroup"` and the description currently says `WAV · 整段 · 本地离线渲染`.

- [ ] **Step 2: Make dialog description format-aware**

Replace:

```tsx
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                WAV · 整段 · 本地离线渲染
              </Dialog.Description>
```

with:

```tsx
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                {format.toUpperCase()} · 整段 · 本地离线渲染
              </Dialog.Description>
```

- [ ] **Step 3: Add the MP3 local encoder note**

After the closing `</dl>` for the format/range/status block and before the existing `{exporting ? (` progress block, insert:

```tsx
          {format === "mp3" ? (
            <p className="rounded-md bg-blue-50 px-3 py-2 text-sm leading-6 text-blue-800">
              首次导出 MP3 会加载本地编码器，可能稍慢；音频仍不会上传。
            </p>
          ) : null}
```

Expected behavior: the note appears only when MP3 is selected and remains visible before export starts.

- [ ] **Step 4: Verify TypeScript, lint, and build**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit with status `0`; build output still includes a separate MP3 encoder chunk or equivalent lazy chunk evidence.

- [ ] **Step 5: Browser-check the MP3 copy**

Run:

```bash
npm run dev
```

Then in the browser:

1. Open sample audio.
2. Open export dialog.
3. Confirm default WAV state does not show the MP3 note.
4. Select `mp3`.
5. Confirm the note says `首次导出 MP3 会加载本地编码器，可能稍慢；音频仍不会上传。`

Expected: no layout overlap on desktop and mobile widths. Stop the dev server after checking.

- [ ] **Step 6: Commit the export dialog copy**

Run:

```bash
git add src/components/dialogs/ExportDialog.tsx
git commit -m "docs: clarify mp3 export loading"
```

Expected: a commit is created with only `src/components/dialogs/ExportDialog.tsx` staged.

---

### Task 4: README Browser, Permission, And Format Notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Inspect current README**

Run:

```bash
sed -n '1,180p' README.md
```

Expected: README already contains `快速开始`, `功能`, `本地与隐私`, and `技术说明` sections.

- [ ] **Step 2: Add browser guidance**

After the quick-start build command block and before `## 功能`, insert:

```markdown
## 推荐环境

- 推荐使用最新版 Chrome 或 Edge。
- Safari 可用于上传、播放、分析和导出等核心路径，但浏览器录音的编码格式可能与 Chromium 浏览器不同。
- 移动端支持核心编辑流程；真实麦克风授权、下载行为和本地播放器兼容性以设备浏览器为准。
```

- [ ] **Step 3: Expand privacy and microphone permission copy**

Replace the existing `## 本地与隐私` paragraph:

```markdown
应用不需要账号、不上传音频、不依赖后端接口，也不使用 AI。音频解析、麦克风录制、播放、效果处理、离线渲染、频谱分析和 WAV / MP3 编码都在浏览器本地完成。
```

with:

```markdown
应用不需要账号、不上传音频、不依赖后端接口，也不使用 AI。音频解析、麦克风录制、播放、效果处理、离线渲染、频谱分析和 WAV / MP3 编码都在浏览器本地完成。

麦克风权限只在用户点击录音入口后请求，并仅用于本地录音。拒绝权限后仍可继续使用上传音频和打开示例音频。
```

- [ ] **Step 4: Add recording format and MP3 lazy-load notes**

At the end of `## 技术说明`, append these bullets:

```markdown
- 浏览器录音优先使用 `audio/webm;codecs=opus`、`audio/webm` 或 `audio/mp4`；实际编码由当前浏览器的 `MediaRecorder` 支持情况决定。
- 录音文件名扩展名用于标记来源，真正能否解码取决于浏览器生成的 MIME 类型和本机解码能力；如录音解析失败，建议换用最新版 Chrome / Edge 后重试。
- MP3 编码器仅在用户选择 MP3 并开始导出时加载；首次 MP3 导出可能比 WAV 稍慢，但仍在本地完成。
```

- [ ] **Step 5: Verify README content**

Run:

```bash
rg -n "推荐环境|麦克风权限|MediaRecorder|MP3 编码器" README.md
```

Expected: output includes all four phrases.

- [ ] **Step 6: Commit README updates**

Run:

```bash
git add README.md
git commit -m "docs: add browser and permission guidance"
```

Expected: a commit is created with only `README.md` staged.

---

### Task 5: Fill P0 Manual QA Evidence

**Files:**
- Modify: `docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md`

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

Expected: Vite starts and prints a local URL such as `http://localhost:5173/` or `http://localhost:5174/`.

- [ ] **Step 2: Complete microphone allow path**

In real Chrome or Edge:

1. Open the Vite URL.
2. Click `开始录音`.
3. Allow microphone permission.
4. Record at least 3 seconds.
5. Stop recording.
6. Confirm editor loads with waveform.
7. Press play, choose a preset, open analysis, and open export dialog.

Update the `Microphone allow path` row in the QA doc:

```markdown
| Microphone allow path | Chrome desktop | Click `开始录音`, allow microphone, record at least 3 seconds, stop recording. | App enters editor; waveform renders; playback works; presets, analysis, WAV export, and MP3 export are reachable. | Pass | Chrome <version>, macOS <version>, recorded <duration>s; waveform/playback/preset/analysis/export reachable. |
```

- [ ] **Step 3: Complete microphone deny path**

In real Chrome or Edge:

1. Reset microphone permission for the local site.
2. Click `开始录音`.
3. Deny microphone permission.
4. Confirm user-facing error is shown.
5. Click `取消`.
6. Confirm the app returns to landing and sample/upload still work.

Update the `Microphone deny path` row:

```markdown
| Microphone deny path | Chrome desktop | Reset site microphone permission, click `开始录音`, deny permission. | Error text is understandable; app does not white-screen; user can cancel/return; repeating the flow behaves predictably. | Pass | Chrome <version>, macOS <version>; denial showed `<observed message>`; cancel returned to landing. |
```

- [ ] **Step 4: Complete WAV playable download**

In Chrome or Edge:

1. Open sample.
2. Select `机器人`.
3. Export WAV.
4. Play the downloaded `.wav` in browser or local player.
5. Confirm file size is greater than `0` bytes.

Update the `WAV playable download` row:

```markdown
| WAV playable download | Chrome desktop | Open sample, choose a preset, open export dialog, export WAV, play the downloaded file locally. | Downloaded `.wav` is not 0 bytes, plays in local player/browser, duration is close to source, selected preset is audible. | Pass | File `<filename>.wav`, size <size>, duration approx <duration>s, preset audible. |
```

- [ ] **Step 5: Complete MP3 playable download**

In Chrome or Edge:

1. Open sample.
2. Select MP3 in export dialog.
3. Export MP3.
4. Play the downloaded `.mp3` in browser or local player.
5. Confirm file size is greater than `0` bytes.

Update the `MP3 playable download` row:

```markdown
| MP3 playable download | Chrome desktop | Open sample, choose MP3 in export dialog, export MP3, play the downloaded file locally. | Downloaded `.mp3` is not 0 bytes, plays in local player/browser, duration is close to source. | Pass | File `<filename>.mp3`, size <size>, duration approx <duration>s. |
```

- [ ] **Step 6: Complete export failure recovery**

Use DevTools Console fault injection, without editing source files:

1. Open sample.
2. Select a preset and adjust one parameter.
3. Open export dialog.
4. In DevTools Console, run `const originalCreateObjectURL = URL.createObjectURL; URL.createObjectURL = () => { throw new Error("Manual QA forced download failure."); };`.
5. Click export once.
6. Confirm the dialog shows an error.
7. Confirm editor project, preset, and params remain.
8. Restore browser state with `URL.createObjectURL = originalCreateObjectURL`.
9. Reload the page.

Update the `Export failure recovery` row:

```markdown
| Export failure recovery | Chrome desktop | In DevTools Console before exporting, run `const originalCreateObjectURL = URL.createObjectURL; URL.createObjectURL = () => { throw new Error("Manual QA forced download failure."); };`, then export once, restore with `URL.createObjectURL = originalCreateObjectURL`, and reload. | Dialog shows error; current project, preset, and params remain; user can close dialog or retry after restoring browser state. | Pass | Forced `Manual QA forced download failure.` via DevTools Console; restored `URL.createObjectURL`; reloaded page. Do not edit source files for this check. |
```

- [ ] **Step 7: Complete mobile core loop**

In a real mobile browser or responsive viewport:

1. Confirm landing has upload, recording, and sample entry points.
2. Open sample.
3. Confirm bottom tabs `预设`, `效果`, `参数`, `分析`.
4. Open each tab.
5. Open export dialog and switch WAV/MP3.

Update the `Mobile core loop` row:

```markdown
| Mobile core loop | Real mobile browser or responsive viewport | Confirm landing CTAs, recording entry, sample-to-editor, bottom tabs `预设` / `效果` / `参数` / `分析`, and export dialog. | Core loop is usable and controls do not overlap. | Pass | <device/browser/viewport>; tabs and export dialog usable with no overlap. |
```

- [ ] **Step 8: Stop the dev server and commit QA evidence**

Run:

```bash
git add docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md
git commit -m "docs: record release readiness qa evidence"
```

Expected: a commit is created with manual QA evidence. No temporary source-code diff remains from forced export failure testing.

---

### Task 6: Final Verification And Release Gate Review

**Files:**
- Modify: `docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md` only if final QA result rows need correction.

- [ ] **Step 1: Confirm worktree status before verification**

Run:

```bash
git status --short --branch
```

Expected: no unexpected modified files. Pre-existing user/workspace changes may still exist if they were intentionally left unstaged; do not stage unrelated files.

- [ ] **Step 2: Run static verification**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all commands exit with status `0`.

- [ ] **Step 3: Verify P0 release gate rows**

Run:

```bash
rg -n "P0 Release Gate|\\| .* \\| .* \\| .* \\| .* \\| Pending \\|" docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md
```

Expected: output shows `P0 Release Gate` and no P0 rows still marked `Pending`. If any P0 row is still `Pending`, release readiness is not complete.

- [ ] **Step 4: Verify README release notes**

Run:

```bash
rg -n "推荐使用最新版 Chrome|麦克风权限只在用户点击录音入口后请求|audio/webm;codecs=opus|首次 MP3 导出" README.md
```

Expected: all four lines are found.

- [ ] **Step 5: Verify implementation diff**

Run:

```bash
git log --oneline -5
git status --short
```

Expected: recent commits include the QA matrix, editor hint, MP3 copy, README guidance, and QA evidence commits. `git status --short` has no accidental debug edits.

- [ ] **Step 6: Final release decision**

If every P0 row is Pass and verification commands pass, append this under `## Release Decision` in the QA doc:

```markdown

Final review: P0 release gate passed on 2026-06-07. Static verification passed with `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
```

Then commit:

```bash
git add docs/superpowers/qa/2026-06-07-release-readiness-manual-qa.md
git commit -m "docs: mark release readiness gate passed"
```

Expected: final release readiness evidence is committed.

---

## Parallel Execution Notes

Recommended subagent split:

- Worker A: Task 1 QA matrix.
- Worker B: Task 2 first-editor Toast.
- Worker C: Task 3 export dialog MP3 copy.
- Worker D: Task 4 README guidance.

Task 5 must run after Tasks 1-4 because it fills evidence against the final UI/docs. Task 6 must run last.

## Self-Review

- Spec coverage: P0 manual microphone allow/deny, WAV/MP3 playable downloads, export failure recovery, and mobile core loop are covered by Tasks 1 and 5. P1 first editor Toast is covered by Task 2. README browser/permission/format/MP3 notes are covered by Task 4. MP3 dialog copy is covered by Task 3. Manual QA matrix and keyboard regression are covered by Tasks 1, 5, and 6.
- Placeholder scan: The plan contains intentional QA fill-in markers such as `<version>` and `<filename>` only inside evidence rows that must be replaced during manual QA execution. It contains no incomplete implementation steps.
- Type consistency: `ToastState`, `setToast`, `ExportDialog`, `format`, `ExportFormat`, and existing store names match the current files inspected during planning.
