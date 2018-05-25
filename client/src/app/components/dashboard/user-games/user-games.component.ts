import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RiskModal, ModalDismissReasons, RiskModalRef } from '../../modal/modal.module';
import { DashboardService } from '../../../services/dashboard.service';

import { GamePayload } from '../../../helpers/data-models';

@Component({
  selector: 'risk-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss']
})
export class UserGamesComponent implements OnInit {
    riskModalRef: any;
    gameCreationForm: FormGroup;
    gamesList: GamePayload[] = [];

    constructor(private modalService: RiskModal,
        private formBuilder: FormBuilder,
        private dashboardService: DashboardService) {
        this.createForm();
    }

    ngOnInit() {
        this.getUserGames();
    }

    open(content) {
        this.riskModalRef = this.modalService.open(content);
        this.riskModalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${this.getDismissReason(reason)}`);
        });
    }

    getUserGames() {
        // this.dashboardService.getUserGames().subscribe((games) => {
        //     console.log(games);

        //     // TODO - Take incoming games and set the gamesList variable
        //     // to display on the front-end
        // }, (err) => {
        //     console.error(err);
        // });
        console.log('Getting user games.');
    }

    createGame() {
        const formModel = this.gameCreationForm.value;
        // Create the gameDetails containing values from the form
        const gameDetails: GamePayload = {
            title: formModel.title as string,
            gameType: formModel.gameType as string
        };

        this.dashboardService.createNewGame(gameDetails).subscribe((createdGame) => {
            // We've successfully created a game,
            // Now we dismiss the modal and display the user's game list
            this.riskModalRef.close(() => {
                this.getUserGames();
            });
        }, (err) => {
            console.error(err);
        });
    }

    /**
     * Methods for the dynamic email addresses to send invites to
     */
    get usernames(): FormArray {
        return this.gameCreationForm.get('usernames') as FormArray;
    }

    createUsername(): FormGroup {
        return this.formBuilder.group({
            'username': ''
        });
    }

    addUsername() {
        this.usernames.push(this.createUsername());
    }

    removeUsername(index: number) {
        this.usernames.removeAt(index);
    }

    /** End dynamic email methods **/

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
            gameType: 'private',
            usernames: this.formBuilder.array([this.createUsername()]),
            numberOfPlayers: 2
        });
    }

}
