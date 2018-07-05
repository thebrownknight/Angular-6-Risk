import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routing } from './app.routing';

import { AppComponent } from './app.component';

import { AuthGuardService } from './services/auth-guard.service';
import { JwtInterceptorProvider } from './helpers/jwt.interceptor';
import { ErrorInterceptorProvider } from './helpers/error.interceptor';
import { AuthenticationService } from './services/authentication.service';
import { AlertService } from './services/alert.service';

import { UsernameValidator } from './helpers/custom-validators/existing-username-validator';
import { LoginComponent } from './components/login/login.component';
import { PasswordStrengthComponent, RegisterComponent } from './components/register/index';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PublicGamesComponent } from './components/dashboard/public-games/public-games.component';
import { UserSettingsComponent } from './components/dashboard/user-settings/user-settings.component';
import { UserStatsComponent } from './components/dashboard/user-stats/user-stats.component';
import { UserGamesComponent } from './components/dashboard/user-games/user-games.component';
import { TabsComponent } from './components/ui/tabs/tabs.component';
import { TabComponent } from './components/ui/tabs/tab/tab.component';

import { RiskModalModule } from './components/ui/modal/modal.module';
import { RiskAccordionModule } from './components/ui/accordion/accordion.module';
import { RiskSlidePanelModule } from './components/ui/slide-panel/slidepanel.module';
import { RiskAlertModule } from './components/ui/alert/alert.module';
import { SocketModule, SocketConfig } from './services/sockets/index';
import { MapModule } from './components/map/map.module';

// Sockets configuration
const config: SocketConfig = {
    url: 'http://localhost:8988',
    options: {},
    connectOnAppLoad: false
};

@NgModule({
  declarations: [
    AppComponent,
    TabsComponent,
    TabComponent,
    PasswordStrengthComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    DashboardComponent,
    PublicGamesComponent,
    UserSettingsComponent,
    UserStatsComponent,
    UserGamesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    routing,
    SocketModule.forRoot(config),
    RiskModalModule.forRoot(),
    RiskAccordionModule,
    RiskSlidePanelModule,
    RiskAlertModule,
    MapModule
  ],
  providers: [
    AuthGuardService,
    AuthenticationService,
    AlertService,
    UsernameValidator,
    JwtInterceptorProvider,
    ErrorInterceptorProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
