import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { SensorsTrack } from 'src/app/shared/services/sensorsdata';
import { AutoDeductAccount, GetAutoDeductRs } from 'src/app/shared/services/sinopac/autodeduct.models';
import { AutoDeductService } from 'src/app/shared/services/sinopac/autodeduct.service';
import { SiteConfigService } from 'src/app/shared/services/sinopac/site-config.service';
import { AccountService, AuthHelper } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-card-auto-withholding',
    templateUrl: './card-auto-withholding.component.html',
    styleUrls: ['./card-auto-withholding.component.scss']
})
export class CardAutoWithholdingComponent implements OnInit {
    isSentApply: boolean = false;
    /** 控制頁面步驟 */
    selectedIndex = 0;
    /** 登入資訊 */
    private readonly app = new AppWrapper();
    /** 登入資訊 */
    LoginData: any;
    /** 是否是卡戶 */
    customCard: boolean;
    /** 登入者身分 */
    idnumber: string;
    /** 自動設定回傳資料 */
    getAutoDeductResp: GetAutoDeductRs;
    /** 是否隱藏帳號(自扣資訊頁) */
    amountHide: boolean = true;
    /** 是否隱藏帳號(自扣設定頁) */
    setAccountHide: boolean = true;
    /** 是否隱藏帳號(自扣確認頁) */
    confirmAccountHide: boolean = true;
    /** 是否隱藏帳號(自扣完成頁) */
    finalAccountHide: boolean = true;
    /** 是否已設定自扣 */
    dd_Flag: boolean;
    /** 身分判斷燈箱開關 */
    lightboxstatus: boolean = false;
    /** 身分判斷燈箱title */
    Title: string;
    /** 身分判斷燈箱文字 */
    text: string;
    /** 身分判斷燈箱確認鍵 */
    check: string;
    /** 身分判斷燈箱否定鍵 */
    uncheck: string;
    /** 身分判斷燈箱識別ID */
    lightboxID: string;
    /** 自扣設定燈箱開關 */
    setLightBoxStatus: boolean = false;
    /** 自扣設定選擇帳戶名稱 */
    setAccountName : string;
    /** 自扣設定選擇帳戶號碼 */
    setAccountNo : string;
    /** 自扣設定是否選中帳號 */
    isPickAccount : string;
    /** 可自動扣繳帳號設定清單 */
    autoDeductAccount: AutoDeductAccount[];
    /** 判斷條款是否同意 */
    isChecked: boolean = false
    /** 自扣下一步按鈕顯示判斷 */
    setAutoNextStep: boolean = true
    /** 繳費方式設定 */
    pickPaymentType: string;
    /** 申請自扣結果 */
    applyResult;
    /** 申請自扣結果(申請時間) */
    applyTime: string;
    /** 是否是存戶 */
    customAcct: boolean;

    constructor(
        private autoDeductService: AutoDeductService,
        private accountService: AccountService,
        private siteConfigService: SiteConfigService,
        private modalService: SimpleModalService,
    ) {

     }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('自動扣繳查詢');
        this.idnumber = AuthHelper.CustomerId;
        //取得登入資訊
        this.LoginData = await this.app.getLoginData();
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if(this.LoginData.userType === null ||this.LoginData.userType?.trim() === "") { this.LoginData.userType = "None"; }
        //身分判斷依據this.LoginData.has_sinopac_card，IOS回應0/1，安卓回應true/false
        if (this.LoginData.has_sinopac_acct === "0" || this.LoginData.has_sinopac_acct === false) { this.customAcct = false; }
        if (this.LoginData.has_sinopac_acct === "1" || this.LoginData.has_sinopac_acct === true) { this.customAcct = true; }
        if(this.LoginData.has_sinopac_card === "0" || this.LoginData.has_sinopac_card === false) { this.customCard = false;}
        if(this.LoginData.has_sinopac_card === "1" || this.LoginData.has_sinopac_card === true) { this.customCard = true;}

        console.log('this.LoginData.userType:', this.LoginData.userType);
        console.log('this.customCard:', this.customCard);
        // console.log('environment.production:', environment.production);

        if (!this.siteConfigService.getProduction()) {
            this.LoginData.userType = "MMA";
            this.customCard = true;
        }

