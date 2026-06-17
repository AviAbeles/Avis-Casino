import test from "node:test";
import assert from "node:assert/strict";
import {
  CasinoWallet,
  COLOR_SPLITS,
  EUROPEAN_WHEEL,
  PAYTABLE,
  RED_NUMBERS,
  RouletteGame,
  SPECIAL_BETS,
  createBetSpec,
  createNeighbourComponents,
  createOutsideBet,
  getColumnNumbers,
  getDozenNumbers,
  getNumberColor,
  getOutsideNumbers,
} from "../src/roulette.js";

function memoryStorage() {
  const state = new Map();
  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, String(value));
    },
  };
}

function place(game, type, numbers, stake = 1, label = numbers.join("/")) {
  return game.placeBet(
    createBetSpec({
      type,
      label,
      numbers,
      section: PAYTABLE[type].section,
    }),
    stake,
  );
}

test("European roulette has 37 single-zero pockets", () => {
  assert.equal(EUROPEAN_WHEEL.length, 37);
  assert.equal(new Set(EUROPEAN_WHEEL).size, 37);
  assert.equal(EUROPEAN_WHEEL.includes(0), true);
});

test("number colours and outside memberships are correct", () => {
  assert.equal(getNumberColor(0), "green");
  assert.equal(getNumberColor(1), "red");
  assert.equal(getNumberColor(2), "black");
  assert.deepEqual(RED_NUMBERS.slice(0, 5), [1, 3, 5, 7, 9]);
  assert.equal(getOutsideNumbers("red").length, 18);
  assert.equal(getOutsideNumbers("black").length, 18);
  assert.equal(getOutsideNumbers("odd").includes(35), true);
  assert.equal(getOutsideNumbers("even").includes(36), true);
  assert.deepEqual(getOutsideNumbers("low"), Array.from({ length: 18 }, (_, index) => index + 1));
  assert.deepEqual(getOutsideNumbers("high"), Array.from({ length: 18 }, (_, index) => index + 19));
  assert.deepEqual(getDozenNumbers(2), [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
  assert.deepEqual(getColumnNumbers(3), [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
});

test("all paytable odds return stake plus winnings", () => {
  const cases = [
    ["redBlack", createOutsideBet("red", "Red"), 7, 1],
    ["oddEven", createOutsideBet("odd", "Odd"), 7, 1],
    ["lowHigh", createOutsideBet("low", "1-18"), 7, 1],
    ["dozen", createOutsideBet("dozen-1", "1st 12"), 7, 2],
    ["column", createOutsideBet("column-1", "Column 1"), 7, 2],
    ["straight", createBetSpec({ type: "straight", label: "7", numbers: [7] }), 7, 35],
    ["split", createBetSpec({ type: "split", label: "7/8", numbers: [7, 8] }), 7, 17],
    ["street", createBetSpec({ type: "street", label: "7/8/9", numbers: [7, 8, 9] }), 7, 11],
    ["corner", createBetSpec({ type: "corner", label: "7/8/10/11", numbers: [7, 8, 10, 11] }), 7, 8],
    ["line", createBetSpec({ type: "line", label: "7-12", numbers: [7, 8, 9, 10, 11, 12] }), 7, 5],
  ];

  for (const [type, spec, winningNumber, odds] of cases) {
    const game = new RouletteGame({ startingBalance: 1000 });
    assert.equal(game.placeBet(spec, 2), true, type);
    game.spin(winningNumber);
    assert.equal(game.balance, 1000 + 2 * odds, type);
    assert.equal(game.lastSpin.winningBets[0].returned, 2 * (odds + 1), type);
  }
});

test("losing bets are deducted from the balance", () => {
  const game = new RouletteGame({ startingBalance: 100 });

  assert.equal(place(game, "straight", [7], 5), true);
  game.spin(8);

  assert.equal(game.balance, 95);
  assert.equal(game.result, "loss");
});

test("min and max limits are enforced for each paytable row", () => {
  for (const [type, rule] of Object.entries(PAYTABLE)) {
    const game = new RouletteGame({ startingBalance: 2000 });
    const numbers =
      type === "line"
        ? [1, 2, 3, 4, 5, 6]
        : type === "corner"
          ? [1, 2, 4, 5]
          : type === "street"
            ? [1, 2, 3]
            : type === "split"
              ? [1, 2]
              : type === "straight"
                ? [1]
                : [1, 3, 5];
    const spec =
      rule.section === "outside"
        ? createOutsideBet(
            type === "dozen"
              ? "dozen-1"
              : type === "column"
                ? "column-1"
                : type === "oddEven"
                  ? "odd"
                  : type === "lowHigh"
                    ? "low"
                    : "red",
            rule.name,
          )
        : createBetSpec({ type, label: rule.name, numbers });

    assert.equal(game.placeBet(spec, 0.001), true, type);
    assert.equal(game.pendingBets[0].stake, rule.min, type);
    assert.equal(game.placeBet(spec, rule.max), false, type);
  }
});

test("inside minimums are cumulative while outside positions are individual", () => {
  const game = new RouletteGame({ startingBalance: 10 });

  assert.equal(place(game, "straight", [7], 0.005), true);
  assert.equal(game.insideTotal(), 0.01);
  assert.deepEqual(game.validationErrors(), []);

  const red = createOutsideBet("red", "Red");
  assert.equal(game.placeBet(red, 0.005), true);
  assert.equal(game.pendingBets.find((bet) => bet.label === "Red").stake, 0.01);
  assert.deepEqual(game.validationErrors(), []);
});

test("outside maximums are individual per wager position", () => {
  const game = new RouletteGame({ startingBalance: 500 });

  assert.equal(game.placeBet(createOutsideBet("red", "Red"), 125), true);
  assert.equal(game.placeBet(createOutsideBet("black", "Black"), 125), true);
  assert.equal(game.placeBet(createOutsideBet("red", "Red"), 0.01), false);
  assert.equal(game.pendingTotal(), 250);
});

test("racetrack neighbours and special bets create the required component bets", () => {
  const game = new RouletteGame({ startingBalance: 100 });

  assert.deepEqual(
    createNeighbourComponents(0).map((component) => component.numbers[0]),
    [3, 26, 0, 32, 15],
  );
  assert.equal(game.placeNeighbours(0, 0.01), true);
  assert.equal(game.pendingBets.length, 5);
  assert.equal(game.pendingTotal(), 0.05);

  game.clearBets();
  assert.equal(game.placeSpecialBet("voisins", 0.01), true);
  assert.equal(SPECIAL_BETS.voisins.components.reduce((total, component) => total + component.units, 0), 9);
  assert.equal(game.pendingTotal(), 0.09);

  game.clearBets();
  assert.equal(game.placeColorSplits("black", 0.01), true);
  assert.equal(game.pendingBets.length, COLOR_SPLITS.black.length);
});

test("saved bets can be saved, replayed, and deleted", () => {
  const game = new RouletteGame({
    startingBalance: 100,
    storage: memoryStorage(),
  });

  assert.equal(place(game, "straight", [17], 2), true);
  const saved = game.saveCurrentBet("Seventeen");
  assert.ok(saved.id);
  assert.equal(game.getSavedBets().length, 1);
  game.clearBets();

  assert.equal(game.replaySavedBet(saved.id), true);
  assert.equal(game.pendingBets[0].label, "17");
  assert.equal(game.pendingBets[0].stake, 2);
  assert.equal(game.deleteSavedBet(saved.id), true);
  assert.equal(game.getSavedBets().length, 0);
});

test("wallet modes share or isolate balances", () => {
  const universal = new CasinoWallet({ mode: "universal", startingBalance: 100 });
  universal.adjustBalance("roulette", 25);
  assert.equal(universal.getBalance("blackjack"), 125);

  const local = new CasinoWallet({ mode: "local", startingBalance: 100 });
  local.adjustBalance("roulette", 25);
  assert.equal(local.getBalance("roulette"), 125);
  assert.equal(local.getBalance("blackjack"), 100);
});
