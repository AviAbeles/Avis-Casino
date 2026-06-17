import { roundMoney } from "./game.js";

export const ROULETTE_MINIMUM = 0.01;

export const EUROPEAN_WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const RED_SET = new Set(RED_NUMBERS);

export const PAYTABLE = {
  redBlack: {
    name: "Red/Black",
    min: 0.01,
    max: 125,
    odds: 1,
    section: "outside",
  },
  oddEven: {
    name: "Odd/Even",
    min: 0.01,
    max: 125,
    odds: 1,
    section: "outside",
  },
  lowHigh: {
    name: "1-18/19-36",
    min: 0.01,
    max: 125,
    odds: 1,
    section: "outside",
  },
  dozen: {
    name: "Dozens and Columns",
    min: 0.01,
    max: 125,
    odds: 2,
    section: "outside",
  },
  column: {
    name: "Dozens and Columns",
    min: 0.01,
    max: 125,
    odds: 2,
    section: "outside",
  },
  straight: {
    name: "Straight Up (one number)",
    min: 0.01,
    max: 125,
    odds: 35,
    section: "inside",
  },
  split: {
    name: "Split (two numbers)",
    min: 0.01,
    max: 250,
    odds: 17,
    section: "inside",
  },
  street: {
    name: "Street (three numbers)",
    min: 0.01,
    max: 375,
    odds: 11,
    section: "inside",
  },
  corner: {
    name: "Corner (four numbers)",
    min: 0.01,
    max: 500,
    odds: 8,
    section: "inside",
  },
  line: {
    name: "Line (six numbers)",
    min: 0.01,
    max: 750,
    odds: 5,
    section: "inside",
  },
};

export const ROULETTE_PAYTABLE_ROWS = [
  ["Red/Black", "£0.01", "£125.00", "1 to 1"],
  ["Odd/Even", "£0.01", "£125.00", "1 to 1"],
  ["1-18/19-36", "£0.01", "£125.00", "1 to 1"],
  ["Dozens and Columns", "£0.01", "£125.00", "2 to 1"],
  ["Straight Up (one number)", "£0.01", "£125.00", "35 to 1"],
  ["Split (two numbers)", "£0.01", "£250.00", "17 to 1"],
  ["Street (three numbers)", "£0.01", "£375.00", "11 to 1"],
  ["Corner (four numbers)", "£0.01", "£500.00", "8 to 1"],
  ["Line (six numbers)", "£0.01", "£750.00", "5 to 1"],
];

export const SPECIAL_BETS = {
  voisins: {
    label: "Voisins du Zero",
    components: [
      { type: "street", numbers: [0, 2, 3], units: 2, label: "0/2/3" },
      { type: "split", numbers: [4, 7], units: 1, label: "4/7" },
      { type: "split", numbers: [12, 15], units: 1, label: "12/15" },
      { type: "split", numbers: [18, 21], units: 1, label: "18/21" },
      { type: "split", numbers: [19, 22], units: 1, label: "19/22" },
      {
        type: "corner",
        numbers: [25, 26, 28, 29],
        units: 2,
        label: "25/26/28/29",
      },
      { type: "split", numbers: [32, 35], units: 1, label: "32/35" },
    ],
  },
  tiers: {
    label: "Tiers du Cylindre",
    components: [
      { type: "split", numbers: [5, 8], units: 1, label: "5/8" },
      { type: "split", numbers: [10, 11], units: 1, label: "10/11" },
      { type: "split", numbers: [13, 16], units: 1, label: "13/16" },
      { type: "split", numbers: [23, 24], units: 1, label: "23/24" },
      { type: "split", numbers: [27, 30], units: 1, label: "27/30" },
      { type: "split", numbers: [33, 36], units: 1, label: "33/36" },
    ],
  },
  orphelins: {
    label: "Orphelins en Plein",
    components: [1, 6, 9, 14, 17, 20, 31, 34].map((number) => ({
      type: "straight",
      numbers: [number],
      units: 1,
      label: String(number),
    })),
  },
  zero: {
    label: "Zero",
    components: [
      { type: "split", numbers: [0, 3], units: 1, label: "0/3" },
      { type: "split", numbers: [12, 15], units: 1, label: "12/15" },
      { type: "straight", numbers: [26], units: 1, label: "26" },
      { type: "split", numbers: [32, 35], units: 1, label: "32/35" },
    ],
  },
};

export const COLOR_SPLITS = {
  red: [
    [9, 12],
    [16, 19],
    [18, 21],
    [27, 30],
  ],
  black: [
    [8, 11],
    [10, 11],
    [10, 13],
    [17, 20],
    [26, 29],
    [28, 29],
    [28, 31],
  ],
};

