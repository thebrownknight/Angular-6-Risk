import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { RiskModal, ModalDismissReasons, RiskModalRef } from '../../ui/modal/modal.module';
import { AlertService } from '../../../services/alert.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { SocketService } from '../../../services/sockets';
import { DashboardService } from '../../../services/dashboard.service';

import { UsernameValidator } from '../../../helpers/custom-validators/existing-username-validator';
import { UserDetails, GamePayload, GameDetails, PendingGameDetails, InProgressGameDetails } from '../../../helpers/data-models';
import { Alert, AlertType, NotificationEvent } from '../../../helpers/data-models';

import { Utils } from '../../../services/utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type GameType = 'CREATED' | 'INPROGRESS' | 'COMPLETED';

@Component({
  selector: 'risk-user-games',
  templateUrl: './user-games.component.html',
  styleUrls: ['./user-games.component.scss']
})
export class UserGamesComponent implements OnInit {
    loggedInUser: UserDetails;
    riskModalRef: any;
    gameCreationForm: FormGroup;
    gameCreationFormSubmitted: Boolean;

    pendingGamesList = {
        userCreatedGames: [],
        invitedGames: []
    };
    inProgressGamesList: InProgressGameDetails[] = [];
    completedGamesList: GameDetails[] = [];

    constructor(
        private router: Router,
        private modalService: RiskModal,
        private formBuilder: FormBuilder,
        private alertService: AlertService,
        private authService: AuthenticationService,
        private socketIo: SocketService,
        private dashboardService: DashboardService,
        private usernameValidator: UsernameValidator) {
        this.createForm();

        // Get and store user details for customized output on games lists
        this.loggedInUser = this.authService.getUserDetails();
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

        /**
         * Subscribe to 'user created game' event
         * This will be triggered when anyone creates a new game
         * We have to check to see if the logged in user is one of the players in the created game
         * and if so, we show a notification and ask them to accept the game.
         */
        this.getEvent('user created game').subscribe((data) => {
            // console.log(data);

            // Check to see if the logged in user is in the game players list (check by ID)
            if (data.game.players.some(e => e.player === this.loggedInUser._id)) {
                // Show a notification
                this.alertService.alert(new Alert({
                    message: 'User <b>' + data.user + '</b> invited you to their game `' + data.game.title + '`',
                    iconClass: 'fa-user-astronaut',
                    type: AlertType.Success,
                    alertId: 'game_create_notification_' + data.game.code,
                    buttonTitle: 'Join Game',
                    buttonAction: 'join_game',
                    params: {
                        gameId: data.game._id,
                        gameCode: data.game.code
                    }
                }));

                this.getUserGames();
            }
        });

        // Subscribe to 'user joined game' event
        // This will be triggered when someone else in either a game you've created or have been invited to
        // has joined the game.
        this.getEvent('user joined game').subscribe((data) => {
            console.log(data);

            // Refresh the game that was affected
            this.updateGame(data.userDetails.username, data.gameCode);
        });

        // Subscribe to 'user deleted game' event
        // This will be triggered when the creator of a game decides to delete a game
        // before it starts.
        this.getEvent('user deleted game').subscribe((data) => {
            console.log(data);

            this.alertService.alert(new Alert({
                message: 'User <b>' + data.user + '</b> deleted game `' + data.game.title + '`',
                iconClass: 'fa-trash-alt',
                type: AlertType.Warning,
                alertId: 'game_delete_notification_' + data.game.code,
                buttonTitle: 'Reload List'
            }));
        });

        this.alertService.refreshNotification.subscribe((ev: NotificationEvent) => {
            if (ev.eventName === 'reload_game_list') {
                this.getUserGames();
            } else if (ev.eventName === 'join_game') {
                this.joinGame(ev.params.gameId, ev.params.gameCode);
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

    /**
     * Method to get the full list of the user's games.
     * 1. Pending games
     * 2. In progress games
     * 3. Completed games
     */
    getUserGames() {
        // this.clearGameLists();

        this.dashboardService.getUserGames().subscribe((games) => {
            // console.log(games);
            // Arrays for user-created games and invited games
            const pgd_ucg_arr = [];
            const pgd_ig_arr = [];

            // Array for in progress games
            const in_progress_arr = [];

            // Take incoming games and set the gamesList variable
            // to display on the front-end
            games.forEach((game) => {
                // Grab the basic game details that pending, in progress, and
                // completed games will be using
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

                // Based on the game's status, we fill the appropriate array
                // to display on the front-end
                switch (game.status) {
                    case 'CREATED':
                        const pendingGameDetails = gameDetails as PendingGameDetails;
                        pendingGameDetails.pendingPlayers = game.players.filter((player) => {
                            return player.status === 'PENDING';
                        });
                        pendingGameDetails.loggedInUserPending =
                            pendingGameDetails.pendingPlayers.some(e => e.player._id === this.loggedInUser._id);

                        // Break out user created and invited games
                        if (this.loggedInUser._id === pendingGameDetails.creator._id) {
                            pgd_ucg_arr.push(pendingGameDetails);
                        } else {
                            pgd_ig_arr.push(pendingGameDetails);
                        }

                        // Emit message from socket to join the game room for each of the games
                        // so we can be subscribed to messages to the different games
                        this.socketIo.emit('join room', 'game ' + pendingGameDetails.code);

                        break;
                    case 'IN PROGRESS':
                        const ipGameDetails = gameDetails as InProgressGameDetails;

                        in_progress_arr.push(ipGameDetails);
                        break;
                    case 'COMPLETED':
                        break;
                }
            });

            // Set the lists for pending user-created games and invited games so we get seamless data-binding
            this.pendingGamesList.userCreatedGames = Utils.deepCopy(pgd_ucg_arr);
            this.pendingGamesList.invitedGames = Utils.deepCopy(pgd_ig_arr);

            this.inProgressGamesList = Utils.deepCopy(in_progress_arr);

        }, (err) => {
            console.error(err);
        });
    }

    /**
     * Method to create a new game from the modal.
     */
    createGame() {
        this.gameCreationFormSubmitted = true;

        if (this.gameCreationForm.valid) {
            const formModel = this.gameCreationForm.value;
            // Extract the usernames into a simple string array
            const nPlayers = formModel.usernames.map((name) => {
                return name.uname;
            });

            // Create the gameDetails containing values from the form
            const gameDetails: GamePayload = {
                title: formModel.title as string,
                gameType: formModel.gameType as string,
                players: nPlayers as Array<string>
            };

            this.dashboardService.createNewGame(gameDetails).subscribe((createdGame) => {
                // We've successfully created a game,
                // Now we dismiss the modal and display the user's game list
                console.log(createdGame);

                if (createdGame) {
                    // Close the modal
                    this.riskModalRef.close();

                    // Show a notification
                    this.alertService.alert(new Alert({
                        message: 'New game `' + createdGame.title + '` created!',
                        iconClass: 'fa-check',
                        type: AlertType.Success,
                        alertId: 'game_create',
                        dismiss: true
                    }));

                    // Emit the game created event to all the users who were a part of the game
                    const payload = {
                        user: this.loggedInUser.username,
                        game: createdGame
                    };

                    this.socketIo.emit('game created', payload);

                    // Retrieve the new user's game list
                    this.getUserGames();

                    // Reset game creation form
                    this.gameCreationForm.reset({
                        gameType: 'private',
                        numberOfPlayers: 2
                    });
                }
            }, (err) => {
                console.error(err);
            });
        }
    }

    /**
     * Method to join a game that the user has been invited to.
     */
    joinGame(gameId: any, gameCode: string): void {
        this.dashboardService.joinGame(gameId).subscribe(() => {
            // Show a notification
            this.alertService.alert(new Alert({
                message: 'Joined game successfully.',
                iconClass: 'fa-check',
                type: AlertType.Success,
                alertId: 'game_joined',
                dismiss: true
            }));

            // Now that we've updated the database, emit the message via sockets
            // We use the game code as the data to send since we've named our
            // room accordingly
            this.socketIo.emit('joined game', gameCode);
            this.getUserGames();
        }, (err) => {
            console.error(err);
        });
    }

    /**
     * Method to start a game.
     */
    startGame(game: any) {
        this.dashboardService.startGame(game._id).subscribe((startedGame) => {
            // Show started game notification to user who started it
            this.alertService.alert(new Alert({
                message: 'Started game `' + startedGame.title + '`!',
                iconClass: 'fa-kiwi-bird',
                type: AlertType.Success,
                alertId: 'started_game_' + startedGame.code,
                dismiss: true
            }));

            // Now we redirect the user to the new risk game
            this.router.navigate(['/risk', startedGame.code]);

            // Now we notify everyone in the game that the game has started
            this.socketIo.emit('game started', startedGame);

            // TODO: Write message service to send messages to an inbox
        }, (err) => {
            console.error(err);
        });
    }

    /**
     * Method to cancel an existing game.
     */
    deleteGame(gameId: any): void {
        this.dashboardService.deleteGame(gameId).subscribe((delGame) => {
            // Close the modal
            this.riskModalRef.close();

            // Show a notification
            this.alertService.alert(new Alert({
                message: delGame.title + ' deleted successfully.',
                iconClass: 'fa-check',
                type: AlertType.Success,
                alertId: 'game_deleted',
                dismiss: true
            }));

            const payload = {
                user: this.loggedInUser.username,
                game: delGame
            };

            // Emit the game deleted event to all the users who were a part of the game
            this.socketIo.emit('game deleted', payload);

            this.getUserGames();
        });
    }

    /**
     * Update the pending game list by "refreshing" the game that was affected by another user joining/starting/canceling a game.
     */
     updateGame(username: string, gameCode: string): void {
         // Make the call to get the game from the game code and subscribe to the observable
         this.dashboardService.getGameByCode(gameCode).subscribe((retGame) => {

            // Show a notification
            this.alertService.alert(new Alert({
                message: username + ' has joined your game `' + retGame.title + '`!',
                iconClass: 'fa-user',
                alertId: 'game_joined_notification_' + retGame.code,
                // dismiss: true,
                type: AlertType.Success
            }));

            // Check the returned game's status and then map the array of existing games to update the game we're
            // interested in
            switch (retGame.status) {
                case 'CREATED':
                    // Update the user created games list
                    this.pendingGamesList.userCreatedGames = this.swapUpdatedGame(this.pendingGamesList.userCreatedGames, retGame);
                    this.pendingGamesList.invitedGames = this.swapUpdatedGame(this.pendingGamesList.invitedGames, retGame);
                    break;
                case 'INPROGRESS':
                    break;
                case 'COMPLETED':
                    break;
            }
         });
     }

    /**
     * Methods for the dynamic usernames to send invites to
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

    /** End dynamic usernames methods **/

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with ${reason}`;
        }
    }

    // private clearGameLists(): void {
    //     this.pendingGamesList.userCreatedGames = [];
    //     this.pendingGamesList.invitedGames = [];
    // }

    // Private method to listen for 'joined game' socket events
    private getEvent(eventName: string): Observable<any> {
        return this.socketIo
            .fromEvent<any>(eventName)
            .pipe(
                map((data: any) => {
                    // console.log(data);
                    return data;
                })
            );
    }

    // Private method to update array of games with an updated game
    private swapUpdatedGame(gameArray: any, gameToSwap: any) {
        return gameArray.map((iexistGame) => {
            if (iexistGame.code === gameToSwap.code) {
                // We replace the existing game's players with the returned game's players
                // Also update the pending players and possibly logged in user pending
                iexistGame.players = []; // Reset the players array of existing game
                // Make a deep copy of the gameToSwap.players array
                for (let i = 0; i < gameToSwap.players.length; i++) {
                    iexistGame.players.push(gameToSwap.players[i]);
                }
                iexistGame.pendingPlayers = iexistGame.players.filter((player) => {
                    return player.status === 'PENDING';
                });
                iexistGame.loggedInUserPending =
                    iexistGame.pendingPlayers.some(e => e.player._id === this.loggedInUser._id);
            }

            return iexistGame;   // Finally return either the current array obj or the updated one
        });
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
