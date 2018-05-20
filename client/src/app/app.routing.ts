import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { MapComponent } from './components/map/map.component';

import { AuthGuardService } from './services/auth-guard.service';

const appRoutes: Routes = [
    { path: 'risk', component: MapComponent, canActivate: [AuthGuardService] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Otherwise redirect to login
    { path: '**', redirectTo: '/login' }
];

export const routing = RouterModule.forRoot(appRoutes);
