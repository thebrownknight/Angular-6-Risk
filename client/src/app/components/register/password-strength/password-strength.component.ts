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
    @Input() password: string;
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

    // To show and hide tooltips
    showTooltip = false;

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
        const results = zxcvbn(this.password);
        this.passwordTestResults = results;
        this.passwordStrength = this.passwordTestResults.score;

        const color = this.colors[this.passwordStrength];

        this.updateBarColors(color);
    }

    open(): void {
        this.showTooltip = true;
    }
    dismiss(): void {
        if (!this.passwordControl.errors) {
            this.showTooltip = false;
        }
    }
}
