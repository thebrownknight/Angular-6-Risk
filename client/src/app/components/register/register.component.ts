import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import { TokenPayload } from '../../helpers/data-models';

import { PasswordValidation } from '../../helpers/custom-validators/matching-passwords-validator';

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
    registerForm: FormGroup;
    passwordFormGroup: FormGroup;
    registerFormSubmitted = false;

    constructor(
        private auth: AuthenticationService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.passwordFormGroup = this.formBuilder.group({
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[!@#$%^&*])).+$')]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validator: PasswordValidation.matchingPasswordsValidator.bind(this)
        });

        this.registerForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            username: ['', [Validators.required, Validators.minLength(5), Validators.pattern('[A-Za-z0-9]+')]],
            passwordFormGroup: this.passwordFormGroup
        });
    }

    get rForm() {
        return this.registerForm.controls;
    }
    get pGroup() {
        return this.passwordFormGroup.controls;
    }

    register() {
        this.registerFormSubmitted = true;

        // Check validity of form before continuing
        if (this.registerForm.invalid) {
            return;
        }


        this.auth.register(this.credentials).subscribe(() => {
            this.router.navigateByUrl('/risk');
        }, (err) => {
            console.error(err);
        });
    }

}