const SAVED_BETS_KEY = "avis-casino-roulette-saved-bets";

function uniqueNumbers(numbers) {
  return [...new Set(numbers)].sort((left, right) => left - right);
}

function normalizeAmount(value) {
  return roundMoney(Number(value));
}

function assertValidNumbers(numbers) {
  if (!numbers.length) throw new Error("Roulette bet must cover at least one number.");
  for (const number of numbers) {
    if (!Number.isInteger(number) || number < 0 || number > 36) {
      throw new Error(`Invalid roulette number: ${number}`);
    }
  }
}

function makePositionKey(type, numbers, label) {
  return `${type}:${numbers.join("/")}:${label}`;
}

export function getNumberColor(number) {
  if (number === 0) return "green";
  return RED_SET.has(number) ? "red" : "black";
}

export function getDozenNumbers(dozen) {
  const start = (dozen - 1) * 12 + 1;
  return Array.from({ length: 12 }, (_, index) => start + index);
}

export function getColumnNumbers(column) {
  return Array.from({ length: 12 }, (_, index) => column + index * 3);
}

export function getOutsideNumbers(kind) {
  const all = Array.from({ length: 36 }, (_, index) => index + 1);

  if (kind === "red") return [...RED_NUMBERS];
  if (kind === "black") return all.filter((number) => !RED_SET.has(number));
  if (kind === "odd") return all.filter((number) => number % 2 === 1);
  if (kind === "even") return all.filter((number) => number % 2 === 0);
  if (kind === "low") return all.filter((number) => number <= 18);
  if (kind === "high") return all.filter((number) => number >= 19);
  if (kind.startsWith("dozen-")) return getDozenNumbers(Number(kind.at(-1)));
  if (kind.startsWith("column-")) return getColumnNumbers(Number(kind.at(-1)));
  throw new Error(`Unknown outside bet: ${kind}`);
}

export function createBetSpec({ type, label, numbers, section, positionKey }) {
  const paytable = PAYTABLE[type];
  if (!paytable) throw new Error(`Unknown roulette bet type: ${type}`);

  const normalizedNumbers = uniqueNumbers(numbers);
  assertValidNumbers(normalizedNumbers);

  return {
    type,
    label,
    numbers: normalizedNumbers,
    section: section || paytable.section,
    payout: paytable.odds,
    min: paytable.min,
    max: paytable.max,
    positionKey:
      positionKey || makePositionKey(type, normalizedNumbers, label || paytable.name),
  };
}

export function createOutsideBet(kind, label) {
  const type = kind.startsWith("dozen-")
    ? "dozen"
    : kind.startsWith("column-")
      ? "column"
      : ["red", "black"].includes(kind)
        ? "redBlack"
        : ["odd", "even"].includes(kind)
          ? "oddEven"
          : "lowHigh";

  return createBetSpec({
    type,
    label,
    numbers: getOutsideNumbers(kind),
    section: "outside",
    positionKey: `outside:${kind}`,
  });
}

export function getNeighbourNumbers(number, span = 2) {
  const index = EUROPEAN_WHEEL.indexOf(number);
  if (index === -1) throw new Error(`Unknown wheel number: ${number}`);

  const numbers = [];
  for (let offset = -span; offset <= span; offset += 1) {
    const wheelIndex =
      (index + offset + EUROPEAN_WHEEL.length) % EUROPEAN_WHEEL.length;
    numbers.push(EUROPEAN_WHEEL[wheelIndex]);
  }
  return numbers;
}

export function createNeighbourComponents(number, span = 2) {
  return getNeighbourNumbers(number, span).map((neighbour) => ({
    type: "straight",
    numbers: [neighbour],
    units: 1,
    label: String(neighbour),
  }));
}

export class CasinoWallet {
  constructor({
    mode = "universal",
    startingBalance = 1000,
    games = ["blackjack", "roulette"],
  } = {}) {
    this.games = games;
    this.configure({ mode, startingBalance });
  }

  configure({ mode = "universal", startingBalance = 1000 } = {}) {
    if (!["universal", "local"].includes(mode)) {
      throw new Error("Wallet mode must be universal or local.");
    }

    const balance = normalizeAmount(startingBalance);
    this.mode = mode;
    this.universalBalance = balance;
    this.localBalances = Object.fromEntries(
      this.games.map((game) => [game, balance]),
    );
  }

  getBalance(game) {
    return this.mode === "universal"
      ? this.universalBalance
      : this.localBalances[game];
  }

  setBalance(game, amount) {
    const balance = normalizeAmount(amount);
    if (this.mode === "universal") this.universalBalance = balance;
    else this.localBalances[game] = balance;
  }

