import { ValidatorFn, AbstractControl } from '@angular/forms';

export class PasswordValidator {
    static matchingPasswordsValidator(control: AbstractControl) {
        return control.get('password').value === control.get('confirmPassword').value ? null : { 'matchpassword': true };
    }
}
