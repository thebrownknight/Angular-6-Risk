import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { standardMap } from '../../assets/scripts/maps';
import { Utils } from './utils';

/* https://stackoverflow.com/questions/42396804/how-to-write-a-service-constructor-that-requires-parameters-in-angular-2 */

@Injectable()
export class MapService {
    private activeMap: any;

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
}
