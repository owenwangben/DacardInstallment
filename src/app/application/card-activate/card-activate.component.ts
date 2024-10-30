import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { ServiceHelper, ApplyService, AuthHelper } from 'src/app/shared/shared.module';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RxFormBuilder, error, required, pattern } from '@rxweb/reactive-form-validators';
import { AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { CardNumberMaskPipe } from 'src/app/shared/pipes/cardnumbermask.pipe';
import { CaptchaComponent } from 'src/app/shared/components/captcha/captcha.component';
import { MaskApplierService } from 'ngx-mask';
import { GeneralSensorsTrack } from 'src/app/shared/services/sensorsdata';

@Component({
    selector: 'app-card-activate',
    templateUrl: './card-activate.component.html',
    styleUrls: ['./card-activate.component.scss']
})

export class CardActivateComponent implements OnInit {
    @ViewChild(CaptchaComponent) captcha: CaptchaComponent;

    form: FormGroup;
    eyeOpen = false;
    stepIndex = 0;
    displayCardNo = "";
    IsLinePointCard = false; // 是否為 LINE 點數卡
    sso = false;
    errorMessage: string;
    app = new AppWrapper();
    /** APP會員狀態 */
    LoginData: any;

    constructor(
        private maskService: MaskApplierService,
        private formBuilder: RxFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private applyService: ApplyService
    ) { }

    async ngOnInit() {
        this.app.initHeaderBack('線上開卡');
        this.LoginData = await this.app.getLoginData();
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if(this.LoginData.userType === null ||this.LoginData.userType?.trim() === "") { this.LoginData.userType = "None"; }
        this.form = this.formBuilder.formGroup(new CardActiveModel());

        this.sso = this.route.snapshot.data.Sso;
        if (this.sso) {
            const cardNo: string = history.state.cardNo;
            const ExpDate: string = history.state.cardNo;
            if (cardNo /*&& ExpDate*/) {
                // 自動帶入卡號
                this.form.patchValue({ CardNo: cardNo /*, ExpiryMM: ExpDate.slice(0, 2), ExpiryYY: ExpDate.slice(2, 4)*/ });
                this.hideCardNo();
            }
        }

        this.app.dataCallackEvent.subscribe((event) => {
            if (event.id === 'cameraOCR') {
                const data = event.data as any;
                this.form.patchValue({
                    CardNo: data?.card_no,
                    ExpiryMM: data?.expire_date?.substr(0, 2),
                    ExpiryYY: data?.expire_date?.substr(2)
                });
                $('[formControlName="CardNo"]').focus();
            }
        });
    }

    ngAfterViewInit() {
    }

    async submit() {
        this.form['submitted'] = true;
        if (this.form.valid) {
            try {
                var response;
                if(this.sso) {
                    //已登入
                    response = await this.applyService.CardActivationSso({
                        CardNo: this.form.value.CardNo,
                        BOD_YYYYMMDD: this.form.value.DOB,
                        ValidDate_MMYY: this.form.value.ExpiryMM + this.form.value.ExpiryYY,
                        ID: AuthHelper.CustomerId,
                        Verify_Method: this.LoginData.userType
                    }, this.form.value.Captcha);
                }
                else {
                    //未登入
                    response = await this.applyService.CardActivation({
                        CardNo: this.form.value.CardNo,
                        BOD_YYYYMMDD: this.form.value.DOB,
                        ValidDate_MMYY: this.form.value.ExpiryMM + this.form.value.ExpiryYY,
                        Verify_Method: this.LoginData.userType
                    }, this.form.value.Captcha);
                }

                if (ServiceHelper.ifSuccess(response, false)) {
                    GeneralSensorsTrack("EnableCardConfirm",true);
                    this.IsLinePointCard = response.Result?.IsLinePointCard;
                    this.stepIndex = 1;
                } else {
                    GeneralSensorsTrack("EnableCardConfirm",false);
                    this.stepIndex = 2;
                    this.errorMessage = response.ResultMessage;
                }
                window.scrollTo(0, 0);
            }
            catch (error) {
                if (error.status === 406) { // 驗證碼錯誤
                    this.form.controls.Captcha['setBackEndErrors']({ invalidValue: error.error });
                }
                else {
                    console.log(error);
                    ServiceHelper.showError('系統發生錯誤，請稍後再試！');
                }
            }
        }
        this.captcha.refreshCaptcha();
    }

    // 卡片期限月份自動跳到年份
    public onKeyDate = function (e) {
        if (e.target.value.length >= 2) {
            $('[formControlName="ExpiryYY"]').focus();
        }
    };

    // 隱藏信用卡卡號
    public hideCardNo() {
        this.displayCardNo = new CardNumberMaskPipe().transform(this.maskService.applyMask(this.form.value.CardNo, '0000-0000-0000-0000'), "●");
    }

    // 顯示信用卡卡號
    public showCardNo() {
        this.displayCardNo = this.maskService.applyMask(this.form.value.CardNo, '0000-0000-0000-0000');
    }

    // 切換卡號顯示狀態
    public changeEyeStatus() {
        this.eyeOpen = !this.eyeOpen;
        if (this.eyeOpen) {
            this.showCardNo();
        } else {
            this.hideCardNo();
        }
    }

    // 相機OCR信用卡卡號
    public async cameraOCR() {
        this.app.scanCreditCard('cameraOCR');
    }

    public CallCustomerServer() {
        this.app.showCustomerService();
    }

    public goCardManage() {
        this.app.routeByBillID({ billID: 'f5ae6e8a-5b67-4bfa-8f76-c156531d4246', closeWeb: true });
    }

    public goHome() {
        if (this.sso) {
            this.router.navigate(['/Account/CardManage']);
        } else {
            this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
        }
    }

    public goLineOA() {
        window.open('https://linebc.sinopac.com/SmartRobotbcweb/1k9lZ5#open-browser', '_blank');
    }
}

// https://docs.rxweb.io/getting-started
// https://github.com/rxweb/rxweb/tree/master/client-side/angular/packages/reactive-form-validators
class CardActiveModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*信用卡卡號不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{16}$/ }, message: '*哎呀！信用卡卡號格式有誤，請重新輸入。' })
    CardNo: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*有效月份不能空著唷。' })
    @pattern({ expression: { pattern: /^(0[123456789])|(1[012])$/ }, message: '*哎呀！有效月份格式有誤，請重新輸入。' })
    ExpiryMM: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*有效年份不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{2}$/ }, message: '*哎呀！有效年份格式有誤，請重新輸入。' })
    ExpiryYY: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*出生年月日不能空著唷。' })
    @pattern({ expression: { pattern: /^((?:19|20)\d\d)((((0[13578])|(1[02]))(([0-2][0-9])|(3[01])))|(((0[469])|(11))(([0-2][0-9])|(30)))|(02[0-2][0-9]))$/ }, message: '*哎呀！出生年月日格式有誤，請重新輸入。' })
    DOB: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*驗證碼不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{6}$/ }, message: '*哎呀！驗證碼格式有誤，請重新輸入。' })
    Captcha: string;
}
