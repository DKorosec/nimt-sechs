export interface ICard {
    number: number;
    points: number;
}

export function generateCards(N: number): ICard[] {
    return new Array(N).fill(undefined).map((_, i) => ({
        number: i + 1,
        points: (Math.trunc(i / 2) % 3) + 1
    }));
}