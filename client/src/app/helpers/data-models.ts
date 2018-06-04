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
 * Model for returned game.
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
