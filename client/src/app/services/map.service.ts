import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { standardMap } from '../../assets/scripts/maps';
import { Utils } from './utils';

/* https://stackoverflow.com/questions/42396804/how-to-write-a-service-constructor-that-requires-parameters-in-angular-2 */

@Injectable()
export class MapService {
    // Counter for player in players array
    private currentPlayerIndex = 0;
    private activeMap: any;
    private assignedTerritories: Array<any>;

    constructor(
        private http: HttpClient,
        private utils: Utils
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
        const gameState = [],
            gameLog = [];

        // Populate the gameState array with the objects for each player since
        // these objects themselves won't be changing, just the territoryMeta inside
        players.forEach(player => {
            const playerStateObj = {
                player: player._id, // for player reference
                status: 'WAITING',  // initial player status
                territoryMeta: [],  // list of territories the player controls
                cards: [] // cards the player has received from successful attacks
            };

            gameState.push(playerStateObj);
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
            const shuffledTerritories = this.shuffleTerritories(region.territories);

            shuffledTerritories.forEach((randTerritory) => {
                // Assign the territory to the player
                gameState[this.currentPlayerIndex].territoryMeta.push({
                    id: randTerritory,
                    troops: 3
                });

                // Add to the game log
                gameLog.push({
                    player: players[this.currentPlayerIndex]._id,
                    turnType: 'get_troops',
                    data: {
                        territory: randTerritory,
                        troops: 3
                    }
                });

                this.assignedTerritories.push(randTerritory);

                // Increment the current player index so we can add to the game state correctly
                this.currentPlayerIndex++;

                // If the player index hits the player length, reset it back to 0
                if (this.currentPlayerIndex === players.length) {
                    this.currentPlayerIndex = 0;
                }
            });

        });
        return;
    }

    /**
     * HELPER METHODS for getting information from the map
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
}
