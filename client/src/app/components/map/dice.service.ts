import { Injectable } from '@angular/core';
import { DiceRollType } from '../../helpers/data-models';

import { Utils } from '../../services/utils';

@Injectable()
export class DiceService {
    numberOfSides = 6;

    constructor(private utils: Utils) { }

    roll(numberOfDice: number): number {
        let greatestValue = -1;
        // Roll the number of dice specified
        for (let i = 0; i < numberOfDice; i++) {
            const tempRoll = Math.ceil(Math.random() * this.numberOfSides);
            if (greatestValue === -1 || tempRoll > greatestValue) {
                greatestValue = tempRoll;
            }
        }

        return greatestValue;
    }

    /* Convenience methods */
    /**
     * Method to determine winner in an attack scenario.
     * @param attackPlayerMeta - contains player's username and number of troops being used to attack
     * Attacking player may roll 1, 2, or 3 dice but they must have one more army in their
     * territory than dice they are rolling
     * @param defensePlayerMeta - contains defending player's username and number of troops defending
     * Defending player may roll 1 or 2 dice so long as the number of armies in their territory
     * matches or exceeds the number of dice they roll
     */
    attackRoll(attackPlayerMeta: any, defensePlayerMeta: any) {

    }

    /**
     * Method to determine turn order of players.
     * @param players - Array of player IDs
     * @returns Object with player ID as key and turnOrder as value
     */
    turnOrderRoll(players: Array<any>): any {
        const turnOrderObj = {};
        players.forEach((player) => {
            let tempRoll = this.roll(1);
            while (this.utils.objectContainsValue(turnOrderObj, tempRoll)) {
                tempRoll = this.roll(1);
            }
            turnOrderObj[player] = tempRoll;
        });

        return turnOrderObj;
    }
}