  adjustBalance(game, amount) {
    this.setBalance(game, this.getBalance(game) + Number(amount));
    return this.getBalance(game);
  }
}

export class RouletteGame {
  constructor({
    startingBalance = 1000,
    random = Math.random,
    storage = null,
  } = {}) {
    this.random = random;
    this.storage = storage;
    this.startingBalance = normalizeAmount(startingBalance);
    this.resetSessionState();
  }

  resetSessionState() {
    this.balance = this.startingBalance;
    this.pendingBets = [];
    this.betStack = [];
    this.history = [];
    this.phase = "betting";
    this.result = null;
    this.lastSpin = null;
    this.roundStartBalance = this.balance;
    this.message = "Place inside or outside bets, then spin.";
  }

  configureSession({ startingBalance }) {
    this.startingBalance = normalizeAmount(startingBalance);
    this.resetSessionState();
  }

  setBalance(balance) {
    this.balance = normalizeAmount(balance);
    if (this.pendingTotal() > this.balance) {
      this.clearBets();
    }
  }

  pendingTotal() {
    return roundMoney(
      this.pendingBets.reduce((total, bet) => total + bet.stake, 0),
    );
  }

  insideTotal() {
    return roundMoney(
      this.pendingBets
        .filter((bet) => bet.section === "inside")
        .reduce((total, bet) => total + bet.stake, 0),
    );
  }

  validationErrors() {
    const errors = [];
    if (this.pendingTotal() > this.balance) {
      errors.push("Total stake is above the current balance.");
    }

    if (this.insideTotal() > 0 && this.insideTotal() < ROULETTE_MINIMUM) {
      errors.push("Inside bets must total at least £0.01.");
    }

    for (const bet of this.pendingBets) {
      if (bet.section === "outside" && bet.stake < bet.min) {
        errors.push(`${bet.label} must be at least £0.01.`);
      }
      if (bet.stake > bet.max) {
        errors.push(`${bet.label} is above the maximum.`);
      }
    }

    return errors;
  }

  canSpin() {
    return (
      ["betting", "round-over"].includes(this.phase) &&
      this.pendingTotal() > 0 &&
      this.validationErrors().length === 0
    );
  }

  placeBet(spec, chipValue, { exact = false } = {}) {
    if (!["betting", "round-over"].includes(this.phase)) return false;

    const betSpec = createBetSpec(spec);
    const existing = this.pendingBets.find(
      (bet) => bet.positionKey === betSpec.positionKey,
    );
    const rawAmount = normalizeAmount(chipValue);
    const amount = exact || existing ? rawAmount : Math.max(rawAmount, betSpec.min);

    if (!Number.isFinite(amount) || amount <= 0) return false;
    const nextStake = roundMoney((existing?.stake || 0) + amount);
    if (nextStake > betSpec.max) return false;
    if (roundMoney(this.pendingTotal() + amount) > this.balance) return false;

    if (existing) {
      existing.stake = nextStake;
    } else {
      this.pendingBets.push({
        ...betSpec,
        id: betSpec.positionKey,
        stake: roundMoney(amount),
      });
    }

    this.betStack.push({ positionKey: betSpec.positionKey, amount });
    this.phase = "betting";
    this.result = null;
    this.message = "Bets ready. Spin when you are set.";
    return true;
  }

  placeComponents(components, chipValue) {
    const snapshot = this.snapshotPending();

    for (const component of components) {
      const units = component.units || 1;
      const placed = this.placeBet(
        {
          type: component.type,
          label: component.label,
          numbers: component.numbers,
          section: PAYTABLE[component.type].section,
        },
        roundMoney(Number(chipValue) * units),
      );
      if (!placed) {
        this.restorePending(snapshot);
        return false;
      }
    }

    return true;
  }

  placeSpecialBet(name, chipValue) {
    const special = SPECIAL_BETS[name];
    if (!special) return false;
    return this.placeComponents(special.components, chipValue);
  }

  placeNeighbours(number, chipValue) {
    return this.placeComponents(createNeighbourComponents(number), chipValue);
  }

  placeColorSplits(color, chipValue) {
    const splits = COLOR_SPLITS[color];
    if (!splits) return false;
    return this.placeComponents(
      splits.map((numbers) => ({
        type: "split",
        numbers,
        units: 1,
        label: numbers.join("/"),
      })),
      chipValue,
    );
  }

  undoBet() {
    if (!["betting", "round-over"].includes(this.phase)) return false;
    const last = this.betStack.pop();
    if (!last) return false;

    const bet = this.pendingBets.find(
      (pending) => pending.positionKey === last.positionKey,
    );
    if (!bet) return false;

    bet.stake = roundMoney(bet.stake - last.amount);
    if (bet.stake <= 0) {
      this.pendingBets = this.pendingBets.filter(
        (pending) => pending.positionKey !== last.positionKey,
      );
    }
    return true;
  }

