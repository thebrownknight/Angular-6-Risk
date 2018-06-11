import { APP_INITIALIZER, PLATFORM_ID, NgModule, ModuleWithProviders } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { SocketService } from './socket.service';
import { SocketConfig, SOCKET_CONFIG_TOKEN } from './socket.config';

export function SocketFactory(config: SocketConfig, platformId: any) {
    return new SocketService(config, platformId);
}

export function AppInitFactory(socketIo: SocketService, config: SocketConfig, platformId: any) {
    const appLoadSetting = (config.connectOnAppLoad || config.connectOnAppLoad === undefined);
    const platformIsBrowser = isPlatformBrowser(platformId);
    return initApp(platformIsBrowser && appLoadSetting, socketIo);
}

export function initApp(connectOnStart: boolean, socketIo: SocketService) {
    return function () {
        if (connectOnStart) {
            socketIo.connect();
        }
    };
}


@NgModule()
export class SocketModule {
    static forRoot(config: SocketConfig): ModuleWithProviders {
        return {
            ngModule: SocketModule,
            providers: [
                {
                    provide: SOCKET_CONFIG_TOKEN,
                    useValue: config
                },
                {
                    provide: SocketService,
                    // Specify the factory to use to create a value for the SocketService token
                    useFactory: SocketFactory,
                    // These values are resolved through the Inject parameters
                    // in the constructor of SocketService and then are used in the factory function
                    deps: [SOCKET_CONFIG_TOKEN, PLATFORM_ID]
                },
                {
                    // Function to execute when app is initialized
                    provide: APP_INITIALIZER,
                    useFactory: AppInitFactory,
                    deps: [SocketService, SOCKET_CONFIG_TOKEN, PLATFORM_ID],
                    // If multi is true, injector returns an array of instances
                    // Useful to allow multiple providers spread across multiple files to provide configuration information for a
                    // common token
                    multi: true
                }
            ]
        };
    }
}

