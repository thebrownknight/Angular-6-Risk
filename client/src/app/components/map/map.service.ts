import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { standardMap } from '../../../assets/scripts/maps';
import { Utils } from '../../services/utils';
import { DiceService } from './dice.service';
import { Player, TurnType, Record } from '../../helpers/data-models';

/* https://stackoverflow.com/questions/42396804/how-to-write-a-service-constructor-that-requires-parameters-in-angular-2 */

@Injectable()
export class MapService {
    // Counter for player in players array
    private currentPlayerIndex = 0;
    private activeGameID: any;
    private activeMap: any;
    private assignedTerritories: Array<any> = [];
    private gamePlayers: Array<Player> = [];

    private gameState: Array<any> = [];
    private gameLog: Array<Record> = [];

    // Variables for emitting game log activity
    private eventSource = new Subject<any>();
    gameLogUpdates$ = this.eventSource.asObservable();

    // Variables for emitting game state activity
    private gameStateEventSource = new BehaviorSubject<any>(null);
    gameStateUpdates$ = this.gameStateEventSource.asObservable();

    constructor(
        private utils: Utils,
        private diceService: DiceService
    ) { }

    /**
     * Getters and setters
     */
    public setGameConfiguration(config: any) {
        this.activeGameID = config.gameID;
        this.gamePlayers = config.gamePlayers as Array<Player>;
        const map = config.map;

        switch (map) {
            case 'standard':
                this.activeMap = standardMap;
                break;
            case 'united_states':
                this.activeMap = 'united_states';
                break;
            default:
                this.activeMap = standardMap;
                break;
        }
    }

    /**
     * Verify that the game code exists within the database.
     *
     * Params:
     * 1) code: string
     *
     * Returns Observable with game if code exists otherwise null.
     */
    public verifyGameCode(code: string): Observable<any> {
        return this.utils.sendRequest('get', '/api/games/code/' + code);
    }

    /**
     * Assign the territories randomly (for now) to the players.
     *
     * Params:
     * @param players: Array<any> -- array of player objects in the game
     *
     * Returns an object with the game meta information, current state of board
     * and all assignments added to the log.
     */
    public assignTerritories(players: Array<Player>): any {
        // We'll be pushing our information into here and then sending them
        // to the backend route to handle adding to db
        // const gameState = [];

        // Populate the gameState array with the objects for each player since
        // these objects themselves won't be changing, just the territoryMeta inside
        players.forEach((player, index) => {
            const playerStateObj = {
                player: player.playerInformation._id, // for player reference
                status: (index === 0) ? 'CURRENTTURN' : 'WAITING',  // initial player status
                // turnOrder: (index + 1), // player's turn order
                territoryMeta: [],  // list of territories the player controls
                cards: [] // cards the player has received from successful attacks
            };

            this.gameState.push(playerStateObj);
        });

        // Distribution logic
        // 1. We go through each region, grab the number of territories and divide
        // it by the number of players so we know roughly how many territories
        // each person should get
        // 2.
        this.activeMap.regions.forEach((region) => {
            // Get reference to territories in region as an array
            const regionTerritories = Object.keys(region.territories);

            // Rough number of territories each player should be receiving
            // per region
            const numTerritoriesPerPlayer = Math.floor(regionTerritories.length / players.length);

            // Randomly select a territory to assign to a player
            // const randomTerritory = this.getRandomTerritory(region.territories);

            // Shuffle the list of territories so we can just loop through and assign
            const shuffledTerritories = this.shuffleTerritories(Object.keys(region.territories));

            shuffledTerritories.forEach((randTerritory) => {
                // Assign the territory to the player
                this.gameState[this.currentPlayerIndex].territoryMeta.push({
                    id: randTerritory,
                    troops: 3
                });

                const gameLogRecord = {} as Record;
                gameLogRecord.playerDetails = players[this.currentPlayerIndex];
                gameLogRecord.turnType = TurnType.GetTroops;
                gameLogRecord.data = {
                    id: randTerritory,
                    territoryName: this.getName(randTerritory),
                    troops: 3
                };

                // console.log(gameLogRecord);

                // Add to the game log
                // Player is getting troops at this point, start with 3 in each territory
                this.addToGameLog([gameLogRecord]);

                this.assignedTerritories.push(randTerritory);

                // Increment the current player index so we can add to the game state correctly
                this.currentPlayerIndex++;

                // If the player index hits the player length, reset it back to 0
                if (this.currentPlayerIndex === players.length) {
                    this.currentPlayerIndex = 0;
                }
            });

        });

        console.log(this.gameState);

        const payload = {
            gameState: this.gameState,
            gameLogRecords: this.gameLog
        };

        // Save the game state in the db
        this.utils.sendRequest('post', `/api/games/${this.activeGameID}/setgamemeta`, payload, true).subscribe(data => {
            console.log(data);
        }, err => {
            console.error(err);
        });

        this.emitGameState(this.gameState);

        return this.gameState;
    }

