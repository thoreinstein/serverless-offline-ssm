import Plugin from 'serverless/classes/Plugin';
import { ServerlessOffline, ServerlessOptions } from './types';
declare class ServerlessOfflineSSM implements Plugin {
    serverless: ServerlessOffline;
    options: ServerlessOptions;
    private log;
    private customOptions;
    hooks: Plugin.Hooks;
    commands?: Plugin.Commands;
    constructor(serverless: ServerlessOffline, options: ServerlessOptions);
    applyResolver(): void;
    shouldExecute(): boolean;
    /**
     * This plugin is only compatible with serverless 1.69+
     */
    private checkCompatible;
    private setCustomConfig;
}
export = ServerlessOfflineSSM;
