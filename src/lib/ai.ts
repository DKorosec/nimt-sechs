import type { IBoard } from "./board";
import type { ICard } from "./cards";
import type { IPlayer } from "./player";
import { minIndex } from "./utils";



export interface IStrategyAI {
    pickCard(board: IBoard): ICard;
    onBoardStackSwap(stacks: IBoard['stacks']): number;
}

export interface AIStrategyObject {
    name: string;
    create: (player: IPlayer) => IStrategyAI
}

const sumStack = (stack: IBoard['stacks'][0]) => stack.reduce((acc, cur) => acc + cur.points, 0);

function createRandomAI(player: IPlayer): IStrategyAI {
    return {
        pickCard(_board) {
            // don't think about the board, just stupid random first.
            const rPick = Math.trunc(Math.random() * player.countCards());
            const pCard = player.removeCard(player.peekCard(rPick).number);
            return pCard;
        },
        onBoardStackSwap(stacks): number {
            // take the stack with lowest penalty. Maybe the best, but it could be that your card now fucks 
            // with your options for following rounds?
            return minIndex(stacks, sumStack);
        }
    }
}

function createMinAI(player: IPlayer): IStrategyAI {
    return {
        pickCard(_board) {
            // don't think about the board, just stupid lowest first.
            const pCard = player.removeCard(player.peekCard(0).number);
            return pCard;
        },
        onBoardStackSwap(stacks) {
            // take the stack with lowest penalty. Maybe the best, but it could be that your card now fucks 
            // with your options for following rounds?
            return minIndex(stacks, sumStack);
        }
    }
}

function createMaxAI(player: IPlayer): IStrategyAI {
    return {
        pickCard(_board) {
            // don't think about the board, just stupid highest first.
            const pCard = player.removeCard(player.peekCard(-1).number);
            return pCard;
        },
        onBoardStackSwap(stacks) {
            // take the stack with lowest penalty. Maybe the best, but it could be that your card now fucks 
            // with your options for following rounds?
            return minIndex(stacks, sumStack);
        }
    }
}

function createSomeSenseAI(player: IPlayer): IStrategyAI {
    return {
        pickCard(board) {
            const cardOptions = player.hands.map(card => {
                for (let sti = 0; sti < board.stacks.length; sti++) {
                    if (board.canStackAcceptCard(sti, card)) {
                        return {
                            card,
                            accept: true,
                            causeStackSwap: board.isStackFull(sti),
                            stackIdx: sti,
                            stackSize: board.stacks[sti].length,
                            stackWorth: board.stackWorth(sti),
                            diffNext: board.getStackTopLimit(sti) - card.number
                        };
                    }
                }
                return {
                    card,
                    accept: false,
                    isSwapCard: true
                }
            });
            const probablySafeOpt = cardOptions.filter(opt => opt.accept && !opt.causeStackSwap).sort((a, b) => a.card.number - b.card.number)[0];
            if (probablySafeOpt) {
                return player.removeCard(probablySafeOpt.card.number);
            }
            // pick the best card for stack (the highest, and hope others will fuck up instead of you, h3h3)
            const probablyDangerousYoloOpt = cardOptions.filter(opt => opt.accept && opt.causeStackSwap).sort((a, b) => a.diffNext! - b.diffNext!)[0];
            if (probablyDangerousYoloOpt) {
                return player.removeCard(probablyDangerousYoloOpt.card.number);
            }
            //use one of your low cards to make a swap.
            const playLowAndSwap = cardOptions.filter(opt => opt.isSwapCard).sort((a, b) => a.card.number - b.card.number)[0];
            if(playLowAndSwap) {
                return player.removeCard(playLowAndSwap.card.number);
            }
            throw new Error('This should not happen. If it did, then either the program is wrong or your computer needs an exorcists');
        },
        onBoardStackSwap(stacks) {
            // TODO improve: look at your cards and select the best deck that could fit your swap.
            // but until then, be human, be greedy.
            return minIndex(stacks, sumStack);
        }
    }
}

const randomAI: AIStrategyObject = { name: 'random only', create: createRandomAI };
const minAI: AIStrategyObject = { name: 'min only', create: createMinAI };
const maxAI: AIStrategyObject = { name: 'max only', create: createMaxAI };
const someSenseAI: AIStrategyObject = { name: 'some sense', create: createSomeSenseAI };

export { randomAI, minAI, maxAI, someSenseAI };
