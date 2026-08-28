# Client and partner logos

Drop the licensed logo files in this folder and they appear on the site
immediately. No code change, no rebuild of any component — the reference wall
already asks for every one of them by name.

## What the site is looking for

`src/data/company.ts` gives each client a `logo` path. The wall tries to load
it; if the file is not here, that row falls back to the client's name set in
type, which is what it does today. So this folder can be filled **one file at
a time** and the page stays correct the whole way.

| File it wants                            | Client                        |
| ---------------------------------------- | ----------------------------- |
| `bank-of-georgia.svg`                    | Bank of Georgia               |
| `tbc-bank.svg`                           | TBC Bank                      |
| `liberty-bank.svg`                       | Liberty Bank                  |
| `pasha-bank.svg`                         | Pasha Bank                    |
| `procredit-bank.svg`                     | ProCredit Bank                |
| `ministry-of-justice.svg`                | Ministry of Justice           |
| `house-of-justice.svg`                   | House of Justice              |
| `national-bureau-of-enforcement.svg`     | National Bureau of Enforcement|
| `deloitte.svg`                           | Deloitte                      |
| `booking-com.svg`                        | Booking.com                   |
| `samsung.svg`                            | Samsung                       |
| `colliers.svg`                           | Colliers                      |
| `knauf.svg`                              | Knauf                         |
| `regus.svg`                              | Regus                         |
| `caucasus-university.svg`                | Caucasus University           |
| `ids-borjomi.svg`                        | IDS Borjomi                   |
| `hilton-garden-inn.svg`                  | Hilton Garden Inn             |
| `ramada-encore.svg`                      | Ramada Encore                 |
| `best-western.svg`                       | Best Western                  |
| `casino-international.svg`               | Casino International          |

To change a filename, change the `logo` value on that row in
`src/data/company.ts`. `.png` works as well as `.svg` — put the real extension
in the path.

## What the files should be

- **SVG** wherever the brand supplies one. The wall renders each mark at up to
  40px tall and the page is served on retina screens; a small raster will show
  it.
- **PNG at 3× the display size** (roughly 120px tall) with a transparent
  background if SVG is not available.
- **A single flat colour, or full colour.** The wall greyscales every mark and
  returns it to colour on hover, so full-colour files are fine and preferred —
  do not pre-greyscale them.
- **Trimmed.** No baked-in padding; the layout supplies the spacing. A file
  with 30% whitespace around the mark renders visibly smaller than its
  neighbours.
- **The horizontal lockup** where a brand has both. The cells are wider than
  they are tall.

## Where these come from

Every mark here belongs to somebody else. Get the file from the client's own
brand or press kit, or ask them for it — most have a "media resources" page —
and check what their guidelines allow. Permission to name a client as a
reference is not automatically permission to reproduce their logo, and a bank
in particular will usually want to be asked.

**Do not use a hand-drawn approximation.** A redrawn mark is not the client's
logo while sitting exactly where their logo goes, and their brand team will
notice before anyone else does.

## Partner manufacturers too

`BRANDS` in the same file carries the identical `logo` field, used by the brand
cards on the home page. Those default to no path at all — add one pointing here
and the card shows the mark instead of the wordmark, centred over the
photograph.
