# Avi's Casino

A dependency-free browser casino built with HTML, CSS, and JavaScript.

## Run it

```bash
npm start
```

Then open [http://localhost:4173](http://localhost:4173).

## Test it

```bash
npm test
```

## Games

- Twenty One Blackjack with Normal, Hard, and Perfect Strategy modes
- European Roulette with a single-zero wheel
- Universal or local wallet setup
- Desktop and mobile preview modes
- Synthesized chip, card, spin, win, loss, and push sounds

## Blackjack

- Six-deck shuffled shoe
- Fresh six-deck shuffle before every hand
- Blackjack pays 3:2
- Hit, stand, double-down, equal-value split, and insurance actions
- Dealer draws no hole card and hits soft 17
- Split aces receive one card per hand
- Dealer Blackjack returns non-busted optional split/double wagers
- No surrender, 99.40% theoretical RTP, and malfunction void handling

## Roulette

- European 37-pocket wheel, numbered 0 to 36
- Full inside betting: straight, split, street, corner, and line
- Full outside betting: red/black, odd/even, low/high, dozens, and columns
- Racetrack neighbours, Voisins du Zero, Tiers du Cylindre, Orphelins en Plein, Zero, red splits, and black splits
- Saved bets with replay and delete controls
- Roulette paytable minimums start at 1p
- Inside minimums are cumulative; outside minimums and maximums are individual
- Malfunction voids all pays and plays
