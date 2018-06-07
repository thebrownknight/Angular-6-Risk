import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    credentials: TokenPayload;
    loginForm: FormGroup;
    loginFormSubmitted = false;

    constructor(
        private auth: AuthenticationService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        })
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

        this.auth.login(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/dashboard');
        }, (err) => {
            console.error(err);
        });
    }
}
