# Twenty One

A dependency-free blackjack game built with HTML, CSS, and JavaScript.

## Run it

```bash
npm start
```

Then open [http://localhost:4173](http://localhost:4173).

## Test it

```bash
npm test
```

The first version includes:

- A six-deck shuffled shoe
- A fresh six-deck shuffle before every hand
- Blackjack payouts at 3:2
- Hit, stand, double-down, equal-value split, and insurance actions
- Dealer draws no hole card and hits soft 17
- Split aces receive one card per hand
- Dealer Blackjack returns non-busted optional split/double wagers
- No surrender, 99.40% theoretical RTP, and malfunction void handling
- Chip-based betting and bankroll tracking
- Adaptive chip rack from 10p to high-stakes denominations
- Synthesized card, chip, win, loss, and push sounds with a mute control
- Sequential card reveals with the dealer's second card held until your turn ends
- Configurable starting bankroll
- Optional hard mode with a locked casino-style challenge bankroll
- Desktop and mobile preview modes
- Session stats and round history
- Compact, no-scroll desktop layout with responsive narrow-window support
