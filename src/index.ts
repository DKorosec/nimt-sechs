import fs from 'fs';
import { maxAI, minAI, randomAI } from "./lib/ai";
import { createBoard, IBoard } from "./lib/board";
import { generateCards } from "./lib/cards";
import { createPlayer, IPlayer } from "./lib/player";
import { applyPartialStatistics, gameStatsToCSV, initializeStatistics } from "./lib/stats";
import { fairShuffle } from "./lib/utils";


function printGameState(players: IPlayer[], board: IBoard) {
    for (let i = 0; i < players.length; i++) {
        console.log('player #', i + 1, 'piled:', players[i].pile.reduce((a, c) => a + c.points, 0));
        console.dir(players[i].hands, { depth: null });
    }
    console.log('board:')
    console.log(board.stacks, { depth: null });
    console.log('-'.repeat(12));
}

function runSimulation({ players, verboseLogging, game }: {
    players: IPlayer[], verboseLogging: boolean, game: {
        totalCardsCount: number;
        cardsPerPlayerCount: number;
        cardStacksCount: number;
    }
}) {
    const { totalCardsCount, cardsPerPlayerCount, cardStacksCount } = game;
    const cards = generateCards(totalCardsCount);
    const board = createBoard();
    fairShuffle(cards);
    board.setInitialCards(new Array(cardStacksCount).fill(undefined).map(() => cards.shift()!));
    for (const p of players) {
        for (let i = 0; i < cardsPerPlayerCount; i++) {
            p.addCard(cards.shift()!);
        }
        p.sortHands();
    }
    // simulator steps:
    // all players pick a card based on state
    // sort order of playing them from lowest on the table to the highest
    // apply cards to board and run iteration per card on table (in order lowest -> highest)
    // check if all players have put on all of their cards, if not - repeat
    const VL = (exec: () => unknown) => verboseLogging ? exec() : undefined;
    VL(() => console.log('#initial board state:'));
    VL(() => printGameState(players, board));
    while (players.every(p => !p.hasNoCards())) {
        VL(() => console.log('#picking cards...\n'))
        const choicesOrder = players.map((p, i) => {
            const pCard = p.ai!.pickCard(board);
            VL(() => console.log('player #', i + 1, 'picked', pCard.number));
            return { p, pCard, pIndex: i };
        }).sort((a, b) => a.pCard.number - b.pCard.number);
        VL(() => console.log('#putting cards...\n'))
        for (const choice of choicesOrder) {
            VL(() => console.log('player #', choice.pIndex + 1, 'put card', choice.pCard.number));
            const { retrieved } = board.putCard(choice.pCard, choice.p.ai!.onBoardStackSwap);
            VL(() => console.log('and retrieved ...', retrieved.map(c => c.number)));
            choice.p.pile.push(...retrieved);
        }

        VL(() => {
            console.log('#one cycle completed');
            printGameState(players, board);
        })
    }
    VL(() => console.log('!#game ended'))
    return { players, board };
}

function main() {
    const gameIts = 1000;
    const totalCardsCount = 60
    const cardsPerPlayerCount = 8;
    const cardStacksCount = 4;
    const aiPlayerStrategies = [randomAI, minAI, maxAI];
    const data = initializeStatistics(aiPlayerStrategies)
    for (let i = 0; i < gameIts; i++) {
        const players = aiPlayerStrategies.map((strategy) => createPlayer(strategy.create));
        runSimulation({ verboseLogging: false, players, game: { totalCardsCount, cardsPerPlayerCount, cardStacksCount } });
        applyPartialStatistics(data, players);
    }
    fs.writeFileSync('./out/game-analysis.csv', gameStatsToCSV(data), { encoding: 'utf8' });
    data.forEach(pEntry => {
        console.log(pEntry.metadata.aiName)
        console.log('total points:', pEntry.history.at(-1)!.pileAcc, 'total wins:', pEntry.history.at(-1)!.best, 'total worst:', pEntry.history.at(-1)!.worst);
    });
}

main();