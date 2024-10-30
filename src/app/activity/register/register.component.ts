import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxFormBuilder, error, pattern, required } from '@rxweb/reactive-form-validators';
import { SimpleModalService } from 'ngx-simple-modal';
import { CaptchaComponent } from 'src/app/shared/components/captcha/captcha.component';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { SignActivity, SignActivityResult } from 'src/app/shared/services/sensorsdata';
import { GetActivityItem, QueryIVRActivityItem, memberStatus } from 'src/app/shared/services/sinopac/register.models';
import { RegisterService } from 'src/app/shared/services/sinopac/register.service';
import { ApplyService, AuthHelper, AuthService, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    /** 燈箱title */
    Title: string;
    /** 燈箱文字 */
    text: string;
    /** 燈箱確認鍵 */
    check: string;
    /** 燈箱否定建 */
    uncheck: string;
    /** 燈箱識別ID */
    lightboxID: string;
    /** 燈箱開關 */
    lightboxstatus: boolean = false;
    /** 燈箱是否隱藏否定鑑 */
    hideUnCheck: boolean = false;
    /** icon圖示控制 */
    iconControl: string = '活動登錄';
    /** 是否可以點擊搶登錄按鈕(2秒後才能再次點擊，超過2秒由loader阻擋) */
    canSign: boolean = true;
    /** 是否需查詢已登錄活動 */
    isQueryActivity: boolean = false;
    /** 已登錄項目 */
    activityedItems: Array<QueryIVRActivityItem>;
    /** 已登錄項目數量 */
    activityedCount: number;
    /** 使用者身分證 */
    idnumber = "";
    /** 活動中項目 */
    activityItems: Array<GetActivityItem>;
    /** 活動中項目數量 */
    activityItemsCount: number;
    /** 最快結束的活動 */
    closestItem: GetActivityItem;
    /** 用於未登入身分檢查 */
    public readonly app = new AppWrapper();
    /** 控制頁面步驟 */
    selectedIndex = 0;
    /** 登入表單 */
    form: FormGroup;
    @ViewChild(CaptchaComponent) captcha: CaptchaComponent;
    /** 是否是卡戶 */
    customCard: boolean;
    /** 是否是存戶 */
    customAcct: boolean;
    /** APP會員狀態 */
    LoginData: any;


    constructor(
        private formBuilder: RxFormBuilder,
        private authService: AuthService,
        private applyService: ApplyService,
        private registerService: RegisterService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: SimpleModalService,
        private datePipe: DatePipe,
    ) {
        this.form = this.formBuilder.formGroup(new CardQueryModel());
    }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBackWithCustomerService('活動登錄');
        this.msgDialoglistening();

        //取APP會員狀態
        this.LoginData = await this.app.getLoginData();
        AuthHelper.AppToken = this.LoginData.token || '';
        ServiceHelper.SessionId = await this.app.getDeviceUUID() || '';
        AuthHelper.PairedWatch = Number(this.LoginData.paired_watch) === 1 ? "Y" : "N";
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if (this.LoginData.userType === null || this.LoginData.userType?.trim() === "") { this.LoginData.userType = "None"; }
        //身分判斷依據this.LoginData.has_sinopac_acct及has_sinopac_card，IOS回應0/1，安卓回應true/false
        if (this.LoginData.has_sinopac_acct === "0" || this.LoginData.has_sinopac_acct === false) { this.customAcct = false; }
        if (this.LoginData.has_sinopac_acct === "1" || this.LoginData.has_sinopac_acct === true) { this.customAcct = true; }
        if (this.LoginData.has_sinopac_card === "0" || this.LoginData.has_sinopac_card === false) { this.customCard = false; }
        if (this.LoginData.has_sinopac_card === "1" || this.LoginData.has_sinopac_card === true) { this.customCard = true; }
        //-----------------------------------------------------debug用--------------------------------------------------
        //用來實際檢視測試資料的身分別彈窗(這是未經過排版的)
        //const jsonString = JSON.stringify(this.LoginData);
        //alert("jsonString");

        // 這是用來本機開發可以測試各種身分別
        // this.LoginData.userType = "MMA"
        // this.customCard = true;
        // this.customAcct = false;

        //用來實際檢視測試資料的身分別彈窗(這是經過排版的)
        // var text2 = "token:"+this.LoginData.token
        // +"、user_type:"+this.LoginData.userType
        // +"、is_acct_user:"+this.customAcct
        // +"、is_card_user:"+this.customCard
        // +"、cust_id:"+this.idnumber
        // this.showbox1({ID:"123456", text:text2, check:'測試時',uncheck:'顯示'})

        //Web測試用
        // if(this.LoginData.token?.length === 10 ) {
        //     this.showPrecautions();
        // }
        //-----------------------------------------------------debug用--------------------------------------------------

        //未綁定
        if (this.LoginData.userType === "None") {
            this.Title = "登錄活動";
            this.text = "若您為永豐銀行信用卡客戶，身分確認即可登錄活動";
            this.check = "我是永豐卡戶";
            this.uncheck = "查看信用卡活動";
            this.lightboxID = 'unbound';
            this.lightboxstatus = true;
        }
        //已綁定(電支會員)無存無卡
        if (this.LoginData.userType === "PayMember" && !this.customAcct && !this.customCard) {
            this.Title = "登錄活動";
            this.text = "立即申辦永豐銀行信用卡，搶先登錄優惠活動";
            this.check = "推薦信用卡";
            this.uncheck = "查看信用卡活動";
            this.lightboxID = 'boundtype1';
            this.lightboxstatus = true;
        }
        //已綁定(電支會員)有存無卡
        if (this.LoginData.userType === "PayMember" && this.customAcct && !this.customCard) {
            this.Title = "登錄活動";
            this.text = "立即申辦永豐銀行信用卡，搶先登錄優惠活動";
            this.check = "推薦信用卡";
            this.uncheck = "查看信用卡活動";
            this.lightboxID = 'boundtype1';
            this.lightboxstatus = true;
        }
        //已綁定(電支會員)無存有卡
        if (this.LoginData.userType === "PayMember" && !this.customAcct && this.customCard) {
            this.Title = "登錄活動";
            this.text = "您是永豐銀行信用卡客戶，升等為永豐網銀會員即可一鍵登錄，或立即身分確認登錄活動";
            this.check = "升等網銀會員";
            this.uncheck = "立即登錄";
            this.lightboxID = 'boundtype2';
            this.lightboxstatus = true;
        }
        //已綁定(電支會員)有存有卡
        if (this.LoginData.userType === "PayMember" && this.customAcct && this.customCard) {
            this.Title = "登錄活動";
            this.text = "您是永豐銀行信用卡客戶，升等為永豐網銀會員即可一鍵登錄，或立即身分確認登錄活動";
            this.check = "升等網銀會員";
            this.uncheck = "立即登錄";
            this.lightboxID = 'boundtype2';
            this.lightboxstatus = true;

        }
        //已綁定(網銀會員)有存無卡
        if (this.LoginData.userType === "MMA" && this.customAcct && !this.customCard) {
            this.Title = "登錄活動";
            this.text = "立即申辦永豐銀行信用卡，搶先登錄優惠活動";
            this.check = "推薦信用卡";
            this.uncheck = "查看信用卡活動";
            this.lightboxID = 'boundtype1';
            this.lightboxstatus = true;
        }
        //已綁定(網銀會員)無存有卡
        if (this.LoginData.userType === "MMA" && !this.customAcct && this.customCard) {
            await this.getID();
            await this.showPrecautions();
        }
        //已綁定(網銀會員)有存有卡
        if (this.LoginData.userType === "MMA" && this.customAcct && this.customCard) {
            await this.getID();
            await this.showPrecautions();
        }
    }

    //-----------------------------------------------------debug用--------------------------------------------------
    /** 彈窗模駔(有取消鈕) */
    // public showbox1(tx: memberStatus) {
    //     this.app.showMsgSelDialog({
    //         id: tx.ID, title: '活動登錄',
    //         msg: tx.text,
    //         btnOK: tx.check, btnNO: tx.uncheck
    //     });
    // }
    //-----------------------------------------------------debug用--------------------------------------------------

    /**error msg dialog 監聽 */
    msgDialoglistening() {
        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'register' && event.action === 0) {
                this.goHome();
            }
        });
    }

    /** 彈窗確定鍵執行功能 */
    lightboxcheck(tx: string) {
        switch (tx) {
            case "unbound":
                this.lightboxstatus = false;
                return;
            case "boundtype1":
                this.app.routeByBillID({ billID: 'f5ae6e8a-5b67-4bfa-8f76-c156531d4246', closeWeb: true });
                return;
            case "boundtype2":
                this.app.routeByBillID({ billID: '45a0340b-d11f-4a20-b7bc-bb709d1dfa81', closeWeb: true });
                return;
            case "SignActivitySfail":
                this.lightboxstatus = false;
                return;
            case "SignActivitySuc":
                this.lightboxstatus = false;
                return;
        }
    }

    /** 彈窗否定鍵執行功能 */
    lightboxuncheck(tx: string) {
        switch (tx) {
            case "unbound":
                location.href = "https://bank.sinopac.com/sinopacBT/personal/credit-card/discount/list.html#open-browser";
                return;
            case "boundtype1":
                location.href = "https://bank.sinopac.com/sinopacBT/personal/credit-card/discount/list.html#open-browser";
                return;
            case "boundtype2":
                this.lightboxstatus = false;
                return;
            case "SignActivitySfail":
                this.lightboxstatus = false;
                this.changepage('已登錄');
                return;
            case "SignActivitySuc":
                this.lightboxstatus = false;
                this.changepage('已登錄');
                return;
        }
    }

    /**
     * 檢查表單(身分證字號、出生年月日、驗證碼)後打API
     *  成功: 前往 Step2 (確認注意事項)
     *  失敗: 燈箱顯示錯誤訊息
     */
    async onSubmit() {
        this.form['submitted'] = true;
        if (this.form.valid) {
            try {
                //檢查登入資訊是否正確
                const Response = await this.authService.AuthByBirthdayWithCaptcha({ ID: this.form.value.UserId.toLocaleUpperCase(), Birthday: this.form.value.DOB }, this.form.value.Captcha)
                if (ServiceHelper.ifSuccess(Response, false)) {
                    this.idnumber = this.form.value.UserId.toLocaleUpperCase();
                    this.showPrecautions();
                } else {
                    Swal.fire({
                        text: Response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
                        showClass: {
                            popup: 'animate__animated animate__fadeIn animate__faster'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut animate__faster'
                        }
                    });
                    return;
                }
            }
            catch (error) {
                if (error.status === 406) { // 驗證碼錯誤
                    this.form.controls.Captcha['setBackEndErrors']({ invalidValue: error.error + "，請重新輸入圖形驗證碼。" });
                }
                else {
                    console.log(error);
                    let swal = Swal.fire({
                        text: '系統發生錯誤，請稍後再試！', icon: 'error', confirmButtonText: '確定',
                        showClass: {
                            popup: 'animate__animated animate__fadeIn animate__faster'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut animate__faster'
                        }
                    });
                }
            }
        }
        //重製驗證碼欄位
        this.captcha.refreshCaptcha();

    }

    /** 取得ID */
    async getID() {
        //利用Token取得ID
        if (AuthHelper.AppToken) {
            const response = await this.authService.verifyToken({ AppToken: AuthHelper.AppToken, WebToken: AuthHelper.WebToken });
            if (ServiceHelper.ifSuccess(response)) {
                AuthHelper.storeAuthData({
                    Token: response.Result.NewToken,
                    TokenExpiredAt: response.Result.TokenExpiredAt,
                    CustomerId: response.Result.CustomerId
                });
            }
            //取得ID
            this.idnumber = AuthHelper.CustomerId;
        } else {
            this.app.showMsgDialog({ id: 'register', title: '發生錯誤', msg: '無法取得AppToken' });
        }
    }

    /** 注意事項同意條款 */
    async showPrecautions() {
        const agree = await this.modalService
            .addModal(NoticeDialogComponent, {
                Title: '永豐銀行活動登錄注意事項',
                Source: 'CAWHO',
                NoticeMatter: '永豐銀行活動登錄注意事項',
                NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                color: urlColor.None,
            })
            .toPromise();
        if (agree) {
            this.selectedIndex = 1;
            await this.loadActivity();
            if (history.state.functionName) {
                await this.changepage(history.state.functionName);
            }
        }
        else {
            //前往優惠權益總覽頁
            this.app.routeByBillID({ billID: '74d2cc76-268d-450f-a5e7-a55cb94098b8', closeWeb: true });
        }
    }

    /** 下載活動登錄首頁資料 */
    async loadActivity() {
        const response = await this.registerService.GetActivity({ ID: this.idnumber })
        if (ServiceHelper.ifSuccess(response, false)) {
            // 過濾逾期項目
            const currentTime = new Date().getTime();
            this.activityItems = response?.Result?.Items.filter(item => {
                const endTime = new Date(item.RegisterEndTime).getTime();
                return endTime > currentTime;
            });
            //對活動中項目做排序由近到遠
            this.activityItems.sort((a, b) => {
                const endTimeA = new Date(a.RegisterEndTime).getTime();
                const endTimeB = new Date(b.RegisterEndTime).getTime();

                if (endTimeA < endTimeB) {
                    return -1;
                } else if (endTimeA > endTimeB) {
                    return 1;
                } else {
                    return 0;
                }
            });
            //取得活動中項目數量
            this.activityItemsCount = this.activityItems.length;
            //取得最近結束的項目
            this.closestItem = this.activityItems.reduce((closest, current) => {
                const closestEndTime = new Date(closest.RegisterEndTime).getTime();
                const currentEndTime = new Date(current.RegisterEndTime).getTime();
                // 如果當前項目的結束時間大於當前時間且更接近最接近項目的結束時間，則更新最接近項目
                if (currentEndTime > currentTime && currentEndTime < closestEndTime) {
                    return current;
                }

                return closest;
            }, this.activityItems[0]);

        } else {
            Swal.fire({
                text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
                showClass: {
                    popup: 'animate__animated animate__fadeIn animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut animate__faster'
                }
            });
            return;
        }
    }

    /** 查看已登錄活動 */
    async Activityed() {
        if (!this.isQueryActivity) {
            this.isQueryActivity = true;
            const response = await this.registerService.QueryIVRActivity({ ID: this.idnumber })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.activityedItems = response?.Result?.Items;
                //對已登錄項目做排序
                this.activityedItems.sort((a, b) => {
                    const endTimeA = new Date(a.AddDateTime).getTime();
                    const endTimeB = new Date(b.AddDateTime).getTime();

                    if (endTimeA < endTimeB) {
                        return 1;
                    } else if (endTimeA > endTimeB) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                this.activityedCount = this.activityedItems.length;
            } else {
                Swal.fire({
                    text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                return;
            }
        }
    }

    /** 返回首頁 */
    goHome() {
        this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }

    /** 更換活動項目 */
    copyTextValue(X: string) {
        if (X === "金Bee") {
            this.app.routeByBillID({ billID: '94a3722b-1faa-4376-8691-36d844cb4c8e', closeWeb: true });
        }
        else if (X === "大咖任務") {
            this.app.routeByBillID({ billID: 'ae645995-1744-45f2-9a9a-77610942d7ed', closeWeb: true });
        }
        else if (X === "紅利點數") {
            this.app.routeByBillID({ billID: 'd28582a9-aa6f-49ae-bf1e-ac33c13ea292', closeWeb: true });
        } else if (X === "卡友權益") {
            this.app.routeByBillID({ billID: '5e8c3599-309a-4474-82d1-999c46c7cc51', closeWeb: true, });
        }
    }

    /** 切換頁面 */
    async changepage(T: string) {
        if (T === "已登錄") {
            this.selectedIndex = 2;
            await this.Activityed();
        }
        if (T === "活動列表") { this.selectedIndex = 1 }
    }

    /** 登錄活動 */
    async SignActivity(T: GetActivityItem) {
        //神測埋點
        SignActivity("ActivityList", T.Title, T.Code);

        if (this.canSign) {
            this.canSign = false;
            // 設定2秒後把canSign改為true，讓使用者可以再次點擊「搶登錄」按鈕
            const timer = setTimeout(() => {
                this.canSign = true;
            }, 2000);

            try {
                const response = await this.registerService.SignActivity({ ID: this.idnumber, Code: T.Code, Verify_Method: this.LoginData.userType, RegisterBeginTime: T.RegisterBeginTime, RegisterEndTime: T.RegisterEndTime })
                const daytimenow = this.datePipe.transform(response.Header.ResponseTime, 'yyyy/MM/dd HH:mm:ss');
                if (ServiceHelper.ifSuccess(response, false)) {
                    //神測埋點
                    SignActivityResult("ActivityAttendResult", true, response.Result?.Seq, T.Title, T.Code, "");
                    //重置已登錄活動資料，點擊已登錄活動標籤時重新查詢
                    this.isQueryActivity = false;
                    this.activityedItems = [];
                    this.activityedCount = null;

                    //燈箱資訊設定
                    this.Title = "登錄成功";
                    this.text = '<p>恭喜您成為第' + response.Result.Seq + '位幸運大咖</p>'
                        + '<p><span class="fw-b">登錄活動：</span><span>' + T.Title + '</span></p>'
                        + '<p> <span class="fw-b">登錄時間：</span><span>' + daytimenow + '</span></p>';
                    this.check = "返回活動列表";
                    this.uncheck = "查看已登錄活動";
                    this.lightboxID = 'SignActivitySuc';
                    this.lightboxstatus = true;
                    clearTimeout(timer);
                    this.canSign = true;
                    return;
                } else {
                    //神測埋點
                    SignActivityResult("ActivityAttendResult", false, "0", T.Title, T.Code, response.ResultMessage);
                    //燈箱資訊設定
                    this.Title = "登錄失敗";
                    this.text = '<p><span class="fw-b">登錄活動：</span><span>' + T.Title + '</span></p>'
                        + '<p><span class="fw-b">失敗時間：</span><span>' + daytimenow + '</span></p>'
                        + '<p> <span class="fw-b">失敗原因：</span><span>' + response.ResultMessage + '</span></p>';
                    this.check = "返回活動列表";
                    this.uncheck = "查看已登錄活動";
                    this.lightboxID = 'SignActivitySfail';
                    this.lightboxstatus = true;
                    clearTimeout(timer);
                    this.canSign = true;
                    return;
                }
            }
            catch (error) {
                let errorText = "系統發生錯誤，請稍後再試！";
                let daytimenow = this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm:ss');
                if (error.status === 403) { // 活動不在可登錄時間
                    [errorText, daytimenow] = error.error.split('|');
                }

                this.Title = "登錄失敗";
                this.text = '<p><span class="fw-b">登錄活動：</span><span>' + T.Title + '</span></p>'
                    + '<p><span class="fw-b">失敗時間：</span><span>' + daytimenow + '</span></p>'
                    + '<p> <span class="fw-b">失敗原因：</span><span>' + errorText + '</span></p>';
                this.check = "返回活動列表";
                this.uncheck = "查看已登錄活動";
                this.lightboxID = 'SignActivitySfail';
                this.lightboxstatus = true;
                clearTimeout(timer);
                this.canSign = true;
                return;
            }
        }
    }
    /** 開啟活動頁面 */
    SignUrl(url: string) {
        location.href = url + "#open-browser";
    }

    /** 監聽input框最多10碼 */
    ngAfterViewInit(): void {
        const InputElement = document.getElementById("UserId") as HTMLInputElement;
        InputElement.addEventListener("input", function () {
            if (InputElement.value.length > 10) {
                InputElement.value = InputElement.value.slice(0, 10);
            }
        });
    }

}


class CardQueryModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*身分證字號不能空著唷。' })
    @pattern({ expression: { pattern: /^[a-zA-Z]\d{9}$/ }, message: '*哎呀！身分證字號格式有誤，請重新輸入。' })
    UserId: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*出生年月日不能空著唷。' })
    @pattern({ expression: { pattern: /^((?:19|20)\d\d)((((0[13578])|(1[02]))(([0-2][0-9])|(3[01])))|(((0[469])|(11))(([0-2][0-9])|(30)))|(02[0-2][0-9]))$/ }, message: '*哎呀！出生年月日格式有誤，請重新輸入。' })
    DOB: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*驗證碼不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{6}$/ }, message: '*哎呀！驗證碼格式有誤，請重新輸入。' })
    Captcha: string;
}
