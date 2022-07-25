import { ICard } from "./cards";

export type ICardsStack = Array<ICard[]>

export interface IBoard {
    stacks: ICard[][];
    setInitialCards(cards: ICard[]): void;
    sortStacks(): void;
    putCard(card: ICard, onStackSwap: (stack: ICardsStack) => number): {
        retrieved: ICard[];
    };
}

export function createBoard(): IBoard {
    const MAX_STACK_SIZE = 5;
    return {
        stacks: [],
        setInitialCards(cards: ICard[]): void {
            for (const card of cards) {
                this.stacks.push([card]);
            }
            this.sortStacks();
        },
        sortStacks(): void {
            this.stacks.sort((a, b) => a[a.length - 1].number - b[b.length - 1].number)
        },
        putCard(card: ICard, onStackSwap: (stack: ICardsStack) => number): { retrieved: ICard[] } {
            for (let i = this.stacks.length - 1; i >= 0; i--) {
                const stack = this.stacks[i]
                if (card.number > stack.at(-1)!.number) {
                    if (stack.length >= MAX_STACK_SIZE) {
                        this.stacks[i] = [card];
                        return { retrieved: stack }
                    }
                    stack.push(card);
                    return { retrieved: [] }
                }
            }
            // TO LOW (less than smallest stack)
            // pick which stack to take.
            const i = onStackSwap(this.stacks);
            const retrieved = this.stacks[i];
            this.stacks[i] = [card];
            //as player can took any stack if lowest number is given, we have to keep the order
            this.sortStacks();
            return { retrieved };
        }
    }
}