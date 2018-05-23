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
    numPlayers: number;
    creator?: object;
    players?: null;
    endDate?: Date;
    private: boolean;
    code?: string;
    status?: string;
}
