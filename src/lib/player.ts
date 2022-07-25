import type { IStrategyAI } from "./ai";
import { ICard } from "./cards";

export interface IPlayer {
    pile: ICard[];
    hands: ICard[];
    ai: IStrategyAI | null;
    sumPile(): number;
    hasNoCards(): boolean;
    peekCard(i: number): ICard;
    countCards(): number;
    sortHands(): void;
    addCard(card: ICard): void;
    removeCard(cardNumber: number): ICard;
}

export function createPlayer(aiDependency: null | ((p: IPlayer) => IStrategyAI)): IPlayer {
    const player: IPlayer = {
        pile: [],
        hands: [],
        ai: null,
        sumPile(): number {
            return this.pile.reduce((a, c) => a + c.points, 0)
        },
        hasNoCards(): boolean {
            return this.countCards() === 0;
        },
        peekCard(i: number): ICard {
            i = (i < 0 ? this.hands.length : 0) + i;
            return this.hands[i];
        },
        countCards(): number {
            return this.hands.length;
        },
        sortHands(): void {
            this.hands.sort((a, b) => a.number - b.number)
        },
        addCard(card: ICard): void {
            this.hands.push(card);
        },
        removeCard(cardNumber: number): ICard {
            const rest = this.hands.filter(c => c.number !== cardNumber);
            const [curr] = this.hands.filter(c => c.number === cardNumber);
            this.hands = rest;
            return curr;
        }
    }
    player.ai = aiDependency?.(player) ?? null;
    return player;
}
