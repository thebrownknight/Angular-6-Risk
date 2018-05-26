import { Directive, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncValidatorFn, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, filter, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';

@Injectable()
export class UsernameValidator {

    constructor(private authService: AuthenticationService) { }

    existingUsernameValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
            const username = control.value.toLowerCase();

            if (username === null || username.length === 0) {
                return of(null);
            } else {
                return timer(500).pipe(
                    distinctUntilChanged(),
                    switchMap(() => {
                        return this.authService.validateUsername(username).pipe(
                            map((users: any) => {
                                return (!users.usernameExists) ? { 'usernameExists': false } : null;
                            })
                        );
                    })
                );
            }
        };
    }
}

// @Directive({
//     selector: '[riskValidateUsername]',
//     providers: [{
//         provide: NG_ASYNC_VALIDATORS,
//         useExisting: ExistingUsernameValidatorDirective,
//         multi: true
//     }]
// })
// export class ExistingUsernameValidatorDirective implements AsyncValidator {
//     constructor(private authService: AuthenticationService) { }
//
//     validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
//         return existingUsernameValidator(this.authService)(control);
//     }
// }
