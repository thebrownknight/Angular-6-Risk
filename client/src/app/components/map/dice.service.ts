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

    /**
     * Method that returns the all the rolls that were done.
     */
    fullRoll(numberOfDice: number): Array<number> {
        const rollArray = [];
        // Roll the number of dice specified, add each roll to the return array
        for (let i = 0; i < numberOfDice; i++) {
            rollArray.push(Math.ceil(Math.random() * this.numberOfSides));
        }

        // Sort the rolls from greatest to least
        rollArray.sort((a, b) => {
            return b - a;
        });

        return rollArray;
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
    attackRoll(attackNumberOfDice: any, defenseTroops: any) {
        // The number of dice we can use is 1, 2, or 3.
        const aDiceRoll = this.fullRoll(attackNumberOfDice);

        const defendNumDice = defenseTroops >= 2 ? 2 : 1;
        const dDiceRoll = this.fullRoll(defendNumDice);

        let attackerVictories = 0, attackerLosses = 0, defenderVictories = 0, defenderLosses = 0;

        // We have our rolls, loop through the attack rolls array and compare them
        aDiceRoll.forEach((roll, index) => {
            if (dDiceRoll[index]) {
                if (roll > dDiceRoll[index]) {
                    attackerVictories++;
                    defenderLosses++;
                } else {
                    defenderVictories++;
                    attackerLosses++;
                }
            }
        });

        return {
            attackerRolls: aDiceRoll,
            defenderRolls: dDiceRoll,
            attackerInfo: {
                victories: attackerVictories,
                losses: attackerLosses
            },
            defenderInfo: {
                victories: defenderVictories,
                losses: defenderLosses
            }
        };
    }

    /**
     * Method to determine turn order of players.
     * @param playerIds - Array of player IDs
     * @returns Object with player ID as key and turnOrder as value
     */
    turnOrderRoll(playerIds: Array<any>): any {
        const turnOrderObj = {};
        playerIds.forEach((player) => {
            let tempRoll = this.roll(1);
            while (this.utils.objectContainsValue(turnOrderObj, tempRoll)) {
                tempRoll = this.roll(1);
            }
            turnOrderObj[player] = tempRoll;
        });

        return turnOrderObj;
    }
}
