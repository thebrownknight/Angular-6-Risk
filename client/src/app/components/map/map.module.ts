import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapHeaderComponent } from './map-header/map-header.component';
import { MapComponent } from './map-component/map.component';
import { GameLogComponent } from './map-game-log/game-log.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        MapHeaderComponent,
        MapComponent,
        GameLogComponent
    ],
    exports: [
        MapComponent
    ]
})
export class MapModule { }
