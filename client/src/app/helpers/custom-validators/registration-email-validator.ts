import { Injectable } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, filter, switchMap, debounce, distinctUntilChanged } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';

export function emailValidator(authService: AuthenticationService): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        const email = control.value.toLowerCase();
        console.log(email);

        if (email === null || email.length === 0) {
            return of(null);
        } else {
            return timer(500).pipe(
                distinctUntilChanged(),
                switchMap(() => {
                    return authService.validateEmail(email).pipe(
                        map((users: any) => {
                            return (users.emailExists) ? { 'emailExists': true } : null;
                        })
                    );
                })
            );
        }
    };
}

