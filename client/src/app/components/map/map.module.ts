import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MapHeaderComponent } from './map-header/map-header.component';
import { MapComponent } from './map-component/map.component';
import { GameLogComponent } from './map-game-log/game-log.component';

import { DiceService } from './dice.service';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    declarations: [
        MapHeaderComponent,
        MapComponent,
        GameLogComponent
    ],
    exports: [
        MapComponent
    ],
    providers: [
        DiceService
    ]
})
export class MapModule { }
