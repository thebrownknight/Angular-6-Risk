import { Injectable } from '@angular/core';
import { AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, pipe, timer } from 'rxjs';
import { map, filter, switchMap, debounce, distinctUntilChanged } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';

export function usernameValidator(authService: AuthenticationService): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        const username = control.value.toLowerCase();

        if (username === null || username.length === 0) {
            return of(null);
        } else {
            return timer(500).pipe(
                distinctUntilChanged(),
                switchMap(() => {
                    return authService.validateUsername(username).pipe(
                        map((users: any) => {
                            return (users.usernameExists) ? { 'usernameExists': true } : null;
                        })
                    );
                })
            );
        }
    };
}

