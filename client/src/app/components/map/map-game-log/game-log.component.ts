import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MapService } from '../map.service';
import { TurnType } from '../../../helpers/data-models';

// When we include a service in 'providers', it is instantiated and this state is
// maintained between its component as well as its child components
// If we include the service in both components provider arrays, then it is no longer
// a singleton. The state is independent and not shared between them.
// ONLY INCLUDE SERVICE AT PARENT COMPONENT OR ROOT COMPONENT.

@Component({
    selector: 'risk-game-log',
    templateUrl: './game-log.component.html',
    animations: [
        trigger('toggleGameLog', [
            state('opened', style({
                transform: 'translateX(0)'
            })),
            state('closed', style({
                transform: 'translateX(-100%)'
            })),
            transition('closed => opened', [
                animate('300ms ease-in')
            ]),
            transition('opened => closed', [
                animate('300ms ease-out')
            ])
        ])
    ]
})
export class GameLogComponent implements OnInit {
    gameLog: Array<any> = [];
    logState = 'closed';

    constructor(private mapService: MapService) { }

    ngOnInit() {
        // Subscribe to game log events
        this.mapService.gameLogUpdates$.subscribe((record) => {
            // console.log(record);
            record.data['territoryName'] = this.mapService.getName(record.data.id);
            this.gameLog.push(record);
        });
    }

    toggleGameLog() {
        this.logState = this.logState === 'opened' ? 'closed' : 'opened';
    }

    private formatMessage(record: any): string {
        let message = '<span class="player">' + record.player.username + '</span> ';

        switch (record.turnType) {
            case TurnType.GetTroops:
                const territoryName = this.mapService.getName(record.data.id);
                message += `received ${record.data.troops} troops for ${territoryName}`;
                break;
            case TurnType.Attack:
                break;
            case TurnType.Fortify:
                break;
            case TurnType.DiceRoll:
                break;
        }

        return message;
    }
}
