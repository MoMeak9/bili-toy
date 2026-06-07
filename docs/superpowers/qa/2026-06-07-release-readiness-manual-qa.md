# Local Audio Lab Release Readiness Manual QA

- Date: 2026-06-07
- Scope: MVP + Phase 2 release readiness
- Source spec: `docs/superpowers/specs/2026-06-07-local-audio-lab-requirements-completion-todo.md`
- Status: In progress; automated browser checks are recorded, real microphone and local playback checks still need manual evidence

## How To Run

1. Start the app with `npm run dev`.
2. Open the app in the target browser.
3. Prefer real Chrome or Edge for microphone permission checks.
4. Use the built-in sample for export checks when microphone access is not available.
5. Record exact browser, OS, viewport/device, result, and notes in the matrix below.

## P0 Release Gate

| Area | Browser / Device | Steps | Expected Result | Result | Evidence / Notes |
| --- | --- | --- | --- | --- | --- |
| Microphone allow path | Chrome desktop | Click `开始录音`, allow microphone, record at least 3 seconds, stop recording. | App enters editor; waveform renders; playback works; presets, analysis, WAV export, and MP3 export are reachable. | Manual Required | Needs real browser microphone permission allow test. Automated checks verified sample-to-editor, playback UI, presets, analysis tab, and export dialog reachability on Chrome-like in-app browser. |
| Microphone deny path | Chrome desktop | Reset site microphone permission, click `开始录音`, deny permission. | Error text is understandable; app does not white-screen; user can cancel/return; repeating the flow behaves predictably. | Manual Required | Needs real browser permission prompt or site permission reset. Do not mark release ready until denial recovery is observed. |
| WAV playable download | Chrome desktop | Open sample, choose a preset, open export dialog, export WAV, play the downloaded file locally. | Downloaded `.wav` is not 0 bytes, plays in local player/browser, duration is close to source, selected preset is audible. | Manual Required | Needs real downloaded file playback confirmation. Automated checks verified WAV export dialog path is reachable. |
| MP3 playable download | Chrome desktop | Open sample, choose MP3 in export dialog, export MP3, play the downloaded file locally. | Downloaded `.mp3` is not 0 bytes, plays in local player/browser, duration is close to source. | Manual Required | Needs real downloaded file playback confirmation. Automated checks verified MP3 selection shows local encoder note and build keeps `mp3Encoder` as a lazy chunk. |
| Export failure recovery | Chrome desktop | In DevTools Console before exporting, run `const originalCreateObjectURL = URL.createObjectURL; URL.createObjectURL = () => { throw new Error("Manual QA forced download failure."); };`, then export once, restore with `URL.createObjectURL = originalCreateObjectURL`, and reload. | Dialog shows error; current project, preset, and params remain; user can close dialog or retry after restoring browser state. | Manual Required | Needs DevTools fault-injection run in a real browser session. Do not edit source files for this check. |
| Mobile core loop | Real mobile browser or responsive viewport | Confirm landing CTAs, recording entry, sample-to-editor, bottom tabs `预设` / `效果` / `参数` / `分析`, and export dialog. | Core loop is usable and controls do not overlap. | Automated Pass | In-app browser responsive viewport 390x844: upload/recording/sample CTAs visible; sample entered editor; tabs `预设` / `效果` / `参数` / `分析` opened; export dialog showed WAV/MP3 controls. Real device still recommended before public release. |

## P1 Keyboard Regression

| Area | Browser / Device | Steps | Expected Result | Result | Evidence / Notes |
| --- | --- | --- | --- | --- | --- |
| First editor Toast | Chrome desktop | Open a fresh browser session, enter editor from sample/upload/recording. | Toast appears once: `提示：按 Space 播放/暂停，按 ? 查看全部快捷键。` | Automated Pass | In-app browser sample entry showed exact Toast text after entering editor. |
| Toast does not repeat in session | Chrome desktop | Return to landing, enter editor again in the same tab session. | Keyboard hint Toast does not appear again. Other success/error Toasts still work. | Automated Pass | Same-tab session uses `sessionStorage` key `local-audio-lab-editor-keyboard-hint-shown`; repeated sample entry did not require another hint for continued checks. |
| Space shortcut | Chrome desktop | In editor, press `Space`. | Playback toggles without scrolling the page. | Automated Pass | Initial QA exposed playback UI stuck on `播放`; fixed in commit `2b3d48c`. Retest: play button click and `Space` path switched transport button to `暂停`. |
| Shortcut dialog | Chrome desktop | In editor, press `?`, then close the dialog. | Shortcut dialog opens and can be closed; focus does not block continued use. | Automated Pass | In-app browser `?` opened shortcut dialog showing `Space` and `?`; close button dismissed dialog. |
| Tab path | Chrome desktop | Use `Tab` through top bar, transport, preset, inspector, analysis, and export dialog controls. | Main controls are reachable; dialog close/export controls are reachable. | Partial Automated Pass | Automated role checks found top-bar export, transport play/pause, mobile tabs, and dialog controls. Full sequential keyboard focus order still benefits from manual pass. |

## Browser Compatibility Notes

| Browser | Desktop / Mobile | Upload | Recording | WAV Export | MP3 Export | Analysis | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chrome | Desktop | Automated Pass | Manual Required | Manual Required | Manual Required | Automated Pass | In-app Chromium-like browser covered upload/sample editor, analysis, export UI, MP3 note, mobile viewport, and keyboard dialog. Real mic/download playback still pending. |
| Edge | Desktop | Pending | Pending | Pending | Pending | Pending | Recommended Chromium fallback; not yet manually checked. |
| Safari | Desktop | Pending | Pending | Pending | Pending | Pending | Recording MIME type may differ. |
| Mobile browser | Mobile | Pending | Pending | Pending | Pending | Pending | Use real device if available. |

## Release Decision

Release may be called ready when:

- Every P0 row is marked Pass with evidence.
- Any P0 Fail has a committed fix and a passing retest row.
- P1 keyboard regression rows are either Pass or explicitly accepted as non-blocking by product owner.
