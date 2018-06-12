import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

import { throwError } from 'rxjs';

import { SocketService } from '../../services/sockets';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    credentials: TokenPayload;
    loginForm: FormGroup;
    loginFormSubmitted = false;
    loginError: string;

    constructor(
        private auth: AuthenticationService,
        private socketIo: SocketService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    // Convenience getter for form
    get lForm() {
        return this.loginForm.controls;
    }

    login() {
        this.loginFormSubmitted = true;

        // Check to make sure login form is valid before continuing
        if (this.loginForm.invalid) {
            return;
        }

        // Populate the payload
        const formValues = this.loginForm.value;
        this.credentials = {
            username: formValues.username,
            password: formValues.password
        };

        this.auth.login(this.credentials).subscribe((token) => {
            console.log(token);
            this.router.navigateByUrl('/dashboard');

            // Initialize the socket connection
            this.socketIo.connect(token);
        }, (err) => {
            if (err.message) {
                this.loginError = err.message;
            }
        });
    }
}
