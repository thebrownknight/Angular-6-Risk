import { Component, OnInit } from '@angular/core';
import { AuthenticationService, UserDetails } from '../../services/authentication.service';

@Component({
  selector: 'risk-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    userDetails: UserDetails = {
        _id: '',
        email: '',
        username: '',
        exp: -1,
        iat: -1
    };
    isLoggedIn = false;

    constructor(private auth: AuthenticationService) { }

    ngOnInit() {
        this.isLoggedIn = this.auth.isLoggedIn();

        if (this.isLoggedIn) {
            this.userDetails = this.auth.getUserDetails();
        }
    }

    logout() {
        this.auth.logout();
    }

}
