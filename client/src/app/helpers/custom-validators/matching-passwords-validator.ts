import { ValidatorFn, AbstractControl } from '@angular/forms';

export class PasswordValidation {
    static matchingPasswordsValidator(): ValidatorFn {
        console.log('here');
        return (control: AbstractControl): {[key: string]: any} | null => {
            let password = control.get('password').value;
            let confirmPassword = control.get('confirmPassword').value;

            console.log(password);
            console.log(confirmPassword);

            if (password !== confirmPassword) {
                control.get('confirmPassword').setErrors({ matchpassword: true });
            } else {
                return null;
            }
        };
    }
}
