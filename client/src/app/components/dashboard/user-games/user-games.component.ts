import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { RiskModal, ModalDismissReasons, RiskModalRef } from '../../ui/modal/modal.module';
import { DashboardService } from '../../../services/dashboard.service';

import { UsernameValidator } from '../../../helpers/custom-validators/existing-username-validator';
import { GamePayload, GameDetails, PendingGameDetails } from '../../../helpers/data-models';

import { Utils } from '../../../services/utils';

@Component({
  selector: 'risk-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss']
})
export class UserGamesComponent implements OnInit {
    riskModalRef: any;
    gameCreationForm: FormGroup;
    pendingGamesList: GameDetails[] = [];


    constructor(private modalService: RiskModal,
        private formBuilder: FormBuilder,
        private dashboardService: DashboardService,
        private usernameValidator: UsernameValidator) {
        this.createForm();
    }

    ngOnInit() {
        this.getUserGames();

        // Set the required attributes for either the list of usernames or max number of players
        // depending on whether it's a public or private game
        this.gameCreationForm.get('gameType').valueChanges.subscribe((type: string) => {
            if (type === 'Private') {
                this.gameCreationForm.get('numberOfPlayers').clearValidators();
                this.usernames.controls.forEach((value: AbstractControl, index: number, array: AbstractControl[]) => {
                    value.setValidators([Validators.required, Validators.minLength(3)]);
                });
            } else if (type === 'Public') {
                this.usernames.controls.forEach((value: AbstractControl, index: number, array: AbstractControl[]) => {
                    value.clearValidators();
                });
                this.gameCreationForm.get('numberOfPlayers').setValidators(Validators.required);
            }
        });
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
        this.dashboardService.getUserGames().subscribe((games) => {
            // console.log(games);

            // Take incoming games and set the gamesList variable
            // to display on the front-end
            games.forEach((game) => {
                const gameDetails  = {
                    _id: game._id,
                    createdAt: Utils.formatDate(new Date(game.createdAt)),
                    title: game.title,
                    creator: game.creator,
                    players: game.players,
                    numberOfPlayers: game.numberOfPlayers,
                    endDate: game.endDate,
                    gameType: game.gameType,
                    code: game.code,
                    status: game.status
                };
                switch (game.status) {
                    case 'CREATED':
                        let pendingGameDetails = gameDetails as PendingGameDetails;
                        pendingGameDetails.pendingPlayers = game.players.filter((player) => {
                            return player.status === 'PENDING';
                        });
                        // console.log(pendingGameDetails);
                        this.pendingGamesList.push(pendingGameDetails);
                        break;
                    case 'IN PROGRESS':
                        break;
                    case 'COMPLETED':
                        break;
                }
            });

        }, (err) => {
            console.error(err);
        });
        console.log('Getting user games.');
    }

    createGame() {
        const formModel = this.gameCreationForm.value;
        // Create the gameDetails containing values from the form
        const gameDetails: GamePayload = {
            title: formModel.title as string,
            gameType: formModel.gameType as string,
            players: formModel.players as Array<string>
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
            'uname': ['',
                {
                    validators: [ Validators.required, Validators.minLength(3) ],
                    asyncValidators: [ this.usernameValidator.existingUsernameValidator() ],
                    updateOn: 'blur'
                }
            ]
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
