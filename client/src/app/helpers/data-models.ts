/**
 * Model for user details from JWT token.
 */
export interface UserDetails {
    _id: string;
    email: string;
    username: string;
    exp: number;
    iat: number;
}

/**
 * Model for token payload to send with login and register requests.
 */
export interface TokenPayload {
    email?: string;
    username: string;
    password: string;
}

/**
 * Model for creating a new game.
 */
export interface GamePayload {
    title: string;
    gameType: string;
    players?: Array<string>;
    numberOfPlayers?: number;
}

/**
 * Model for shared details of returned game.
 */
export interface GameDetails {
    _id: string;
    createdAt: string;
    title: string;
    creator: any;
    players: Array<any>;
    numberOfPlayers: number;
    endDate: string;
    gameType: string;
    code: string;
    status: string;
}

/**
 * Model for pending game.
 */
export interface PendingGameDetails extends GameDetails {
    pendingPlayers: Array<any>;
    loggedInUserPending: Boolean;
    [key: string]: any;
}

/****************************************/
// Alert data models.
/****************************************/
export class Alert {
    type: AlertType;
    message: any;
    alertId: string;
    keepAfterRouteChange: boolean;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}

/****************************************/
// Socket message models.
/****************************************/
export enum SocketAction {
    JOINED,
    LEFT,
    RENAME
}

export enum SocketEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect'
}

export interface SocketMessage {
    from?: UserDetails;
    content?: any;
    action?: SocketAction;
}
