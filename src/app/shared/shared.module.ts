import { DataService } from './services/sinopac/data.service';
import { MemberService } from './services/sinopac/member.service';
import { AccountService } from './services/sinopac/account.service';
import { NgModule } from '@angular/core';
import { AuthGuard } from './services/auth.gaurd';
import { AuthService } from './services/sinopac/auth.service';
import { WebApiService } from './services/webapi.service';
import { LoaderService } from './services/loader.service';
import { CommonModule } from '@angular/common';
import { StringLengthPipe } from './pipes/stringlength.pipe';
import { CardNumberMaskPipe } from './pipes/cardnumbermask.pipe';
import { CardTypePipe } from './pipes/cardtype.pipe';
import { ApplyService } from './services/sinopac/apply.service';
import { BonusService } from './services/sinopac/bonus.service';
import { MobileMaskPipe } from './pipes/mobilemask.pipe';
import { SharedService } from './services/sinopac/shared.service';
import { OnblurMaskDirective } from './directives/onblurmask.directive';
import { CaptchaComponent } from './components/captcha/captcha.component';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { LoadHtmlDirective } from './directives/load-html.directive';
import AuthHelper from './helpers/auth.helper';
import ServiceHelper from './helpers/service.helper';
import AppHelper from './helpers/app.helper';
import { AgreementService } from './services/sinopac/agreement.service';
import { CustomDatePipe } from './pipes/customDate.pipe';
import { PreventDoubleClickDirective } from './directives/prevent-doubleclick.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { defaultSimpleModalOptions, SimpleModalModule } from 'ngx-simple-modal';
import { ScrollCheckDirective } from './directives/scroll-check.directive';
import { NoticeDialogComponent } from './dialog/notice-dialog/notice-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddressMaskPipe } from './pipes/addressmask.pipe';
import { CustomMaskPipe } from './pipes/custommask.pipe';
import { CardReissueService } from '../application/card-reissue/shared/card-reissue.shared.service';
import { PriceMaskPipe } from './pipes/pricemask.pipe';
import { RegisterService } from './services/sinopac/register.service';
import { CardNumberAndBankCodeMaskPipe } from './pipes/cardnumberandbankcodemask.pipe';
import { UnauthorizedService } from './services/sinopac/unauthorized.service';
import { FidoService } from './services/sinopac/fido.service';
import dataTranslateHelper from './helpers/dataTranslate.helper';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        RxReactiveFormsModule,
        SimpleModalModule.forRoot(
            { container: 'modal-container' },
            {
                ...defaultSimpleModalOptions,
                ...{
                    closeOnEscape: true,
                    closeOnClickOutside: true,
                    animationDuration: 0,
                    autoFocus: true,
                },
            }
        ),
    ],
    declarations: [
        StringLengthPipe,
        CardNumberMaskPipe,
        CardTypePipe,
        MobileMaskPipe,
        CustomDatePipe,
        OnblurMaskDirective,
        CaptchaComponent,
        LoadHtmlDirective,
        PreventDoubleClickDirective,
        NumberOnlyDirective,
        ScrollCheckDirective,
        NoticeDialogComponent,
        AddressMaskPipe,
        CustomMaskPipe,
        PriceMaskPipe,
        CardNumberAndBankCodeMaskPipe
    ],
    exports: [
        CommonModule,
        StringLengthPipe,
        CardNumberMaskPipe,
        CardTypePipe,
        MobileMaskPipe,
        CustomDatePipe,
        OnblurMaskDirective,
        CaptchaComponent,
        LoadHtmlDirective,
        PreventDoubleClickDirective,
        NumberOnlyDirective,
        ScrollCheckDirective,
        NoticeDialogComponent,
        AddressMaskPipe,
        CustomMaskPipe,
        PriceMaskPipe,
        CardNumberAndBankCodeMaskPipe
    ]
})
export class SharedModule { }
export {
    CommonModule,
    AuthGuard,
    AuthHelper,
    AppHelper,
    ServiceHelper,
    WebApiService,
    LoaderService,
    AuthService,
    AccountService,
    ApplyService,
    MemberService,
    BonusService,
    SharedService,
    AgreementService,
    DataService,
    CardReissueService,
    RegisterService,
    UnauthorizedService,
    FidoService,
    dataTranslateHelper,
};
