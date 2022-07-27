Prerequisites to setup the project: 
1. [Node.js](https://nodejs.org/en/download/) installed (version 16 or higher) 
2. Initialize the repository by running the following command inside of it:

> npm install

3. Build / translate given source code in `src` by running 
> npm run build

4. After previous step has completed a `built` folder will appear or get updated with fresh translation of `src`'s folder code.

5. (Optional) you can watch for code changes by running command below, which will update your built folder on each change inside `src` folder.

>npm run watch 


6. Execute program entry point by running 

> npm start

7. Last but not least, remember to use linter (and fix its complaints) before pushing changes to origin. 

> npm run lint 

---

# How to add AI?

navigate to `src/lib/ai.ts` and take a look at function implementations which yield `IStrategyAI` object.

- `pickCard` method gets called when the AI needs to select a card to put on the board (that has stacks of cards). Should return the card from `player.removeCard` method.
    -  yes, you can currently cheat (don't need to point out the exploit), but I will prevent that in the future. Just play nice by the rules.. or else you'll go to the naughty list ;)

- `onBoardStackSwap` method gets called when the card, that AI picked in `pickCard` method, caused game-play rule to swap the card with any given stack. Should return 0-based index of the stack to swap with.
    - probably can be exploited as well, but I won't repeat myself what I said in former point.

At the bottom of the file, after you've implemented an AI function add it to the exported objects. When running the simulation with `npm start` (don't forget to built project on changes!), an emulation will be ran (with all detected exported AIs) and create CSV file output in `out/game-analysis.csv`. It will also print into stdout game stats, that will look something like this:

```
#1 Place!
some sense
total points: 98261 total wins: 3587 total worst: 2067
#2 Place!
random only
total points: 113688 total wins: 2679 total worst: 2521
#3 Place!
max only
total points: 118270 total wins: 2312 total worst: 2581
#4 Place!
min only
total points: 131249 total wins: 2165 total worst: 3316
```