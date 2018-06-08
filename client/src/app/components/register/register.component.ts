import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

import { usernameValidator } from '../../helpers/custom-validators/registration-username-validator';
import { emailValidator } from '../../helpers/custom-validators/registration-email-validator';
import { PasswordValidator } from '../../helpers/custom-validators/matching-passwords-validator';

@Component({
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    credentials: TokenPayload;
    registerForm: FormGroup;
    passwordFormGroup: FormGroup;
    registerFormSubmitted = false;
    showPassword = false;

    constructor(
        private auth: AuthenticationService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\!\@\#\$\%\^\&\*]).+$/;

        this.passwordFormGroup = this.formBuilder.group({
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(passwordRegex)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validator: PasswordValidator.matchingPasswordsValidator.bind(this)
        });

        this.registerForm = this.formBuilder.group({
            email: ['',
                [Validators.required, Validators.email],
                [ emailValidator(this.auth) ]
            ],
            username: ['',
                [ Validators.required, Validators.minLength(5), Validators.pattern('[A-Za-z0-9]+') ],
                [ usernameValidator(this.auth) ]
            ],
            passwordFormGroup: this.passwordFormGroup
        });
    }

    get rForm() {
        return this.registerForm.controls;
    }
    get pGroup() {
        return this.passwordFormGroup.controls;
    }

    // Show and hide the password input
    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    register() {
        this.registerFormSubmitted = true;

        // Check validity of form before continuing
        if (this.registerForm.invalid) {
            return;
        }

        const formValues = this.registerForm.value;
        this.credentials = {
            email: formValues.email,
            username: formValues.username,
            password: formValues.passwordFormGroup.password
        };

        this.auth.register(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/risk');
        }, (err) => {
            console.error(err);
        });
    }

}
