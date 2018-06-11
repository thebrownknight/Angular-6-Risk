import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { SocketService } from '../../services/sockets';
import { UserDetails } from '../../helpers/data-models';

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

    constructor(private auth: AuthenticationService,
        private socketIo: SocketService
    ) { }

    ngOnInit() {
        this.isLoggedIn = this.auth.isLoggedIn();

        if (this.isLoggedIn) {
            this.userDetails = this.auth.getUserDetails();
        }
    }

    logout() {
        this.socketIo.disconnect();
        this.auth.logout();
    }

}