    /**
     * Public methods
     */
    // Method to get the continent of a territory
    public getContinent(territoryId: string): string {
        let continentId = '';
        this.activeMap.regions.forEach((region) => {
            if (region.territories[territoryId]) {
                continentId = region.id;
            }
        });
        return continentId;
    }

    // Method to get territories of continent as an array of IDs
    public getTerritories(continentId: string): Array<any> {
        return Object.keys(this.activeMap.regions.filter((region) => {
            return region.id === continentId;
        })[0].territories);
    }

    // Method to get the default color of a continent
    public getDefaultColorByContinent(continentId: string): string {
        return this.activeMap.regions.filter((region) => {
            return region.id === continentId;
        })[0].defaultColor;
    }

    // Method to get the default color of a territory
    public getDefaultColorByTerritory(territoryId: string): string {
        return this.activeMap.regions.filter((region) => {
            return region.id === this.getContinent(territoryId);
        })[0].defaultColor;
    }

    // public helper method to get the nearby territories of the territory
    // passed in as a parameter
    public getNearbyTerritories(territoryId: string): Array<string> {
        let nearbyTerritories = Array<string>();

        this.activeMap.regions.forEach((region) => {
            if (region.territories[territoryId]) {
                nearbyTerritories = region.territories[territoryId].nearbyTerritories;
            }
        });

        return nearbyTerritories;
    }

    // Method to return territory name from id
    public getName(territoryId: string): string {
        let territoryName = '';

        this.activeMap.regions.forEach(region => {
            if (region.territories[territoryId]) {
                territoryName = region.territories[territoryId].name;
            }
        });

        return territoryName;
    }

    // Method to assign turn order to an array of players
    // We will utilize the Dice class in order to roll dice randomly to determine order
    public assignTurnOrder(players: Array<Player>): Array<Player> {
        const rTurnOrder = {
            players: {}
        };
        // First, grab the array of player IDs to pass to the dice rolling service
        const playerIdsArray = players.map(p => {
            return p.playerInformation._id;
        });

        // Now we call the dice rolling service to return us back an object
        // with the player IDs as keys and the dice roll itself as values
        const newTurnOrder = this.diceService.turnOrderRoll(playerIdsArray);

        // TODO: Log these dice rolls in the game log

        // Create a new array of players with the turnOrder property populated
        let nPlayersArr = players.map(rp => {
            rp['turnOrder'] = newTurnOrder[rp.playerInformation._id];
            // this.addToGameLog(rp, TurnType.DiceRoll, { roll: newTurnOrder[rp.playerInformation._id]});
            return rp;
        });
        nPlayersArr = this.utils.sortPlayers(nPlayersArr, 'desc');

        nPlayersArr = nPlayersArr.map((p, index) => {
            p['turnOrder'] = index + 1;
            rTurnOrder.players[p.playerInformation._id] = index + 1;
            return p;
        });

        // Send a request to the backend to update the turn order
        this.utils.sendRequest('post', `/api/games/${this.activeGameID}/setturnorder`, rTurnOrder, true).subscribe((data) => {
            if (data.success) {
                console.log('Turn order has been updated in the database.');
            }
        }, error => {
            console.error(error);
        });

        console.log(nPlayersArr);

        return nPlayersArr;
    }

    // Emit game state information
    public emitGameState(gameState: any) {
        // Emit the game state to any listeners
        this.gameStateEventSource.next(gameState);
    }

    // Emit game log information
    public emitGameLog(records: Array<Record>) {
        // Emit the data using the subject above - next will pass the data to any subscribers
        this.eventSource.next(records);
    }


    /**
     * Private methods
     */

    private getRandomTerritory(inputArray: Array<any>): any {
        const rand = inputArray[Math.floor(Math.random() * inputArray.length)];
        if (!this.assignedTerritories.includes(rand)) {
            return rand;
        }

        // Otherwise, we just call the function again to get a different item
        return this.getRandomTerritory(inputArray);
    }

    // Fisher-Yates (aka Knuth) shuffle
    private shuffleTerritories(inputArray: Array<any>): any {
        let currentIndex = inputArray.length;
        let tempValue = -1;
        let randomIndex = -1;

        // While there are elements remaining to shuffle
        while (0 !== currentIndex) {
            // Pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            tempValue = inputArray[currentIndex];
            inputArray[currentIndex] = inputArray[randomIndex];
            inputArray[randomIndex] = tempValue;
        }

        return inputArray;
    }

    /**
     * Method to add records to the game log.
     * @param records Array<Record>
     * @returns void
     */
    public addToGameLog(records: Array<Record>): void {
        // console.log(records);
        this.gameLog = this.gameLog.concat(records);

        this.emitGameLog(records);
    }

    // Update game state
    public updateGameMeta(state: any, log: Array<any>): void {
        const payload = {
            gameState: state,
            gameLogRecords: log
        };

        // Save the game state in the db
        this.utils.sendRequest('post', `/api/games/${this.activeGameID}/setgamemeta`, payload, true).subscribe(data => {
            console.log(data);
        }, err => {
            console.error(err);
        });
    }
}
