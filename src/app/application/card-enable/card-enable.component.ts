import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error, pattern, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { MaskApplierService } from 'ngx-mask';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { CardNumberMaskPipe } from 'src/app/shared/pipes/cardnumbermask.pipe';
import { SensorsTrack } from 'src/app/shared/services/sensorsdata';
import { PriorActivateCardInfo } from 'src/app/shared/services/sinopac/apply.model';
import { CardStatus2Item, CardStatusItem } from 'src/app/shared/services/sinopac/member.models';
import { ApplyService, AuthHelper, AuthService, MemberService, ServiceHelper } from 'src/app/shared/shared.module';


@Component({
    selector: 'app-card-enable',
    templateUrl: './card-enable.component.html',
    styleUrls: ['./card-enable.component.scss']
})
export class CardEnableComponent implements OnInit, AfterViewInit {
    private readonly app = new AppWrapper();
    /** APP會員狀態 */
    LoginData: any;
    public selectedIndex: number = 0;
    public sso = false;

    // ChickID
    public eyeOpen = false;
    private idNumber: string;
    public mobile: string;
    public sessionKey: string;
    form: FormGroup;

    // OTP
    public countdown = 0;
    otpform: FormGroup;
    reGenerateCount = 0; // 重發最多兩次

    // select card
    public cards: CardStatus2Item[];
    public selectedCard: CardStatusItem;

    // confirm
    public priorActivateCard: PriorActivateCardInfo;
    public cardNoEyeOpen = false;
    public expDateEyeOpen = false;
    public cvvEyeOpen = false;
    public displayCardNo: string;
    public displayExpDate: string;
    public displayCVV: string;

