import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RiskModal, ModalDismissReasons } from '../../modal/modal.module';

@Component({
  selector: 'risk-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss']
})
export class UserGamesComponent implements OnInit {
    gameCreationForm: FormGroup;

    constructor(private modalService: RiskModal,
        private formBuilder: FormBuilder) {
        this.createForm();
    }

    ngOnInit() {
    }

    open(content) {
        this.modalService.open(content).result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${this.getDismissReason(reason)}`);
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with ${reason}`;
        }
    }

    // Reactive form methods
    private createForm() {
        this.gameCreationForm = this.formBuilder.group({
            title: ['', Validators.required],
            private: ''
        });
    }

}