        // 未綁定(導向綁定流程)
        if(this.LoginData.userType === "None") {
            console.log('未綁定(導向綁定流程)');
        } //app已經自動判斷倒頁現行無需增加邏輯

        // 無卡會員(導向帳務示意頁_辦卡)
        if(!this.customCard) {
            console.log('無卡會員(導向帳務示意頁_辦卡)');
            const appUrl = location.origin + '/CawhoPay/Card/Apply';
            window.location.href = appUrl;
        }

        // 電支有卡(導向帳務示意頁_升級)
        if(this.LoginData.userType === "PayMember" && this.customCard) {
            console.log('電支有卡(導向帳務示意頁_升級)');
            const appUrl = location.origin + '/CawhoPay/Card/Upgrade';
            window.location.href = appUrl;
        }

        // 網銀有卡(導向卡費自扣查詢頁)
        if(this.LoginData.userType === "MMA" && this.customCard) {
            console.log('網銀有卡(導向卡費自扣查詢頁)');
            this.getAutoDeduct();
        }
    }

    /** 確認自扣是否生效+取得自動扣繳設定 */
    async getAutoDeduct () {
        const nowYM = dayjs().format('YYYYMM');
        const response = await this.accountService.RecentBill({
            ID: AuthHelper.CustomerId,
            BillDateYYYYMM: nowYM,
            IsDACARD: true
        })
        if ( response.ResultCode === "00")   {

            var resp = await this.autoDeductService.GetAutoDeduct({ ID: this.idnumber})
            if (resp.ResultCode === "00") {
                this.getAutoDeductResp = resp.Result;
                this.getAutoDeductResp.BankCodeAndAccount = "("+this.getAutoDeductResp.BankCode+")"+this.getAutoDeductResp.AccountNo;
            }
            else {
                this.app.showMsgDialog({ id: 'CardAutoWithholding', title: '發生錯誤', msg: resp.ResultMessage });
            }

            switch (response.Result?.DD_FLAG) {
                case "Y": //有設定自動扣繳
                    this.dd_Flag = true;
                    return;
                case "N": //沒設定自動扣繳
                    this.dd_Flag = false;
                    this.selectedIndex = 1;
                    this.checkStatus();
                    return;
            }
        }
        else {
            this.app.showMsgDialog({ id: 'CardAutoWithholding', title: '發生錯誤', msg: response.ResultMessage });
        }
    }

    /** 自動扣繳資訊變更設定或返回上一頁 */
    changOrGoBack (source:string, bankCode:string) {
        var isSinoPic = (bankCode === "807");
        if ( (source === "button1" && isSinoPic) || (source === "button2" && !isSinoPic)) {
            this.app.exitWeb();
        }
        if ( (source === "button1" && !isSinoPic) || (source === "button2" && isSinoPic)) {
            this.selectedIndex = 1;
            this.checkStatus();
        }
    }

    /** 自扣設定資格確認 */
    async checkStatus () {
        const resp = await this.autoDeductService.AuthAutoDeduct({ ID: this.idnumber});
        switch (resp.ResultCode) {
            case '02': //非本行卡戶
                this.Title = "非本行卡戶";
                this.text = "您目前非本行信用卡客戶，歡迎您辦理本行信用卡，若您這兩週已申請，可點擊下方按鈕進行申辦進度查詢。";
                this.check ="推薦辦卡";
                this.uncheck ="查看申辦進度";
                this.lightboxID ='resultCode02';
                this.lightboxstatus = true;
                return;
            case '01' || '05': //非會員1&3 (尚未申請服務)、無台幣帳戶 (尚未申請服務)
                this.Title = "尚未持有本行帳戶";
                this.text = "您尚未開立本行帳戶，歡迎您點擊下方按鈕申請 DAWHO 數位帳戶，或攜帶身分證件前往任一分行開立帳戶。";
                this.check ="如何當大戶";
                this.uncheck ="下次再說";
                this.lightboxID ='resultCode0105';
                this.lightboxstatus = true;
                return;
            case '03': //持有之帳戶不能設定自扣
                this.Title = "尚無可設定之帳戶";
                this.text = "您的銀行帳戶尚無法進行永豐卡費自動扣款設定，歡迎您點擊下方按鈕申請 DAWHO 數位帳戶。";
                this.check ="如何當大戶";
                this.uncheck ="聯繫客服";
                this.lightboxID ='resultCode03';
                this.lightboxstatus = true;
                return;
            case '04': //其他錯誤(取得自扣資訊失敗)
                this.Title = "失敗";
                this.text = resp.ResultMessage;
                this.check ="返回前頁";
                this.uncheck ="聯繫客服";
                this.lightboxID ='resultCode04';
                this.lightboxstatus = true;
                return;
            default:
                SensorsTrack("AutoDeductQuery", { is_display: true });
                this.app.initHeaderBack('自動扣繳設定');
                this.getAutoDeductAccount();
                return;

        }
    }

    /** 取得可自扣帳號 */
    async getAutoDeductAccount () {
        const resp = await this.autoDeductService.GetAutoDeductAccount({ ID: this.idnumber})
        if (resp.ResultCode === "00") {
            this.autoDeductAccount = resp.Result?.Accounts;
            for( var i = 0; i < this.autoDeductAccount.length; i++) {
                this.autoDeductAccount[i].AccountName =  "永豐銀行_"+this.autoDeductAccount[i]?.AccountName;
                this.autoDeductAccount[i].AccountNo =  "(807)"+this.autoDeductAccount[i]?.AccountNo;
                if (i < 9) {
                    this.autoDeductAccount[i].No = "0"+(i+1).toString();
                } else {
                    this.autoDeductAccount[i].No = (i+1).toString();
                }
            }
        } else {
            this.app.showMsgDialog({ id: 'CardAutoWithholding', title: '發生錯誤', msg: resp.ResultMessage });
        }

        if( this.dd_Flag) {
            this.pickPaymentType = this.getAutoDeductResp?.PaymentType;
            // 預設先選取第一筆扣款帳號
            this.setAccountName = this.autoDeductAccount[0].AccountName;
            this.setAccountNo = this.autoDeductAccount[0].AccountNo;
        } else {
            // 先預設第一筆為扣款帳號
            this.setAccountName = this.autoDeductAccount[0].AccountName;
            this.setAccountNo = this.autoDeductAccount[0].AccountNo;
        }
    }

    /** 開啟信用卡自動扣繳設定約定條款 */
    async openRule () {
        const agree = await this.modalService
        .addModal(NoticeDialogComponent, {
            Title: '信用卡臺幣自動轉帳申請授權條款',
            Source: 'CAWHO',
            NoticeMatter: '信用卡新臺幣自動轉帳付款申請授權條款】、【信用卡新臺幣自動轉帳付款申請注意事項',
            NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
            color: urlColor.None,
            Title2: '信用卡自動扣繳設定約定條款',
        })
        .toPromise();
        if (agree) {
            this.isChecked = true;
            this.checkCanNextStep();
        }
    }

    /** 取得自扣方式中文名稱 */
    get autoDeductWay(): string {
        return this.pickPaymentType == '1' ?
            '最低應繳總金額' : (this.pickPaymentType == '2' ? '當期應繳總金額' : '');
      }

    goNextStep() {
        this.selectedIndex = 2;
        SensorsTrack("AutoDeductSetting", { auto_deduct_way: this.autoDeductWay, auto_deduct_bank: this.getAutoDeductResp.BankCode});
    }

    /** 設定扣繳方式 */
    setAccountPaymentType (e:string) {
        this.pickPaymentType = e;
        this.checkCanNextStep();
    }

    /** 自動扣繳設定下一步檢核 */
    checkCanNextStep () {
        //已設定自扣且有變更帳號可下一步
        if(this.isChecked && this.dd_Flag && this.pickPaymentType && (this.getAutoDeductResp.BankCodeAndAccount !== this.setAccountNo) ) {
            this.setAutoNextStep = false;
        }//已設定自扣且有變更扣繳方式可下一步
        else if (this.isChecked && this.dd_Flag && this.pickPaymentType && (this.getAutoDeductResp.PaymentType !== this.pickPaymentType) ) {
            this.setAutoNextStep = false;
        }//未設定自扣可下一步
        else if (this.isChecked && this.pickPaymentType && !this.dd_Flag ) {
            this.setAutoNextStep = false;
        }
        else { this.setAutoNextStep = true; }
    }

    /** 送出自扣申請 */
    async sentApply () {
        this.isSentApply = true;

        SensorsTrack('AutoDeductConfirm', { auto_deduct_way: this.autoDeductWay, auto_deduct_bank: this.getAutoDeductResp.BankCode})
        var account = this.setAccountNo.split(')')[1];
        const applyResp1 = await this.autoDeductService.ApplyAutoDeduct(
            { ID: this.idnumber, Flag: this.getAutoDeductResp.Flag, BankCode: this.getAutoDeductResp.BankCode, Account: this.getAutoDeductResp.AccountNo, PaymentType: this.getAutoDeductResp.PaymentType, NewPaymentType: this.pickPaymentType, NewBankCode: '807', NewAccount: account })

        this.selectedIndex = 3;
        this.applyResult = applyResp1;
        if (applyResp1.Header) {
            this.applyTime = this.transTime(applyResp1.Header.ResponseTime);
        }

        SensorsTrack('AutoDeductResult', { is_success: this.applyResult?.ResultCode == '00', auto_deduct_way: this.autoDeductWay, auto_deduct_bank: this.getAutoDeductResp.BankCode});

        return;
    }

    /** 燈箱確定鍵執行功能 */
    lightboxcheck(tx:string) {
        switch (tx) {
            case "resultCode02":
                this.app.routeByBillID({ billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753', closeWeb: true });
                this.lightboxstatus = false;
                return;
            case "resultCode0105":
                location.href = "https://dawho.tw/#open-browser";
                return;
            case "resultCode03":
                location.href = "https://dawho.tw/#open-browser";
                return;
            case "resultCode04":
                this.lightboxstatus = false;
                this.returnToLastPage();
                return;
            case "pickAccount":
                this.setAccountNo = this.isPickAccount.split(',')[0];
                this.setAccountName  = this.isPickAccount.split(',')[1];
                this.checkCanNextStep();
                this.setLightBoxStatus = false;
                this.isPickAccount = null;
                return;
            case "finalApplyResult":
                if(this.applyResult.ResultCode === '00') {
                    this.app.routeByBillID({ billID: '5B4751CD-7247-4D6F-8C93-5F674AA4B8FA', closeWeb: true });
                } else {
                    this.app.routeByBillID({ billID: '6CEC1702-D76D-431C-A355-66C635504DEA', closeWeb: true });
                }
                return;
        }
    }

    /** 燈箱否定鍵執行功能 */
    lightboxuncheck(tx:string) {
        switch (tx) {
            case "resultCode02":
                this.app.routeByBillID({ billID: 'A07B388B-06CA-475D-8BE0-62452E4EF115', closeWeb: true });
                this.lightboxstatus = false;
                return;
            case "resultCode0105":
                this.lightboxstatus = false;
                if (this.dd_Flag) {
                    this.selectedIndex = 0;
                } else {
                    this.app.exitWeb();
                }
                return;
            case "resultCode03":
                this.app.routeByBillID({ billID: '6CEC1702-D76D-431C-A355-66C635504DEA', closeWeb: true });
                this.lightboxstatus = false;
                return;
            case "resultCode04":
                this.app.routeByBillID({ billID: '6CEC1702-D76D-431C-A355-66C635504DEA', closeWeb: true });
                this.lightboxstatus = false;
                return;
            case "pickAccount":
                this.setLightBoxStatus = false;
                this.isPickAccount = null;
                return;
            case "finalApplyResult":
                this.app.routeByBillID({ billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753', closeWeb: true });
                return;
        }
    }

    /** 返回前頁功能 */
    returnToLastPage () {
        if (this.dd_Flag) {
            this.app.initHeaderBack('自動扣繳查詢');
            this.selectedIndex = 0;
            this.isChecked = false;
            this.checkCanNextStep();
        } else {
            this.app.exitWeb();
        }
    }

    /** 時間轉換 */
    transTime ( inputDateTime) {
        // 建立 Date 物件
        const dateObj = new Date(inputDateTime);

        // 取得年、月、日、時、分、秒
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // 月份從 0 開始，所以要加 1
        const day = dateObj.getDate();
        const hour = dateObj.getHours();
        const minute = dateObj.getMinutes();
        const second = dateObj.getSeconds();

        // 格式化日期時間字串
        const formattedDateTime = `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
        return formattedDateTime
    }
}

