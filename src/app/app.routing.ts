import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { MapComponent } from './components/map/map.component';

import { AuthGuard } from './services/auth.guard';

const appRoutes: Routes = [
    { path: '', component: MapComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },

    // Otherwise redirect to login
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
