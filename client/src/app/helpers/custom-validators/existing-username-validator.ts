import { Directive } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncValidatorFn, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, filter, switchMap, debounceTime } from 'rxjs/operators';

import { AuthenticationService } from '../../services/authentication.service';

export function existingUsernameValidator(authService: AuthenticationService): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
        return control.valueChanges.pipe(
            filter((value: string) => value.length >= 3),
            debounceTime(1000),
            switchMap((value: string) => {
                return authService.validateUsername(value).pipe(
                    map( users => {
                        return (users && users.length > 0) ? {'usernameExists': true} : {'usernameDoesNotExist': true};
                    })
                );
            })
        );
    };
}

@Directive({
    selector: '[riskValidateUsername]',
    providers: [{
        provide: NG_ASYNC_VALIDATORS,
        useExisting: ExistingUsernameValidatorDirective,
        multi: true
    }]
})
export class ExistingUsernameValidatorDirective implements AsyncValidator {
    constructor(private authService: AuthenticationService) { }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return existingUsernameValidator(this.authService)(control);
    }
}
