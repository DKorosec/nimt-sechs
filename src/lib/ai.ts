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

const randomAI: AIStrategyObject = { name: 'random only', create: createRandomAI };
const minAI: AIStrategyObject = { name: 'min only', create: createMinAI };
const maxAI: AIStrategyObject = { name: 'max only', create: createMaxAI };

export { randomAI, minAI, maxAI };