    // result
    public failReason: string;
    IsLinePointCard = false; // 是否為 LINE 點數卡

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private memberService: MemberService,
        private applyService: ApplyService,
        private authService: AuthService,
        private formBuilder: RxFormBuilder,
        private maskService: MaskApplierService
    ) {
        this.form = this.formBuilder.formGroup(new CardEnableModel());
        this.otpform = this.formBuilder.formGroup(new OTPModel());
    }

    async ngOnInit() {
        this.app.initHeaderBack('啟用卡片');
        this.LoginData = await this.app.getLoginData();
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if(this.LoginData.userType === null ||this.LoginData.userType?.trim() === "") { this.LoginData.userType = "None"; }
        this.sso = this.route.snapshot.data.Sso;
        if (this.sso) {
            this.selectedIndex = 4; // 此處變更為避免進入時有selectedIndex = 0 畫面
            this.idNumber = AuthHelper.CustomerId.toLocaleUpperCase();
            const productCode: string = history.state.productCode;
            const cardface: string = history.state.cardface;
            if (!productCode || !cardface) {
                this.app.showMsgDialog({ id: 'GetParamentFail', title: '已登入取得productCode、cardface為空', msg: '已登入取得productCode、cardface為空', btnStr: '確定' });
                this.router.navigate(['/Account/CardManage']); // TODO 是否導回CardManage?
            } else {
                this.getQueryPriorActivateCardInfo(productCode + cardface);
            }
        }

        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'VerifyOTPLimit' && event.action === 0) {
                this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
            }
            if (event.id === 'VerifyOTPLimit' && event.action === 1) {
                this.CallCustomerServer();
            }
            if (event.id === 'OTPReGenerateLimit' && event.action === 0) {
                this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
            }
            if (event.id === 'NoCardFail' && event.action === 0) {
                if (this.sso) {
                    this.router.navigate(['/Account/CardManage']);
                }
                else {
                    this.app.exitWeb();
                }
            }
        });
    }

    public ngAfterViewInit() {
        // 隱碼 ( value, 前面顯示幾位, 後面顯示幾位 )
        $.hiddenVal = function (str, frontLen, endLen) {
            if (str.length > frontLen) {
                const len = str.length - frontLen - endLen;
                let dot = '';
                for (let i = 0; i < len; i++) {
                    dot += '●';
                }
                return {
                    val: str.substring(0, frontLen) + dot + str.substring(str.length - endLen),
                    dotStr: str.substring(frontLen, str.length - endLen)
                };
            } else {
                return {
                    val: str,
                    dotStr: ''
                };
            }
        }

        //- 身分證顯示
        $('#eyeOwnerID').on('click', (e: any) => {
            this.eyeOpen = !this.eyeOpen;
            if (this.eyeOpen) {
                $("input[name=ownerID]").focus();
            }
        })
    }

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

        const OTPResponse = await this.memberService.GenerateOTP({ ID: this.idNumber, mobile: this.mobile, functionCode: 22, RequireCheckTimeout: regenerate, SessionKey: this.sessionKey })
        if (ServiceHelper.ifSuccess(OTPResponse)) {
            this.selectedIndex = 1; // 非重發
            this.countdown = 120;
            if (regenerate) {
                this.reGenerateCount++;
            }
        }
        else if (OTPResponse?.ResultCode == '06') {
            this.app.showMsgDialog({ id: 'OTPNotExpired', title: '簡訊密碼未失效', msg: '剛剛傳送給您的簡訊密碼尚未失效!', btnStr: '確定' });
            return;
        }
    }

    async checkIDsubmit() {
        // 表單檢核
        this.form['submitted'] = true;
        if (!this.form.valid) return;

        SensorsTrack("EnableCardVerification", { });

        //卡友核身
        const Response = await this.authService.AuthByBirthday({ ID: this.form.value.ownerID, Birthday: this.form.value.birthday })
        if (ServiceHelper.ifSuccess(Response, false)) {
            AuthHelper.storeAuthData({
                Token: Response.Result.Token,
                TokenExpiredAt: Response.Result.TokenExpiredAt,
                CustomerId: Response.Result.CustomerId
            });
            this.idNumber = AuthHelper.CustomerId.toLocaleUpperCase();
        } else {
            this.app.showMsgDialog({ id: 'AuthByBirthdayFail', title: '卡友核身失敗', msg: Response.ResultMessage, btnStr: '確定' });
            return; // 卡友核身失敗
        }

        // 取得客戶手機
        const MobileResponse = await this.memberService.QueryMobile({ ID: this.idNumber })
        if (ServiceHelper.ifSuccess(MobileResponse, false)) {
            this.mobile = MobileResponse.Result.Mobile;
            this.sessionKey = MobileResponse.Result.SessionKey;
        } else {
            this.app.showMsgDialog({ id: 'QueryMobileFail', title: '取得手機號碼失敗', msg: MobileResponse.ResultMessage, btnStr: '確定' });
            return; // 取得手機號碼失敗
        }

        // 傳送驗證碼API
        if (this.mobile) {
            this.generateOTP();
        }
        else {
            this.app.showMsgDialog({ id: 'QueryMobileIsEmpty', title: '手機號碼為空', msg: '手機號碼為空無法取得OTP', btnStr: '確定' });
            return;
        }
    }

    public goCardManage() {
        this.app.routeByBillID({ billID: 'f5ae6e8a-5b67-4bfa-8f76-c156531d4246', closeWeb: true });
    }

    public goHome(goCardManage = false) {
        if (this.sso && goCardManage) {
            this.router.navigate(['/Account/CardManage']);
        }
        else {
            this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
        }
    }

    public goLineOA() {
        window.open('https://linebc.sinopac.com/SmartRobotbcweb/1k9lZ5#open-browser', '_blank');
    }

    async OTPsubmit() {
        // 表單檢核
        this.otpform['submitted'] = true;
        if (!this.otpform.valid) return;

        // 驗證OTP
        const VerifyResponse = await this.memberService.VerifyOTP({ functionCode: 22, ID: this.idNumber, otp: this.otpform.controls.captcha.value })
        if (ServiceHelper.ifSuccess(VerifyResponse, false)) { }
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

        //取得待啟用卡片
        const success = await this.getEnableCards();
        if (!success) {
            return;
        }

        //關閉OTP倒數
        this.countdown = 0;

        //判斷卡片為單張或多張，開啟對應頁面
        if (this.cards.length > 1) {
            //開啟多張頁
            $('main').removeClass('container');
            this.selectedIndex = 2;
        }
        else if (this.cards.length === 1) {
            //開啟單張頁
            $('main').removeClass('container');
            this.selectedIndex = 3;
            this.selectedCard = this.cards[0];
        }
        else {
            $('main').removeClass('container');
            this.selectedIndex = 3;
            this.app.showMsgDialog({ id: 'NoCardFail', title: '查無優先啟用的卡片資訊', msg: '查無優先啟用的卡片資訊', btnStr: '確定' });
        }
        window.scrollTo(0, 0);
    }

    async getEnableCards() {
        const response = await this.memberService.CardStatus2({ ID: this.idNumber })
        if (ServiceHelper.ifSuccess(response, false)) {
            this.cards = response.Result.Items
                .filter(item => item.IsEmbossed && !item.IsActivated && item.IsVIREAL)
                .sort((a, b) => a.OrderIndex - b.OrderIndex);
            return true;
        }
        else {
            this.app.showMsgDialog({ id: 'GetCardStatusFail', title: '取待啟用卡片失敗洽客服人員', msg: response.ResultMessage, btnStr: '確定' });
            return false;
        }
    }
    //多卡啟用流程開始
    getSelectedCard() {
        this.selectedCard = this.cards[$('input[name=card]:checked').val()];
        if (!this.selectedCard) {
            this.app.showMsgDialog({ id: 'SelectedCard', title: '請選取啟用卡片', msg: '請選取啟用卡片', btnStr: '確定' }); // TODO 待確認錯誤訊息如何顯示
            return;
        }
        else {
            var typeface = this.selectedCard.ProductCode + this.selectedCard.CardFace;
            if (!typeface) {
                this.app.showMsgDialog({ id: 'SelectedCardInfoError', title: '未登入取得productCode、cardface為空', msg: '未登入取得productCode、cardface為空', btnStr: '確定' });
            } else {
                this.getQueryPriorActivateCardInfo(typeface);
            }
        }
    }
    //單卡、SSO登入啟用開始
    async getQueryPriorActivateCardInfo(typeface: string) {


        if( this.sso) {
          $('main').addClass('container');
        }

        const response = await this.applyService.QueryPriorActivateCardInfo({ ID: this.idNumber, typeFace: typeface })
        if (ServiceHelper.ifSuccess(response, false)) {
            this.priorActivateCard = response.Result.Items[0];
            const cardTypeFace = this.priorActivateCard.ProductCode + this.priorActivateCard.CardFace;
            this.IsLinePointCard = cardTypeFace === '428001' || cardTypeFace === '428178';;
            this.selectedIndex = 4;
            SensorsTrack("EnableCardConfirm", { card_type: this.priorActivateCard?.CardName });
            this.displayCardNo = new CardNumberMaskPipe().transform(this.maskService.applyMask(this.priorActivateCard.CardNo, '0000-0000-0000-0000'), "●");

            this.displayExpDate = "";
            for (let i = 0; i < this.priorActivateCard?.ExpDate?.length; i++) {
                this.displayExpDate += "●";
            }

            this.displayCVV = "";
            for (let i = 0; i < this.priorActivateCard?.CVV2?.length; i++) {
                this.displayCVV += "●";
            }

            window.scrollTo(0, 0);
        }
        else {
            SensorsTrack("EnableCardConfirm", { card_type: null });
            // 20211016 MAX回覆 按下確定後就關閉燈箱停留在原頁面即可
            this.app.showMsgDialog({ id: 'QueryPriorActivateCardInfoFail', title: '取待啟用卡片失敗洽客服人員', msg: response.ResultMessage, btnStr: '確定' });
        }
    }

    async EnableCard() {
        SensorsTrack("EnableCardEnable", { card_type: this.priorActivateCard?.CardName });

        const response = await this.applyService.PriorActivateCard(
            { ID: this.idNumber, CARD_TYPE: this.priorActivateCard.ProductCode, CARD_FACE: this.priorActivateCard.CardFace, cardNo: this.priorActivateCard.CardNo, Verify_Method: this.LoginData.userType})
        if (ServiceHelper.ifSuccess(response, false)) {
            this.selectedIndex = 5;
        }
        else {
            this.failReason = response.ResultMessage;
            this.selectedIndex = 6;

        }
        SensorsTrack("EnableCardResult", { is_success: ServiceHelper.ifSuccess(response, false) });
        window.scrollTo(0, 0);
    }

    public CallCustomerServer() {
        this.app.showCustomerService();
    }

    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }

    // 切換卡號顯示狀態
    public changeCardNoEyeStatus() {
        this.cardNoEyeOpen = !this.cardNoEyeOpen;
        if (this.cardNoEyeOpen) {
            this.displayCardNo = this.maskService.applyMask(this.priorActivateCard?.CardNo, '0000-0000-0000-0000');
        } else {
            this.displayCardNo = new CardNumberMaskPipe().transform(this.maskService.applyMask(this.priorActivateCard?.CardNo, '0000-0000-0000-0000'), "●");
        }
    }

    // 切換有效期限顯示狀態
    public changeExpDateEyeStatus() {
        this.expDateEyeOpen = !this.expDateEyeOpen;
        if (this.expDateEyeOpen) {
            this.displayExpDate = this.priorActivateCard?.ExpDate;
        } else {
            this.displayExpDate = "";
            for (let i = 0; i < this.priorActivateCard?.ExpDate?.length; i++) {
                this.displayExpDate += "●";
            }
        }
    }

    // 切換末3碼顯示狀態
    public changeCVVEyeStatus() {
        this.cvvEyeOpen = !this.cvvEyeOpen;
        if (this.cvvEyeOpen) {
            this.displayCVV = this.priorActivateCard?.CVV2;
        } else {
            this.displayCVV = "";
            for (let i = 0; i < this.priorActivateCard?.CVV2?.length; i++) {
                this.displayCVV += "●";
            }
        }
    }
}

class CardEnableModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.dirty || control.parent['submitted'] })
    @required({ message: '*身分證字號不能空著唷。' })
    @pattern({ expression: { pattern: /^[a-zA-Z]\d{9}$/ }, message: '*哎呀！身分證字號格式有誤，請重新輸入。' })
    ownerID: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.dirty || control.parent['submitted'] })
    @required({ message: '*出生年月日不能空著唷。' })
    @pattern({ expression: { pattern: /^((?:19|20)\d\d)((((0[13578])|(1[02]))(([0-2][0-9])|(3[01])))|(((0[469])|(11))(([0-2][0-9])|(30)))|(02[0-2][0-9]))$/ }, message: '*哎呀！出生年月日格式有誤，請重新輸入。' })
    birthday: string;
}

class OTPModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.dirty || control.parent['submitted'] })
    @required({ message: '*請輸入驗證碼。' })
    @pattern({ expression: { pattern: /^[0-9]{6}$/ }, message: '*請輸入6位數字驗證碼。' })
    captcha: string;
}
