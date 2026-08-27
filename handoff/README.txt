HNTR.art — DEVELOPER HANDOFF (latest build)
===========================================

FILES
  HNTR.art Desktop (standalone).html
                             Desktop app with every image, font and canvas asset
                             inlined — OPEN THIS ONE when running from disk
                             (double-click). The hero animation and NFT imagery
                             only load correctly in this version, because a
                             browser blocks canvas/image reads from file:// URLs.
  HNTR.art Desktop.html      Same app, source version — images load from the
                             sibling files in this folder. Use this one for
                             development / serving over http.
  HNTR.art Mobile.dc.html    Mobile app — requires support.js in the same folder
  HNTR Docs.html             Documentation / whitepaper page
  support.js                 Runtime required by the mobile file
  *.png / *.jpg / *.jpeg     Referenced image assets — keep in the same folder
  reveal/original.jpg
  reveal/neon.png            Source textures for the hero WebGL reveal effect

NOTE ON THE HERO REVEAL
  The hero panel is a WebGL canvas that cross-fades two textures under the
  cursor. Browsers refuse to upload file:// images into a WebGL texture, so the
  source version shows an empty panel when opened by double-click. Serve it over
  http (e.g. `python3 -m http.server`) or use the standalone file, which carries
  the textures as data URIs via window.__resources.

Open the HTML files directly in a browser. No build step.

PRE-LAUNCH STATE (what changed in this build)
--------------------------------------------
The platform is not live, so all data-bearing sections now show a
placeholder ("skeleton") state instead of mock data.

Empty states added:
  Home — HNTR'S LISTINGS      5-card skeleton grid, "No items found" / "Launching soon"
  Home — HNTR SALES           horizontally scrolling skeleton marquee,
                              "No Sales found" / "Launching soon"
  Marketplace — NFT grid      2 x 4 skeleton grid, text centred on the row boundary
  Network Activity table      5 skeleton rows, "No results found" / "Launching soon"
  NFT Strategies — Real-Time Activity   skeleton rows + same message
  My NFT — All Positions Breakdown      skeleton rows + same message,
                                        counter reads "Showing 0 of 0 entries"
  NFT Collection grid         2 x 4 skeleton cards; only the ownership-percentage
                              ring shape is kept, unfilled

Implementation notes:
  - Skeletons are pure CSS (.lempty*, .sempty*, .nempty*, .ncempty*), no JS data.
  - A gradient veil (.lempty-fade / .nempty-fade) sits over each grid; the message
    layer sits above it at z-index 10.
  - A looping left-to-right light wave (@keyframes emptyWave) animates every
    skeleton block.
  - Theming is driven by CSS variables so both themes stay correct:
      --empty-f1/f2/f3     veil gradient stops
      --empty-card         skeleton card background
      --empty-fill         skeleton image/bar fill
      --empty-shimmer      wave highlight
      --empty-ring-fill / --empty-ring-stroke   ownership ring
    Light theme uses a near-transparent veil with white cards; dark theme
    (body.dark) uses the black veil.
  - The JS tickers that used to inject fake rows are disabled:
      netTable  (Network Activity)  -> const ntTb = null
      actTable  (Real-Time Activity)-> const atTb = null
      setPosView() renders skeleton rows and returns early

ZEROED METRICS
--------------
  Marketplace stat strip     $0.0M volume, 0 items, 0.0%, 0 active users,
                             collection filter counts 0, distribution bar neutral
  NFT Strategies stat strip  0.0 ETH / $0.00 raised, 0 Pools, 0.0%, 0 users
  My NFT Collection strip    0 NFTs, 0 ETH / $0.00, 0.0%, 0 ETH / $0.00
  Pool cards                 Community Raised 0.00 ETH / $0.00, progress bar 0%,
                             Users 0  (Pool Target values left intact)
  Pool detail page           Community Raised 0.00 ETH, 0 / 10 ETH (0%),
                             Participants 0

COPY CHANGES
------------
  "Make a Deposit Now" / "MAKE A DEPOSIT NOW"  ->  "COMING SOON"
  (all pool cards on the home page and the NFT Strategies page, plus the
   pool detail page CTA). The deposit modal handler is still wired up.

GOING LIVE
----------
To switch back to live data: restore the three JS table bindings listed above,
remove the .lempty / .sempty / .nempty / .ncempty wrapper blocks, and re-point
the stat strips and pool cards at real values. The CTA label is a plain string
in the button markup.
