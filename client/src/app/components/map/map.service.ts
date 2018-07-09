import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { standardMap } from '../../../assets/scripts/maps';
import { Utils } from '../../services/utils';
import { DiceService } from './dice.service';
import { TurnType } from '../../helpers/data-models';

/* https://stackoverflow.com/questions/42396804/how-to-write-a-service-constructor-that-requires-parameters-in-angular-2 */

@Injectable()
export class MapService {
    // Counter for player in players array
    private currentPlayerIndex = 0;
    private activeMap: any;
    private assignedTerritories: Array<any> = [];

    private gameState: Array<any> = [];
    private gameLog: Array<any> = [];

    // Variables for emitting game log activity
    private eventSource = new Subject<any>();
    gameLogUpdates$ = this.eventSource.asObservable();

    // Variables for emitting game state activity
    private gameStateEventSource = new Subject<any>();
    gameStateUpdates$ = this.gameStateEventSource.asObservable();

    constructor(
        private http: HttpClient,
        private utils: Utils,
        private diceService
    ) { }

    /**
     * Getters and setters
     */
    public getActiveMap() {
        return this.activeMap;
    }

    public setActiveMap(map: string) {
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
     * 1) players: Array<any> -- array of player objects in the game
     *
     * Returns an object with the game meta information, current state of board
     * and all assignments added to the log.
     */
    public assignTerritories(players: Array<any>): any {
        // We'll be pushing our information into here and then sending them
        // to the backend route to handle adding to db
        // const gameState = [];

        // Populate the gameState array with the objects for each player since
        // these objects themselves won't be changing, just the territoryMeta inside
        players.forEach((player, index) => {
            const playerStateObj = {
                player: player._id, // for player reference
                status: 'WAITING',  // initial player status
                turnOrder: (index + 1), // player's turn order
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

                // Add to the game log
                // Player is getting troops at this point, start with 3 in each
                // territory
                this.addToGameLog(
                    players[this.currentPlayerIndex],
                    TurnType.GetTroops,
                    { id: randTerritory, troops: 3 }
                );

                this.assignedTerritories.push(randTerritory);

                // Increment the current player index so we can add to the game state correctly
                this.currentPlayerIndex++;

                // If the player index hits the player length, reset it back to 0
                if (this.currentPlayerIndex === players.length) {
                    this.currentPlayerIndex = 0;
                }
            });

        });

        // Emit the game state to any listeners
        this.gameStateEventSource.next(this.gameState);

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
    public assignTurnOrder(players: Array<any>): any {

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

    // Add to game log
    private addToGameLog(playerObj: any, type: TurnType, data: any): void {
        const record = {
            player: playerObj,
            turnType: type,
            data: data
        };
        this.gameLog.push(record);

        // Emit the data using the subject above - next will pass the data to any
        // subscribers
        this.eventSource.next(record);
    }
}