  clearBets() {
    if (!["betting", "round-over"].includes(this.phase)) return false;
    if (!this.pendingBets.length) return false;
    this.pendingBets = [];
    this.betStack = [];
    return true;
  }

  spin(forcedNumber = null) {
    if (!this.canSpin()) return false;

    const winningNumber =
      forcedNumber ?? EUROPEAN_WHEEL[Math.floor(this.random() * EUROPEAN_WHEEL.length)];
    if (!EUROPEAN_WHEEL.includes(winningNumber)) {
      throw new Error("Malfunction: invalid roulette result.");
    }

    this.roundStartBalance = this.balance;
    const settledBets = this.pendingBets.map((bet) => ({ ...bet }));
    const totalStake = this.pendingTotal();
    this.balance = roundMoney(this.balance - totalStake);

    const winningBets = [];
    for (const bet of settledBets) {
      if (!bet.numbers.includes(winningNumber)) continue;
      const returned = roundMoney(bet.stake * (bet.payout + 1));
      this.balance = roundMoney(this.balance + returned);
      winningBets.push({ ...bet, returned });
    }

    const net = roundMoney(this.balance - this.roundStartBalance);
    this.result = net > 0 ? "win" : "loss";
    this.phase = "round-over";
    this.lastSpin = {
      number: winningNumber,
      color: getNumberColor(winningNumber),
      totalStake,
      winningBets,
      amount: net,
    };
    this.message =
      winningBets.length > 0
        ? `${winningNumber} wins. ${winningBets.length} bet${winningBets.length === 1 ? "" : "s"} paid.`
        : `${winningNumber} wins. No winning bets.`;
    this.history.unshift({
      result: this.result,
      label: `${winningNumber} ${this.lastSpin.color}`,
      amount: net,
      totalStake,
      winningBets: winningBets.length,
    });
    this.history = this.history.slice(0, 8);
    this.pendingBets = [];
    this.betStack = [];
    return this.lastSpin;
  }

  voidSpin() {
    this.balance = this.roundStartBalance;
    this.pendingBets = [];
    this.betStack = [];
    this.phase = "round-over";
    this.result = "push";
    this.lastSpin = null;
    this.message = "Malfunction voids all pays and plays.";
  }

  snapshotPending() {
    return {
      pendingBets: this.pendingBets.map((bet) => ({ ...bet })),
      betStack: this.betStack.map((entry) => ({ ...entry })),
      phase: this.phase,
      result: this.result,
      message: this.message,
    };
  }

  restorePending(snapshot) {
    this.pendingBets = snapshot.pendingBets.map((bet) => ({ ...bet }));
    this.betStack = snapshot.betStack.map((entry) => ({ ...entry }));
    this.phase = snapshot.phase;
    this.result = snapshot.result;
    this.message = snapshot.message;
  }

  getSavedBets() {
    if (!this.storage) return [];
    try {
      const saved = JSON.parse(this.storage.getItem(SAVED_BETS_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  writeSavedBets(savedBets) {
    if (!this.storage) return;
    this.storage.setItem(SAVED_BETS_KEY, JSON.stringify(savedBets));
  }

  saveCurrentBet(name = "Saved bet") {
    if (!this.pendingBets.length) return null;

    const savedBets = this.getSavedBets();
    const savedBet = {
      id: `bet-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      bets: this.pendingBets.map((bet) => ({
        type: bet.type,
        label: bet.label,
        numbers: bet.numbers,
        section: bet.section,
        stake: bet.stake,
        positionKey: bet.positionKey,
      })),
    };
    savedBets.unshift(savedBet);
    this.writeSavedBets(savedBets.slice(0, 12));
    return savedBet;
  }

  deleteSavedBet(id) {
    const savedBets = this.getSavedBets();
    const nextSavedBets = savedBets.filter((bet) => bet.id !== id);
    this.writeSavedBets(nextSavedBets);
    return nextSavedBets.length !== savedBets.length;
  }

  replaySavedBet(id) {
    const savedBet = this.getSavedBets().find((bet) => bet.id === id);
    if (!savedBet) return false;

    const snapshot = this.snapshotPending();
    for (const bet of savedBet.bets) {
      const placed = this.placeBet(
        {
          type: bet.type,
          label: bet.label,
          numbers: bet.numbers,
          section: bet.section,
          positionKey: bet.positionKey,
        },
        bet.stake,
        { exact: true },
      );
      if (!placed) {
        this.restorePending(snapshot);
        return false;
      }
    }
    return true;
  }
}
