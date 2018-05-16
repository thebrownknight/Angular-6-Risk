import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, RouterState } from '@angular/router';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(private auth: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.auth.isLoggedIn()) {
            // Logged in so return true
            return true;
        }

        // Not logged in so redirect to login page with the return URL
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
