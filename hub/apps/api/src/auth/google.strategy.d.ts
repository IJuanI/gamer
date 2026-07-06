import { Strategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import { UsersService } from "../users/users.service";
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
/** Registered only when GOOGLE_CLIENT_ID/SECRET are set (see auth.module). */
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly users;
    constructor(users: UsersService);
    validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback): Promise<void>;
}
export {};
