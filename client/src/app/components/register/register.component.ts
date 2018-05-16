import { Component, OnInit } from '@angular/core';
import { AuthenticationService, TokenPayload } from '../../services/authentication.service';
import { Router } from '@angular/router';

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

    constructor(private auth: AuthenticationService, private router: Router) { }

    register() {
        console.log(this.credentials);

        this.auth.register(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/risk');
        }, (err) => {
            console.error(err);
        });
    }

    ngOnInit() {
    }

}
