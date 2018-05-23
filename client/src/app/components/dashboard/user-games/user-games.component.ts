import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RiskModal, ModalDismissReasons } from '../../modal/modal.module';
import { DashboardService } from '../../../services/dashboard.service';

import { GamePayload } from '../../../helpers/data-models';

@Component({
  selector: 'risk-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss']
})
export class UserGamesComponent implements OnInit {
    gameCreationForm: FormGroup;
    gamesList: GamePayload[] = [];

    constructor(private modalService: RiskModal,
        private formBuilder: FormBuilder,
        private dashboardService: DashboardService) {
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

    getUserGames() {

    }

    createGame() {
        const formModel = this.gameCreationForm.value;
        // Create the gameDetails containing values from the form
        const gameDetails: GamePayload = {
            title: formModel.title as string,
            numPlayers: formModel.numberOfPlayers as number,
            private: formModel.private as boolean
        };

        this.dashboardService.createNewGame(gameDetails).subscribe(() => {

        }, (err) => {
            console.error(err);
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
            numberOfPlayers: ['2', Validators.required],
            private: ''
        });
    }

}
