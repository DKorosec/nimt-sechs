import type { AIStrategyObject } from "./ai";
import type { IPlayer } from "./player";

export type IStats = {
    metadata: {
        aiName: string
    },
    history: {
        pile: number; pileAcc: number; worst: number; best: number; win: number, lose: number
    }[]
}[]

export function initializeStatistics(aiDescriptors: AIStrategyObject[]): IStats {
    return aiDescriptors.map((descriptor) => ({ metadata: { aiName: descriptor.name }, history: [] }));
}

export function applyPartialStatistics(data: IStats, players: IPlayer[]) {
    for (let j = 0; j < players.length; j++) {
        const psum = players[j].sumPile();
        const prev = data[j].history.at(-1);
        data[j].history.push({
            pile: psum,
            pileAcc: (prev?.pileAcc ?? 0) + psum,
            // added later. keep only prev.
            worst: (prev?.worst ?? 0),
            best: (prev?.best ?? 0),
            win: 0,
            lose: 0
        });
    }
    const pointsMaps = new Map<number, number[]>(data.map(player => [player.history.at(-1)!.pile, []]));
    if (pointsMaps.size === 1) {
        data.forEach(player => {
            const lastStats = player.history.at(-1)!;
            lastStats.best++
            lastStats.win = 1;
        });
    } else {
        data.forEach((player, i) => pointsMaps.get(player.history.at(-1)!.pile)!.push(i));
        const maxPile = Math.max(...data.map(player => player.history.at(-1)!.pile));
        const minPile = Math.min(...data.map(player => player.history.at(-1)!.pile));
        pointsMaps.get(minPile)!.forEach((playerIdx) => {
            const lastStats = data[playerIdx].history.at(-1)!;
            lastStats.best++;
            lastStats.win = 1;
        });
        pointsMaps.get(maxPile)!.forEach((playerIdx) => {
            const lastStats = data[playerIdx].history.at(-1)!;
            lastStats.worst++;
            lastStats.win = 1;
            lastStats.lose = 1;
        });
    }
}


export function gameStatsToCSV(data: IStats): string {
    let csvStr = '';
    const s = data[0].history.length;
    csvStr += data.map((entry, i) => `"${entry.metadata.aiName}" #${i + 1}`).join(',') + '\n';
    for (let i = 0; i < s; i++) {
        let row = '';
        for (const p of data) {
            row += p.history[i].pileAcc.toString() + ',';
        }
        //remove ','
        csvStr += row.substring(0, row.length - 1) + '\n';
    }
    return csvStr;
}