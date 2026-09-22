# MÜHÜR cinematic interface

Home remains the visual reference. `homeUi.tsx` / `homeTheme.ts` freeze its existing primitives; the Home composition and custom styles are unchanged. Avatar border is explicitly preserved there.

Other screens use `theme.ts`, `ui.tsx`, and `Ambient` from `art.tsx`: the existing original courthouse image under a dark readability scrim, navy translucent cards, cream text, warm gold primary actions. Game clues use a cream surface with dark text. No bottom tabs are mounted; navigation is through back controls and contextual buttons.

Game and daily/replay sessions use `LetterPool.tsx`. `poolTiles.ts` creates deterministic shuffled answer letters plus three decoys; duplicate letters are separate tiles, typed letters consume tiles, deletion restores them, and revealed hints do not consume tiles. Confirmation is explicit. The existing reducers perform answer validation, hints, XP and rewards. Old keyboard drafts remain editable by deletion. No persistence migration is needed.

Profile links to a separate, explicitly labeled DEMO league. Its fictional players and points do not modify player progress and are not an online leaderboard. Personal file rankings remain available separately.

Verification: TypeScript, 58 unit/regression tests, Expo web/iOS/Android export, and isolated DOM execution of the exported web bundle covering onboarding, character selection, contextual routes, league, pool deletion/duplicate letters/wrong and correct answers/hints, and daily puzzle entry. Core game/product/persistence/store/content files were verified unchanged. Automated screenshot verification was blocked by the computer-use runtime; real phone visual testing remains outstanding.
