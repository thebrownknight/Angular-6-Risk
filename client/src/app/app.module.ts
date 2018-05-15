import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { routing } from './app.routing';

import { AppComponent } from './app.component';

import { AuthGuard } from './services/auth.guard';
import { JwtInterceptorProvider } from './helpers/jwt.interceptor';
import { ErrorInterceptorProvider } from './helpers/error.interceptor';
import { AuthenticationService } from './services/authentication.service';
import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing
  ],
  providers: [
      AuthGuard,
      AuthenticationService,
      JwtInterceptorProvider,
      ErrorInterceptorProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
