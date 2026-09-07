export type RawOutcome = "B" | "P" | "T" | "D7";

export interface ShoeResult {
  results: RawOutcome[];
  cardsRemaining: number;
  cutCardTriggered: boolean;
}

export class EZBaccaratEngine {
  private cards: number[] = [];
  private cutCardIndex = 15;
  private cutCardTriggered = false;

  private readonly values = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10,
  ];

  constructor() {
    this.resetShoe();
  }

  /**
   * Creates a fresh 8-deck shoe.
   * 8 × 52 = 416 cards.
   */
  resetShoe(): void {
    this.cards = [];

    for (let deck = 0; deck < 8; deck++) {
      for (let suit = 0; suit < 4; suit++) {
        for (const value of this.values) {
          this.cards.push(value);
        }
      }
    }

    this.shuffle();

    // Burn card
    const burnValue = this.cards.shift();

    if (burnValue !== undefined) {
      const burnCount = burnValue >= 10 ? 10 : burnValue;

      for (let i = 0; i < burnCount; i++) {
        if (this.cards.length > 0) {
          this.cards.shift();
        }
      }
    }

    // Cut card approximately 14–16 cards from bottom
    this.cutCardIndex = this.randomInt(14, 16);
    this.cutCardTriggered = false;
  }

  private shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.cards[i], this.cards[j]] = [
        this.cards[j],
        this.cards[i],
      ];
    }
  }

  private randomInt(min: number, max: number): number {
    return (
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  }

  /**
   * Baccarat card value.
   * 10/J/Q/K = 0.
   */
  private getCardValue(card: number): number {
    return card < 10 ? card : 0;
  }

  /**
   * Execute one EZ Baccarat hand.
   */
  playHand(): RawOutcome | null {
    if (this.cards.length < 6) {
      return null;
    }

    // Check whether the cut card has been reached.
    if (this.cards.length <= this.cutCardIndex) {
      this.cutCardTriggered = true;
    }

    const p1 = this.cards.shift()!;
    const b1 = this.cards.shift()!;
    const p2 = this.cards.shift()!;
    const b2 = this.cards.shift()!;

    let playerScore =
      (this.getCardValue(p1) +
        this.getCardValue(p2)) %
      10;

    let bankerScore =
      (this.getCardValue(b1) +
        this.getCardValue(b2)) %
      10;

    // Natural 8 or 9
    if (playerScore >= 8 || bankerScore >= 8) {
      return this.evaluateResult(
        playerScore,
        bankerScore,
        false,
        0,
      );
    }

    // Player third card
    let playerThird: number | null = null;

    if (playerScore <= 5) {
      playerThird = this.cards.shift()!;

      playerScore =
        (playerScore +
          this.getCardValue(playerThird)) %
        10;
    }

    // Banker third-card rules
    let bankerThirdDrawn = false;
    let bankerThirdValue = 0;

    if (playerThird === null) {
      // Player stands.
      if (bankerScore <= 5) {
        bankerThirdDrawn = true;
      }
    } else {
      const playerThirdValue =
        this.getCardValue(playerThird);

      if (bankerScore <= 2) {
        bankerThirdDrawn = true;
      } else if (
        bankerScore === 3 &&
        playerThirdValue !== 8
      ) {
        bankerThirdDrawn = true;
      } else if (
        bankerScore === 4 &&
        [2, 3, 4, 5, 6, 7].includes(
          playerThirdValue,
        )
      ) {
        bankerThirdDrawn = true;
      } else if (
        bankerScore === 5 &&
        [4, 5, 6, 7].includes(
          playerThirdValue,
        )
      ) {
        bankerThirdDrawn = true;
      } else if (
        bankerScore === 6 &&
        [6, 7].includes(playerThirdValue)
      ) {
        bankerThirdDrawn = true;
      }
    }

    if (bankerThirdDrawn && this.cards.length > 0) {
      const bankerThird = this.cards.shift()!;

      bankerThirdValue =
        this.getCardValue(bankerThird);

      bankerScore =
        (bankerScore + bankerThirdValue) % 10;
    }

    return this.evaluateResult(
      playerScore,
      bankerScore,
      bankerThirdDrawn,
      bankerThirdValue,
    );
  }

  /**
   * EZ Baccarat Dragon 7 rule.
   *
   * Banker wins with a 3-card total of 7.
   * This is returned separately as D7 so the
   * analyzer can decide whether to treat it
   * as Banker or Tie.
   */
  private evaluateResult(
    playerScore: number,
    bankerScore: number,
    bankerThirdDrawn: boolean,
    _bankerThirdValue: number,
  ): RawOutcome {
    if (
      bankerScore === 7 &&
      bankerThirdDrawn &&
      playerScore < 7
    ) {
      return "D7";
    }

    if (bankerScore > playerScore) {
      return "B";
    }

    if (playerScore > bankerScore) {
      return "P";
    }

    return "T";
  }

  /**
   * Simulates one complete shoe.
   */
  simulateShoe(): ShoeResult {
    this.resetShoe();

    const results: RawOutcome[] = [];

    while (
      !this.cutCardTriggered &&
      this.cards.length >= 6
    ) {
      const result = this.playHand();

      if (result !== null) {
        results.push(result);
      }
    }

    return {
      results,
      cardsRemaining: this.cards.length,
      cutCardTriggered: this.cutCardTriggered,
    };
  }
}
