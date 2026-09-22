# Third-party algorithm notice

## CrossWordia

- Source: https://github.com/esentis/crosswordia
- Reviewed revision: `ece6db323f5b355eb0662c5ddf9a9684724dca23` (develop)
- Copyright (c) 2023 George Leonidis (esentis)
- License: MIT; the unmodified copyright and license text is in
  [LICENSES/CrossWordia-MIT.txt](LICENSES/CrossWordia-MIT.txt).

MÜHÜR's `src/engine/scoring.ts` adapts the inverse-frequency sum plus length
bonus described and implemented in `lib/core/extensions/string_extensions.dart`.
Greek frequency data was not copied: MÜHÜR derives a smoothed distribution from
its own Turkish legal-term corpus. Scores are authoring metadata, never XP,
Mühür awards or hint prices.

`src/engine/grid.ts` is a TypeScript reimplementation informed by the
longest-first, shared-letter placement strategy in
`lib/screens/board/controllers/crossword_board_controller.dart` and the
boundary, endpoint and adjacent-cell checks in
`lib/screens/board/helpers/horizontal_check.dart` and `vertical_check.dart`.
MÜHÜR adds direction ownership, explicit unplaced-word reporting, deterministic
candidate ranking and bounded generation. It is not a line-by-line Flutter port.

Level/state separation also draws on `lib/services/levels_service.dart`,
`lib/services/models/word_placement_data.dart` and the controller's position maps.
The existing MÜHÜR Question and progress schemas remain authoritative.

No CrossWordia assets, fonts, icons, screens, branding, word lists, descriptions,
backend clients, UI code, currency rules or letter-connector input were imported.
Keep this notice and the MIT license with distributions of the adapted engine.
