import { ICard } from "./cards";

export type ICardsStack = Array<ICard[]>

export interface IBoard {
    stacks: ICard[][];
    setInitialCards(cards: ICard[]): void;
    sortStacks(): void;
    canStackAcceptCard(stackIdx: number, card: ICard): boolean;
    stackWorth(stackIdx: number): number;
    putCard(card: ICard, onStackSwap: (stack: ICardsStack) => number): {
        retrieved: ICard[];
    };
    getMaxStackSize(): number;
    isStackFull(stackIndex: number): boolean;
    getMaxCardNumber(): number;
    getStackTopLimit(stackIdx: number): number;
}

export function createBoard(maxCardNumber: number): IBoard {
    const MAX_STACK_SIZE = 5;
    return {
        stacks: [],
        getMaxCardNumber(): number {
            return maxCardNumber;
        },
        getMaxStackSize() {
            return MAX_STACK_SIZE;
        },
        isStackFull(stackIndex: number): boolean {
            return this.stacks[stackIndex].length >= MAX_STACK_SIZE;
        },
        setInitialCards(cards: ICard[]): void {
            for (const card of cards) {
                this.stacks.push([card]);
            }
            this.sortStacks();
        },
        getStackTopLimit(stackIdx: number): number {
            return (this.stacks[stackIdx + 1] ?? [[{ number: maxCardNumber + 1, points: 0 }]]).at(-1)!.number - 1;

        },
        canStackAcceptCard(stackIdx: number, card: ICard): boolean {
            const curr = this.stacks[stackIdx].at(-1)!.number;
            const next = this.stacks[stackIdx + 1]?.at(-1)!.number ?? Number.POSITIVE_INFINITY;
            return curr < card.number && card.number < next;
        },
        stackWorth(stackIdx: number): number {
            return this.stacks[stackIdx].reduce((acc, curr) => acc + curr.points, 0);
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