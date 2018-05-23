import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    credentials: TokenPayload = {
        username: '',
        password: ''
    };

    constructor(
        private auth: AuthenticationService,
        private router: Router
    ) { }

    ngOnInit() {
    }

    login() {
        this.auth.login(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/dashboard');
        }, (err) => {
            console.error(err);
        });
    }
}
