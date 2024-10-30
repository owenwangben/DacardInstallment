import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { PaybillService } from 'src/app/shared/services/sinopac/paybill.service';
import { AuthHelper, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import { error, pattern, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { GeneralSensorsTrack } from 'src/app/shared/services/sensorsdata';


@Component({
    selector: 'app-card-bundle',
    templateUrl: './card-bundle.component.html',
    styleUrls: ['./card-bundle.component.scss']
})
export class CardBundleComponent implements OnInit {
    private readonly app = new AppWrapper();
    public selectedIndex: number = 0;

    private idNumber: string;
    public beenSendOTP: boolean = false;
    private Cardno: string;
    private cardExpDate: string;
    private bindstate: boolean;
    public mobile: string;
    public sessionKey: string;
    public countdown = 0;
    otpform: FormGroup;
    reGenerateCount = 0; // 重發最多兩次

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private memberService: MemberService,
        private paybillService: PaybillService,
        private formBuilder: RxFormBuilder,
    ) {
        this.otpform = this.formBuilder.formGroup(new OTPModel());
    }

    async ngOnInit() {
        this.app.initHeaderBack('大咖 APP 綁定');

        // 跳轉方法2為App Top 返回按鈕如果吃URL時可使用
        // // 跳轉方法1
        // const Cardno = this.Cardno = this.route.snapshot.queryParamMap.get('encodeCardno');
        // const cardExpDate = this.cardExpDate = this.route.snapshot.queryParamMap.get('ecnodeExpDate');
        // const bindstate = this.bindstate = this.route.snapshot.queryParamMap.get('bindstate')?.toLowerCase() == 'true' ? true : false;
        // 跳轉方法2
        const Cardno: string = this.Cardno = history.state.encodeCardno;
        const cardExpDate: string = this.cardExpDate = history.state.ecnodeExpDate
        const bindstate = this.bindstate = history.state.bindstate;

        this.idNumber = AuthHelper.CustomerId
        if (!Cardno || !cardExpDate || bindstate == null || bindstate == undefined || !this.idNumber) {
            this.app.showMsgDialog({ id: 'GetParamentFail', title: '請先至CardManage', msg: '未取得綁定相關參數，請先至CardManage', btnStr: '確定' });
            this.router.navigateByUrl('..');
        }
        // 取得客戶手機
        const MobileResponse = await this.memberService.QueryMobile({ ID: this.idNumber })
        if (ServiceHelper.ifSuccess(MobileResponse, false)) {
            if (!MobileResponse.Result.Mobile) {
                this.app.showMsgDialog({ id: 'QueryMobileIsEmpty', title: '手機號碼為空', msg: '手機號碼為空', btnStr: '確定' });
                this.router.navigateByUrl('..');
            }
            this.mobile = MobileResponse.Result.Mobile;
            this.sessionKey = MobileResponse.Result.SessionKey;
        } else {
            this.app.showMsgDialog({ id: 'QueryMobileFail', title: '取得手機號碼失敗', msg: MobileResponse.ResultMessage, btnStr: '確定' });
            this.router.navigateByUrl('..');
            return; // 取得手機號碼失敗
        }

        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'VerifyOTPLimit' && event.action === 0) {
                this.router.navigate(['/Account/CardManage']);
            }
            if (event.id === 'VerifyOTPLimit' && event.action === 1) {
                this.CallCustomerServer();
            }
            if (event.id === 'CardUnbind' && event.action === 0) {
                this.BindCreditCard();
            }
            if (event.id === 'OTPReGenerateLimit' && event.action === 0) {
                this.router.navigate(['/Account/CardManage']);
            }
            if (event.id === 'OTPDayGenerateLimit' && event.action === 0) {
                this.router.navigate(['/Account/CardManage']);
            }
            if (event.id === 'BindCreditCardSuccess' && event.action === 0) {
                this.router.navigate(['/Account/CardManage']);
            }
        });
    }

    async generateOTP(regenerate: boolean = false) {
        if (!this.mobile) {
            GeneralSensorsTrack("SendSMSVerficationCode",false);
            this.app.showMsgDialog({ id: 'QueryMobileIsEmpty', title: '手機號碼為空', msg: '手機號碼為空', btnStr: '確定' });
            return;
        }
        if (!regenerate) {
            setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                }
            }, 1000);
        }
        else if (regenerate) {
            if (this.reGenerateCount >= 2) {
                GeneralSensorsTrack("SendSMSVerficationCode",false);
                this.app.showMsgDialog({ id: 'OTPReGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
                return;
            }
        }

        // 每日發送上限次數： 20 次
        const OTPResponse = await this.memberService.GenerateOTP({ ID: this.idNumber, mobile: this.mobile, functionCode: 101, RequireCheckTimeout: regenerate, SessionKey: this.sessionKey })
        if (ServiceHelper.ifSuccess(OTPResponse)) {
            GeneralSensorsTrack("SendSMSVerficationCode",true);
            this.countdown = 120;
            this.beenSendOTP = true;
            if (regenerate) {
                this.reGenerateCount++;
            }
        }
        else if (OTPResponse?.ResultCode == '06') {
            GeneralSensorsTrack("SendSMSVerficationCode", true);
            this.app.showMsgDialog({ id: 'OTPNotExpired', title: '簡訊密碼未失效', msg: '剛剛傳送給您的簡訊密碼尚未失效!', btnStr: '確定' });
            return;
        }
        else if (OTPResponse?.ResultCode === '01') { // 20 次上限
            GeneralSensorsTrack("SendSMSVerficationCode",false);
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
        }
        else {
            GeneralSensorsTrack("SendSMSVerficationCode",false);
            this.app.showMsgDialog({ id: 'OTPGenerateFail', title: '驗證碼發送失敗', msg: OTPResponse?.ResultMessage, btnStr: '確定' });
        }
    }

    async OTPsubmit() {
        // 表單檢核
        this.otpform['submitted'] = true;
        if (!this.otpform.valid) {GeneralSensorsTrack("ConfirmSMSVerficationCode",false);return;}

        // 驗證OTP
        const VerifyResponse = await this.memberService.VerifyOTP({ functionCode: 101, ID: this.idNumber, otp: this.otpform.controls.captcha.value })
        if (ServiceHelper.ifSuccess(VerifyResponse, false)) { GeneralSensorsTrack("ConfirmSMSVerficationCode",true);}
        else if (VerifyResponse.ResultCode == '04') {
            GeneralSensorsTrack("ConfirmSMSVerficationCode",false);
            this.app.showMsgDialog({ id: 'VerifyOTPFailCount', title: 'OTP驗證錯誤', msg: '驗證碼錯誤，請重新輸入', btnStr: '確定' });
            return; // OTP驗證次數未達上限
        }
        else if (VerifyResponse.ResultCode == '02' && VerifyResponse.Result.HasReachedMaxTries) {
            GeneralSensorsTrack("ConfirmSMSVerficationCode",false);
            this.app.showMsgSelDialog({ id: 'VerifyOTPLimit', title: 'OTP驗證次數已達上限', msg: '驗證碼錯誤已達上限，請重新綁定。', btnOK: '確定', btnNO: '聯繫客服' });
            return; // OTP驗證次數已達上限
        }
        else {
            GeneralSensorsTrack("ConfirmSMSVerficationCode",false);
            this.app.showMsgDialog({ id: 'VerifyOTPFail', title: 'OTP驗證失敗', msg: VerifyResponse.ResultMessage, btnStr: '確定' });
            return; // OTP驗證失敗
        }

        //變更綁定狀態
        if (this.bindstate) {
            // 解綁
            this.app.showMsgSelDialog({ id: 'CardUnbind', title: '解除卡片綁定', msg: '下次綁定需要再重新輸入簡訊驗證碼喔', btnOK: '確定解除' });
        } else {
            // 綁定
            this.BindCreditCard();
        }
    }

    private async BindCreditCard() {
        // TODO is_default 是否需要傳值??
        const StateResponse = await this.paybillService.BindCreditCard({
            creditcard_no: this.Cardno,
            expire_date: this.cardExpDate,
            bound: !this.bindstate,
            is_default: null
        })
        if (ServiceHelper.ifSuccess(StateResponse, false)) {
            this.app.showMsgDialog({ id: 'BindCreditCardSuccess', title: '', msg: '變更綁定狀態成功', btnStr: '確定', allowOutsideClick:false });
        }
        else {
            //關閉OTP倒數
            this.countdown = 0;
            this.app.showMsgDialog({ id: 'BindCreditCardFail', title: '變更綁定狀態失敗', msg: StateResponse.ResultMessage, btnStr: '確定' });
            // TODO 綁定失敗後處理
        }
    }

    public CallCustomerServer() {
        this.app.showCustomerService();
    }

    goEditMobile() {
        location.href = "https://mma.sinopac.com/Shared/HomePageTwd.aspx?CH=setting&ID=2#open-browser";
    }
}

class OTPModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.dirty || control.parent['submitted'] })
    @required({ message: '*請輸入驗證碼。' })
    @pattern({ expression: { pattern: /^[0-9]{6}$/ }, message: '*請輸入6位數字驗證碼。' })
    captcha: string;
}
