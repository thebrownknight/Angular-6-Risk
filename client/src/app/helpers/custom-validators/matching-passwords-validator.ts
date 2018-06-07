import { ValidatorFn, AbstractControl } from '@angular/forms';

export class PasswordValidation {
    static matchingPasswordsValidator(control: AbstractControl) {
        return control.get('password').value === control.get('confirmPassword').value ? null : { 'matchpassword': true };
    }
}
