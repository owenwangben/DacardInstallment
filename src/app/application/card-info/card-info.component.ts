import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error, pattern, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { AuthHelper, AuthService, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import { Clipboard } from "@angular/cdk/clipboard";
import Swal from 'sweetalert2';

@Component({
    selector: 'app-card-info',
    templateUrl: './card-info.component.html',
    styleUrls: ['./card-info.component.scss']
})
export class CardInfoComponent implements OnInit {
    private readonly app = new AppWrapper();
    private idNumber = '';
    selectedIndex = 2;
    mobile = '';
    public sessionKey: string;
    hideCardInfo = true;

    // 卡片資訊
    cardUrl = '';
    cardName = '';
    cardBrand = '';
    cardNo = '';
    expDate = '';
    CVV2 = '';
    ElectronicTicketName = '';
    ElectronicTicketNo = '';

    countdown = 0; // OTP倒數
    reGenerateCount = 0; // 重發最多兩次
    sso = false;

    otpform: FormGroup;

    constructor(
        private memberService: MemberService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: RxFormBuilder,
        public clipboard: Clipboard,
        private authService: AuthService
    ) {
        this.otpform = this.formBuilder.formGroup(new OTPModel());
    }

    async ngOnInit() {
        this.selectedIndex = 2;
        this.app.initHeaderBack('查詢卡片資訊');
        this.sso = this.route.snapshot.data.Sso;
        if (this.sso) {
            this.idNumber = AuthHelper.CustomerId.toLocaleUpperCase()
            this.cardNo = history.state.CardNo;
            this.expDate = history.state.ExpDate;
            this.cardName = history.state.CardName;
            this.cardUrl = history.state.CardUrl;
            this.getBrandName(history.state.CardBrand);
            await this.checkQueryCardInfoLimit()
            // await this.getCustomerNumber();
        }

        this.app.dialogCallackEvent.subscribe(event => {
            // if (event.id === 'VerifyOTPFail' && event.action === 0) {
            //     this.goHome();
            // }
            // if (event.id === 'VerifyOTPLimit' && event.action === 0) {
            //     this.goHome();
            // }
            // if (event.id === 'VerifyOTPLimit' && event.action === 1) {
            //     this.callCustomerServer();
            // }
            // if (event.id === 'OTPReGenerateLimit' && event.action === 0) {
            //     this.goHome();
            // }
            // if (event.id === 'OTPDayGenerateLimit' && event.action === 0) {
            //     this.goHome();
            // }
            if (event.id === 'QueryCardInfoLimit' && event.action === 0) {
                this.goHome();
            }
            if (event.id === 'QueryCardInfoFail' && event.action === 0) {
                this.goHome();
            }
        });
    }

    // 查詢交易設定次數
    async checkQueryCardInfoLimit() {
        try {
            const response = await this.authService.CheckFunctionLimit({
                FunctionCode: "1",
                FunctionKey: this.idNumber,
                Source: "DACARD"
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                if(response.Result.TodayCount >= response.Result.DailyLimit){
                    this.app.showMsgDialog({ id: 'QueryCardInfoLimit', title: '本日查詢次數已達上限', msg: '本日查詢次數已達上限，若有問題請洽客服專線(02)2528-7776', btnStr: '確定', allowOutsideClick:false });
                }else{
                    await this.getCardInfo();
                }
                return;
            }
        } catch (error) {
            console.log(error)
        }
        this.app.showMsgDialog({ id: 'QueryCardInfoFail', title: '卡片資訊查詢失敗', msg: '卡片資訊查詢失敗，若有問題請洽客服專線(02)2528-7776', btnStr: '確定', allowOutsideClick:false });
    }

    // 更新交易設定次數
    public async updateFunctionCount() {
        try {
            await this.authService.UpdateFunctionCount({
                FunctionCode: "1",
                FunctionKey: this.idNumber,
                Source: "DACARD"
            })
        } catch (error) {
            console.log(error);
        }
    }

    copyCardNumber() {
        this.clipboard.copy(this.cardNo);
        Swal.fire({
            text: '已成功複製信用卡卡號', icon: 'success', confirmButtonText: '我知道了',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }
    copyElectronicTicketNo() {
        this.clipboard.copy(this.ElectronicTicketNo);
        Swal.fire({
            text: '已成功複製電子票證號碼', icon: 'success', confirmButtonText: '我知道了',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }

    private getBrandName(cardBrand) {
        switch (cardBrand) {
            case 'M':
                this.cardBrand = 'Mastercard'
                break
            case 'J':
                this.cardBrand = 'JCB'
                break
            case 'V':
                this.cardBrand = 'VISA'
                break
            case 'A':
                this.cardBrand = 'American Express'
                break
        }
    }

    // 取得客戶手機
    async getCustomerNumber() {
        const MobileResponse = await this.memberService.QueryMobile({ ID: this.idNumber })
        if (ServiceHelper.ifSuccess(MobileResponse, false)) {
            this.mobile = MobileResponse.Result.Mobile;
            this.sessionKey = MobileResponse.Result.SessionKey;
        } else {
            this.app.showMsgDialog({ id: 'QueryMobileFail', title: '取得手機號碼失敗', msg: MobileResponse.ResultMessage, btnStr: '確定' });
            return; // 取得手機號碼失敗
        }
    }

    //
    async nextStep() {
        await this.generateOTP()
        this.selectedIndex++;
    }

    // 產生OTP驗證碼
    async generateOTP(regenerate: boolean = false) {
        if (!this.mobile) {
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
                this.app.showMsgDialog({ id: 'OTPReGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
                return;
            }
        }

        const OTPResponse = await this.memberService.GenerateOTP({ ID: this.idNumber, mobile: this.mobile, functionCode: 102, RequireCheckTimeout: regenerate, SessionKey: this.sessionKey })
        if (ServiceHelper.ifSuccess(OTPResponse,false)) {
            this.countdown = 120;
            if (regenerate) {
                this.reGenerateCount++;
            }
        }
        else if(OTPResponse.ResultCode=='01')
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
        else if(OTPResponse.ResultCode=='02')
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼錯誤次數達上限', msg: OTPResponse.ResultMessage, btnStr: '確定' });
        else if (OTPResponse.ResultCode == '06') {
            this.app.showMsgDialog({ id: 'OTPNotExpired', title: '簡訊密碼未失效', msg: '剛剛傳送給您的簡訊密碼尚未失效!', btnStr: '確定' });
            return;
        }

    }

    public goHome() {
        if (this.sso)
            this.router.navigate(['/Account/CardManage']);
        else
            this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }

    async OTPsubmit() {
        // 表單檢核
        this.otpform['submitted'] = true;
        if (!this.otpform.valid) return;

        // 驗證OTP
        const VerifyResponse = await this.memberService.VerifyOTP({ functionCode: 102, ID: this.idNumber, otp: this.otpform.controls.captcha.value })
        if (ServiceHelper.ifSuccess(VerifyResponse, false)) {
            const cardInfoResponse = await this.memberService.QueryCardInfo({ CardNo: this.cardNo, ID: this.idNumber });
            if (ServiceHelper.ifSuccess(cardInfoResponse, false)) {
                this.updateFunctionCount();
                this.CVV2 = cardInfoResponse.Result.CVV2;
                this.ElectronicTicketName = cardInfoResponse.Result.ElectronicTicketName;
                this.ElectronicTicketNo = cardInfoResponse.Result.ElectronicTicketNo?.trim();
                this.selectedIndex++
            }else{
                let swal = Swal.fire({
                    text: "卡片資訊查詢失敗，若有問題請洽客服專線(02)2528-7776", icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                if ((await swal).isConfirmed) {
                    this.goHome();
                }
                return;
            }
        }
        else if (VerifyResponse.ResultCode == '04') {
            this.app.showMsgDialog({ id: 'VerifyOTPFailCount', title: 'OTP驗證錯誤', msg: '驗證碼錯誤，請重新輸入', btnStr: '確定' });
            return; // OTP驗證次數未達上限
        }
        else if (VerifyResponse.ResultCode == '02' && VerifyResponse.Result.HasReachedMaxTries) {
            this.app.showMsgSelDialog({ id: 'VerifyOTPLimit', title: 'OTP驗證次數已達上限', msg: '驗證碼錯誤已達上限。', btnOK: '確定', btnNO: '聯繫客服' });
            return; // OTP驗證次數已達上限
        }
        else {
            this.app.showMsgDialog({ id: 'VerifyOTPFail', title: 'OTP驗證失敗', msg: VerifyResponse.ResultMessage, btnStr: '確定' });
            return; // OTP驗證失敗
        }

        //關閉OTP倒數
        this.countdown = 0;

        window.scrollTo(0, 0);
    }

    async getCardInfo() {
        const cardInfoResponse = await this.memberService.QueryCardInfo({ CardNo: this.cardNo, ID: this.idNumber });
        if (ServiceHelper.ifSuccess(cardInfoResponse, false)) {
            this.updateFunctionCount();
            this.CVV2 = cardInfoResponse.Result.CVV2;
            this.ElectronicTicketName = cardInfoResponse.Result.ElectronicTicketName;
            this.ElectronicTicketNo = cardInfoResponse.Result.ElectronicTicketNo?.trim();
        }else{
            let swal = Swal.fire({
                text: "卡片資訊查詢失敗，若有問題請洽客服專線(02)2528-7776", icon: 'error', confirmButtonText: '確定',
                showClass: {
                    popup: 'animate__animated animate__fadeIn animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut animate__faster'
                }
            });
            if ((await swal).isConfirmed) {
                this.goHome();
            }
            return;
        }
    }

    // 聯繫客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }

}

class OTPModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.dirty || control.parent['submitted'] })
    @required({ message: '*請輸入驗證碼。' })
    @pattern({ expression: { pattern: /^[0-9]{6}$/ }, message: '*請輸入6位數字驗證碼。' })
    captcha: string;
}
