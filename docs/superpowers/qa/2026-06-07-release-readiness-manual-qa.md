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
