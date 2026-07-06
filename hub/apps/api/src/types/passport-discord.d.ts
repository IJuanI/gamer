declare module "passport-discord" {
  import { Strategy as PassportStrategy } from "passport";

  export interface StrategyOptions {
    clientID?: string;
    clientSecret?: string;
    callbackURL?: string;
    scope?: string[];
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: unknown, user?: unknown) => void,
      ) => void,
    );
  }
}
