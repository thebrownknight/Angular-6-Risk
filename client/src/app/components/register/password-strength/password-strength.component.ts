import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as zxcvbn from 'zxcvbn';

@Component({
    selector: 'risk-password-strength-meter',
    templateUrl: './password-strength.component.html',
    styleUrls: ['./password-strength.component.scss']
})
export class PasswordStrengthComponent implements OnInit, OnChanges {
    @Input() passwordControl: FormControl;
    barColors: string[];
    colors = ['darkred', 'orangered', 'orange', 'yellowgreen', 'green'];
    passwordStrength = 0;
    passwordTestResults: any;
    strengthMapping = {
        0: 'Very Weak',
        1: 'Weak',
        2: 'Moderate',
        3: 'Strong',
        4: 'Very Strong'
    };

    ngOnInit() {
        this.updateBarColors('');
    }

    ngOnChanges(changes: SimpleChanges) {
        this.updatePasswordStrength();
    }

    updateBarColors(color): void {
        this.barColors = [];

        for (let i = 0; i < 5; i++) {
            if (this.passwordTestResults) {
                this.barColors.push((i <= this.passwordStrength) ? color : '');
            }
        }
    }

    updatePasswordStrength(): void {
        const results = zxcvbn(this.passwordControl.value);
        this.passwordTestResults = results;
        this.passwordStrength = this.passwordTestResults.score;

        const color = this.colors[this.passwordStrength];

        this.updateBarColors(color);
    }
}
