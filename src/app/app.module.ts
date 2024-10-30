import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaptchaService } from './shared/components/captcha/captcha.service';
import { AuthGuard, AuthService, AccountService, ApplyService, MemberService, LoaderService, WebApiService, BonusService, AgreementService, DataService, CardReissueService, RegisterService, UnauthorizedService, FidoService } from './shared/shared.module';
import { AutoDeductService } from './shared/services/sinopac/autodeduct.service';
import { FinanceService } from './shared/services/sinopac/finance.service';
import { SiteConfigService } from './shared/services/sinopac/site-config.service';
import { SensorsService } from './shared/services/sensors.service';



@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule
    ],
    providers: [
        RxFormBuilder,
        AuthGuard,
        AuthService,
        AccountService,
        ApplyService,
        MemberService,
        LoaderService,
        SiteConfigService,
        WebApiService,
        BonusService,
        CaptchaService,
        AgreementService,
        DataService,
        DatePipe,
        CardReissueService,
        RegisterService,
        AutoDeductService,
        FinanceService,
        UnauthorizedService,
        SensorsService,
        FidoService
    ],
    bootstrap: [AppComponent],
    exports: [
    ],
})
export class AppModule { }
