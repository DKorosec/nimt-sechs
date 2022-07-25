function byBestIndex<T>(array: T[], isCurrToBestBetter: (curr: number, best: number) => boolean, evaluate: (el: T) => number = (el) => +el): number {
    const mapped = array.map(evaluate);
    let idx = 0;
    for (let i = 1; i < array.length; i++) {
        if (isCurrToBestBetter(mapped[i], mapped[idx])) {
            idx = i;
        }
    }
    return idx;
}

export function minIndex<T>(array: T[], evaluate: (el: T) => number = (el) => +el): number {
    return byBestIndex(array, (curr, best) => curr < best, evaluate);
}

export function maxIndex<T>(array: T[], evaluate: (el: T) => number = (el) => +el): number {
    return byBestIndex(array, (curr, best) => curr > best, evaluate);
}

export function fairShuffle<T>(array: T[]): T[] {
    for (let i = 0; i < array.length; i++) {
        const range = array.length - i;
        const rRange = Math.trunc(Math.random() * range);
        const j = i + rRange;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
