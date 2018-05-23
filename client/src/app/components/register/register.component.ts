import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

@Component({
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    credentials: TokenPayload = {
        email: '',
        username: '',
        password: ''
    };

    constructor(
        private auth: AuthenticationService,
        private router: Router
    ) { }

    register() {
        this.auth.register(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/risk');
        }, (err) => {
            console.error(err);
        });
    }

    ngOnInit() {
    }

}
