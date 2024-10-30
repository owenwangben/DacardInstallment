import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { BillAmounts, LatestTxItem, SubTotal } from 'src/app/shared/services/sinopac/account.models';
import { AccountService, AuthHelper, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import * as dayjs from 'dayjs';
import { AutoDeductService } from 'src/app/shared/services/sinopac/autodeduct.service';
import { SensorsTrack } from 'src/app/shared/services/sensorsdata';

enum Bill {
    cedit = 0,
    debit = 1
}
@Component({
    selector: 'app-card-bill',
    templateUrl: './card-bill.component.html',
    styleUrls: ['./card-bill.component.scss']
})
export class CardBillComponent implements OnInit {
    private readonly app = new AppWrapper();
    ceditHave: boolean = false;
    debitHave: boolean = false;
    bill = Bill;
    pillTabs = this.bill.cedit;
    Tabs: boolean = true;
    amountHide: boolean = false;
    creditsModify: boolean = false;
    accountInfo: boolean = false;
    errorMsg: boolean = false;
    /** 帳單月份 */
    monthBill: string;
    /** 繳款截止日 */
    duedate: string;
    /** 台幣帳單 */
    billTw: BillAmounts;
    /** 台幣帳單已繳完 */
    billTwFinish: boolean = false;
    /** 台幣是否曾經繳費 */
    billTwRecord: boolean = false;
    /** 外幣帳單 */
    billOut: BillAmounts[];
    /** 消費紀錄 */
    recordList: SubTotal[];
    /** 結帳日 */
    STMTDATE: string;
    /** 可用額度 */
    CreditAvailable: string;
    /** 總額度(臺幣) */
    CreditCardLimit: string;
    /** 額度百分比 */
    CredirPercentage: number = 0;
    /** Debit帳務 */
    Statement: any[];
    /** 最新授權(全部) */
    LatestTx: LatestTxItem[];
    /** 最新授權(該幣別近五筆) */
    LatestTxItem5: LatestTxItem[];
    /** 最新授權下拉 */
    optionLatestTx: any[];
    /** 最新授權目前選項 */
    optionSelected: string = "臺幣";
    /** 載入狀態 0: 加載中；1:載入成功；2:載入失敗;3:查無資料 */
    billTwStatus: number = 0;
    recordListStatus: number = 0;
    StatementStatus: number = 0;
    LatestTxStatus: number = 0;
    /** 額度資料 */
    haveCredit: boolean = false;
    /** 是否申請自動扣繳 */
    autoWithholding: boolean = false;
    /** 是否申請自動扣繳 */
    twdAutoDeductMsg: string;
    /** 帳單自動扣繳按鈕訊息 */
    autoWithHoldingMsg: string = "立即申請";
    /** 登入方式 */
    loginMethod: string;
    /** isFido驗證訊息 */
    isFidoMSG: boolean = false;

    constructor(
        private router: Router,
        private memberService: MemberService,
        private accountService: AccountService,
        private autoDeductService: AutoDeductService,
    ) {
    }

    public ngOnInit(){
        this.getCardStatus2();
        this.getLoginMethod();
    }

    /**取得所有卡 */
    async getCardStatus2() {
        try {
            const response = await this.memberService.CardStatus2({
                ID: AuthHelper.CustomerId,
                IsIncludeDebitCard: true
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                if (response.Result.Items.filter(x => x.IsDebitCard === true).length > 0) {
                    this.debitHave = true;
                    this.pillTabs = this.bill.debit;
                    this.getDebitStatement();
                    this.getDebitLatestTx();
                    //設定Header名稱
                    this.app.initHeaderMenu('Debit卡');
                }
                if (response.Result.Items.filter(x => x.IsDebitCard === false).length > 0) {
                    this.ceditHave = true;
                    this.pillTabs = this.bill.cedit;
                    this.getRecentBill();
                    this.getOutstandingDetail();
                    //設定Header名稱
                    this.app.initHeaderMenu('信用卡');
                }
                if (this.debitHave && this.ceditHave) {
                    //設定Header名稱
                    this.app.initHeaderMenu('信用卡/Debit卡');
                }
                if (!this.debitHave && !this.ceditHave) {
                    //信用卡總覽(含帳務示意頁-辦卡頁)
                    const appUrl = location.origin + '/CawhoPay/Card/Apply';
                    window.location.href = appUrl;
                }
            }
            else {
                this.app.showMsgDialog({ id: 'CardNoData', title: '信用卡功能維護中', msg: response.ResultMessage, btnStr: '確定' });
            }
            return;
        } catch (error) {
            console.log(error);
        }
    }

    /**取得信用卡帳務資訊 */
    async getRecentBill(reload?: boolean) {
        try {
            // const nowYM = dayjs().format('YYYYMM');
            const response = await this.accountService.RecentBill({
                ID: AuthHelper.CustomerId,
                BillDateYYYYMM: "",
                IsDACARD: true
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                //BillDate格式為YYYYMM
                this.monthBill = dayjs(response.Result?.BaseData?.BillDate, 'YYYYMM').format('M');
                this.duedate = response.Result?.BaseData?.DUEDATE;
                this.billTw = response.Result?.BillAmounts?.filter(x => x.CurrencyCode === "000")[0];
                this.billOut = response.Result?.BillAmounts?.filter(x => x.CurrencyCode !== "000");
                this.autoWithholding = response.Result?.DD_FLAG === "Y"? true:false;
                if (this.autoWithholding) {
                    this.twdAutoDeductMsg = response.Result?.TwdAutoDeductMsg;
                    var resp = await this.autoDeductService.GetAutoDeduct(
                        { ID: AuthHelper.CustomerId, OnlyGetBacnkCode: true })
                    if (resp.ResultCode === "00") {
                        this.autoWithHoldingMsg = resp.Result?.BankCode === '807'? '查詢設定':'變更設定';
                    }
                }
                if (this.billTw) {
                    const CURRBAL = this.numPipe(this.billTw?.CURRBAL);
                    const TotalPaymentAmt = this.numPipe(this.billTw?.TotalPaymentAmt);
                    //台幣帳單是否已繳完
                    TotalPaymentAmt - CURRBAL >= 0 ? this.billTwFinish = true : this.billTwFinish = false;
                    //台幣是否曾經繳費
                    TotalPaymentAmt > 0 ? this.billTwRecord = true : this.billTwRecord = false;
                }
                //是否有資料
                if (response.Result?.BillAmounts?.length > 0)
                    this.billTwStatus = 1;
                else
                    this.billTwStatus = 3;
                return;
            }
            else {
                this.billTwStatus = 2;
                if (reload)
                    this.errorMsg = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**取得近期消費紀錄 */
    async getOutstandingDetail(reload?: boolean) {
        try {
            const response = await this.accountService.OutstandingDetail({
                ID: AuthHelper.CustomerId,
                IsExcludePaidUp: true,
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                //STMTDATE格式DD轉為D
                this.STMTDATE = dayjs('202301' + response.Result.STMTDATE, 'YYYYMMDD').format('D');
                this.CreditAvailable = response.Result?.CreditAvailable;
                this.CreditCardLimit = response.Result?.CreditCardLimit;
                this.recordList = response.Result?.SubTotal;
                if (this.CreditAvailable && this.CreditCardLimit) {
                    this.haveCredit = true;
                    const CreditAvailable = this.numPipe(this.CreditAvailable);
                    const CreditCardLimit = this.numPipe(this.CreditCardLimit);
                    //判斷總額度不等於0，避免除以0錯誤
                    if (CreditCardLimit !== 0) {
                        this.CredirPercentage = Math.round(((CreditCardLimit - CreditAvailable) / CreditCardLimit) * 100);
                    }
                }
                else
                    this.haveCredit = false;
                //是否有消費資料
                if (response.Result?.SubTotal?.length > 0)
                    this.recordListStatus = 1;
                else
                    this.recordListStatus = 3;
                return;
            }
            else {
                this.recordListStatus = 2;
                if (reload)
                    this.errorMsg = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**取得Debit卡帳務資訊 */
    async getDebitStatement(reload?: boolean) {
        const nowYM = dayjs().format('YYYYMM');
        try {
            const response = await this.accountService.GetDebitCardStatementInquiry({
                ID: AuthHelper.CustomerId,
                QueryMonth: nowYM
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.Statement = response.Result?.Items?.filter(x=>x.TXDATE.trim() !== '').reduce((groups, item) => {
                    const group = groups.find(g => g.CurrencyCode === item?.CurrencyCode);

                    if (group) {
                        // 如果已經存在相同的分類，則將 amt 加總到總額
                        group.AMT += this.numPipe(item?.AMT);
                    } else {
                        // 如果不存在相同的分類，則創建一個新的分類並加入到 groups 中
                        groups.push({
                            CurrencyCode: item?.CurrencyCode,
                            DEDATE: dayjs(item?.DEDATE).toString(),
                            CurrencyCName: item?.CurrencyCName,
                            AMT: this.numPipe(item?.AMT)
                        });
                    }
                    return groups;
                }, []);
                if (response.Result?.Items?.length > 0)
                    this.StatementStatus = 1;
                else
                    this.StatementStatus = 3;
                return;
            }
            else {
                this.StatementStatus = 2;
                if (reload)
                    this.errorMsg = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**取得最新授權 */
    async getDebitLatestTx(reload?: boolean) {
        try {
            const response = await this.accountService.GetDebitCardLatestTx({
                ID: AuthHelper.CustomerId
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.optionLatestTx = response.Result?.Items?.reduce((groups, item) => {
                    const group = groups.find(g => g.CurrencyCode === item?.CurrencyCode);
                    if (!group) {
                        // 如果不存在相同的分類，則創建一個新的分類並加入到 groups 中
                        groups.push({
                            CurrencyCode: item?.CurrencyCode,
                            CurrencyCName: item?.CurrencyCName,
                        });
                    }
                    return groups;
                }, []);
                const Items =
                    response.Result?.Items?.sort((a, b) => this.gettime(b?.AuthDate,b?.AuthTime) - this.gettime(a?.AuthDate,a?.AuthTime));
                this.LatestTx = Items?.map(item => {
                    return {
                        ...item,
                        AuthDate: dayjs(item.AuthDate).format('YYYY/MM/DD').toString()
                    }
                });
                if (response.Result?.Items?.length > 0) {
                    this.optionChange(this.optionLatestTx[0]?.CurrencyCode);
                    this.LatestTxStatus = 1;
                }
                else
                    this.LatestTxStatus = 3;
                return;
            }
            else {
                this.LatestTxStatus = 2;
                if (reload)
                    this.errorMsg = true;
            }
        } catch (error) {
            console.log(error);
        }
    }

    apiReload(api: number) {
        switch (api) {
            case 0: //信用卡帳務資訊
                {
                    this.monthBill = "";
                    this.duedate = "";
                    this.billTw = null;
                    this.billOut = [];
                    this.billTwFinish = false;
                    this.billTwStatus = 0;
                    return this.getRecentBill(true);
                }
            case 1: //近期消費紀錄
                {
                    this.STMTDATE = "";
                    this.CreditAvailable = "";
                    this.CreditCardLimit = "";
                    this.recordList = [];
                    this.CredirPercentage = 0;
                    this.recordListStatus = 0;
                    return this.getOutstandingDetail(true);
                }
            case 2: //Debit卡帳務資訊
                {
                    this.Statement = [];
                    this.StatementStatus = 0;
                    return this.getDebitStatement(true);
                }
            case 3: //最新授權
                {
                    this.optionLatestTx = [];
                    this.LatestTx = [];
                    this.LatestTxItem5 = [];
                    this.LatestTxStatus = 0;
                    this.optionSelected = "臺幣";
                    return this.getDebitLatestTx(true);
                }
            default: { return null }
        }
    }

    optionChange(CurrencyCode: string) {
        this.optionSelected = this.optionLatestTx.find(x=>x.CurrencyCode === CurrencyCode)?.CurrencyCName;
        this.LatestTxItem5 = this.LatestTx.filter(x => x.CurrencyCode === CurrencyCode).slice(0, 5);
    }

    gettime(date: string, time:string) {
        // 取得日期的Time
        if (date && date.trim() !== '') {
            return dayjs(date + time).valueOf();
        }
        return 0;
    }

    numPipe(item: string) {
        //轉number，去除千分衛
        return parseFloat(item.replace(',', ''));
    }

    pillTabSwitch(type: Bill) {
        this.pillTabs = type;
    }

    recordShow() {
        this.router.navigate(['/Account/CaedRecordPaid6mons']);
    }

    goInstallmentRecord() {
        this.router.navigate(['/Account/InstallmentRecord']);
    }

    amountHideSwitch() {
        this.amountHide = !this.amountHide
    }

    creditsModifyShow() {
        this.creditsModify = !this.creditsModify;
    }

    showCustomer() {
        this.app.showCustomerService();
    }

    goCardAutoWithholding() {
        this.router.navigate(['/Application/CardAutoWithholding']);
    }

    accountInfoShow() {
        this.accountInfo = !this.accountInfo;
        if (this.accountInfo) {
            document.body.classList.add('scroll-fixed');
        }
        else {
            document.body.classList.remove('scroll-fixed');
        }
    }

    routeByBillID(type: number) {
        switch (type) {
            case 0: //信用卡回饋
                return this.app.routeByBillID({ billID: 'F5AE6E8A-5B67-4BFA-8F76-C156531D4246', closeWeb: true });
            case 1: //活動登錄
                return this.app.routeByBillID({ billID: '8c71f111-a97c-43c1-9990-8cd46094affc', closeWeb: true });
            case 2: //線上開卡
                return this.app.routeByBillID({ billID: 'F3E516AF-2EA8-4176-ABB4-5AF4C509CE9D', closeWeb: true });
            case 3: //掛失補發
                return this.app.routeByBillID({ billID: '2D1E0B17-1F24-43ED-9139-4A2A94FF2F57', closeWeb: true });
            case 4: //信用卡帳務
                return this.app.routeByBillID({ billID: '3FBC9A94-7C5D-4915-A83E-FD06544B2A78', closeWeb: true });
            case 5: //帳單分期
                return this.app.routeByBillID({ billID: 'F584597D-E6A9-4D71-A346-B22396AE6E22', closeWeb: true });
            case 6: //永豐信用卡費
                return this.app.routeByBillID({ billID: '42D47797-67B7-4337-A8FF-7A1CA05CF9D5', closeWeb: true });
            case 7: //臨時信用額度調整
                return this.app.routeByBillID({ billID: 'FE0F6D18-94A9-425A-BA17-FD57DFCE6438', closeWeb: true });
            case 8: //永久信用額度調整
                return this.app.routeByBillID({ billID: '26E5F787-AB06-4ADE-B2A8-2AB541ED9624', closeWeb: true });
            case 9: //額度調整進度查詢
                return this.app.routeByBillID({ billID: 'C35D94ED-6994-492C-847B-D4375649B8B2', closeWeb: true });
            case 10: //預借現金
                return this.app.routeByBillID({ billID: '4254B936-7BB0-4589-B75B-5317D42DB668', closeWeb: true });
            case 11: //單筆消費分期
                return this.app.routeByBillID({ billID: 'D94DC678-8F9A-4645-8B2A-1FD1926E305F', closeWeb: true });
            case 12: //辦卡頁(信用卡總覽)
                return this.app.routeByBillID({ billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753', closeWeb: true });
            case 13: //提醒通知設定 (刷卡驗證Email通知開關)
                SensorsTrack("NotificationSettingStart", { });
                return this.app.routeByBillID({ billID: 'native-notification-setting', closeWeb: true });
            case 14: //註冊FIDO-快速登入設定
                return this.app.routeByBillID({ billID: 'D1A12239-C8E3-460F-B6CC-1DC98C8D5149', closeWeb: true });
            default:
                return "";
        }
    }

    Godebitcard(CurrencyCName?){
        this.router.navigate(['/Account/DebitCard'], {
            state: {
                CurrencyCName: CurrencyCName,
                source: "bill"
            }
        });
    }

    /** 是否顯示繳款記錄按鈕 */
    get showPaymentRecordBtn(): boolean {
        if ((this.autoWithholding && this.billTwRecord) || (!this.autoWithholding && this.billTwFinish))
            return true;
        else
            return false;
    }

    /** FIDO 註冊確認 */
    async getLoginMethod() {
        const LoginData = await this.app.getLoginData();
        this.loginMethod = LoginData.loginMethod;
    }

    /** 導入 FIDO 註冊 */
    async goFido() {
        await this.getLoginMethod();
        if (this.loginMethod === 'Fido') {
            this.isFidoMSG = true;
        }
        //生物辨識、帳密、圖形密碼
        else {
            this.routeByBillID(14);
        }
    }
}
