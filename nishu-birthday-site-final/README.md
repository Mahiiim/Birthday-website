# Happy Birthday, Nishu — Editable Project

## Files
- `index.html` — page structure and all copy
- `style.css` — colors, fonts, layout, animations (design tokens at the top under `:root`)
- `script.js` — particle field, synthesized music, gate mic-blow + celebration logic, countdown, confetti, wish release
- `assets/images/` — put her real photos here

## The site now has two front-facing pieces: the entering gate, then the front page

**1. The entering gate** (`#enteringGate`) — this is your existing candle-blow page,
unchanged, now presented as a fixed overlay she meets first, before anything else loads
behind it:
- Title "Happy Birthday, Nishu!", falling gold confetti + rose petals, the decorative
  floral corner (bottom-left), and the bottom-right "college album" photo cluster at
  50% opacity.
- The 3-candle cake, with **no click interaction at all**. Mic access is requested
  automatically the moment the page loads. Once granted, an actual sustained blow into
  the mic is what puts the candles out — a small level meter under the cake gives
  visual feedback while she's blowing.
- Once all three are blown out at once: a canvas sparkle/confetti burst fires, an
  optional fireworks video layers in behind the text, the instruction text changes to a
  congratulations line, and a glowing "Proceed to our story" button fades in.
- Tapping that button fades the whole gate away, revealing the front page underneath.

**2. The front page** (`#hero`, the section right after the gate in `index.html`) — this
is the page she actually lands on once the candles are out: eyebrow "17th of July", the
title, the same warm subtitle, a live countdown to the next July 17, and a "See Your
Journey" button that smooth-scrolls down into the timeline.

Everything from the timeline onward — chapters, memories gallery, reason cards, the
letter, footer — is exactly as it was. I didn't touch layout, copy, or structure there.

## 🔴 If mic access is denied or unavailable

Since there's intentionally no click-to-blow fallback, a "Allow microphone access"
retry button appears if the browser blocks or denies the permission. There's no way to
proceed past the candles without an actual mic and a real blow — worth testing on her
specific phone/laptop and browser before the day itself, in case her device blocks mic
access by default.

## To add a celebration video (optional)
The canvas sparkle burst always plays and is the guaranteed effect. To layer a real
video on top of it:
1. Drop your file into `assets/` (e.g. `assets/celebration.mp4`).
2. In `index.html`, find `<video id="celebration-video"...>` and change its `src` from
   `REPLACE-WITH-YOUR-CELEBRATION-VIDEO.mp4` to your file's path.
It autoplays muted at 55% opacity behind the text the instant the candles go out.

## To replace photos
- Corner album (4 photos, bottom-right of the hero): search `index.html` for the first
  4 occurrences of `via.placeholder.com/180x220`.
- Timeline (3 photos): search for `via.placeholder.com/400x500`.
- Memories gallery (6 photos): search for `via.placeholder.com/400x400` and
  `via.placeholder.com/400x600`.

## About the mic-blow feature
It uses the Web Audio API to measure microphone volume in real time — nothing is
recorded, saved, or sent anywhere; audio is only ever analyzed in her browser and
discarded immediately. Worth mentioning to her if she asks why it's requesting mic
access the moment the page opens.

## To change colors or fonts
Open `style.css` and edit the CSS variables at the top of `:root`. The hero uses its
own accent set (`--rose-deep`, `--rose-mid`, `--gold`, `--gold-soft`) layered on top of
the site's original palette, so the rest of the site's colors are untouched by any
changes you make to those four.

## To preview
Open `index.html` directly in a browser. No build step or server required.
