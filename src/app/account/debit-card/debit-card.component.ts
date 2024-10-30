import { Component, OnInit } from '@angular/core';
import { DebitCardStatementInquiryItem, LatestTxItem, getDebitLatestTxRs, getDebitStatementInquiryRs, specialRecordViewItem } from 'src/app/shared/services/sinopac/account.models';
import { AccountService, AuthHelper, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debit-card',
  templateUrl: './debit-card.component.html',
  styleUrls: ['./debit-card.component.scss']
})
export class DebitCardComponent implements OnInit {
    private readonly app = new AppWrapper();
    /** 燈箱開關 */
    public lightboxstatus: boolean = false;
    /** 月份下拉 */
    public Months: Array<{ Month: string, value: string }> = [];
    /** 紀錄從查看更多進到此頁面時的卡號 */
    public cardLast4: string;
    /** 紀錄卡號返回時回到該卡 */
    public cardNo: string = "999";
    /** 使用者身分證 */
    public customerid: string = null;
    /** Debit卡授權金額所有回傳資訊 */
    public latestTxResult:getDebitLatestTxRs = {Cards:[],Items:[]};
    /** Debit卡授權金額回傳資訊(Items)依據幣別分類 */
    public latestTxItems = {};
    /** Debit卡授權金額html應顯示的資料 */
    public latestTxItemView:LatestTxItem[];
    /** Debit卡交易紀錄所有回傳資訊 */
    public statementInquiryResult: getDebitStatementInquiryRs = {Cards:[],Items:[]};
    /** Debit卡交易紀錄回傳資訊(Items)依據幣別分類 */
    public statementInquiryItems = {};
    /** Debit卡交易紀錄html應顯示的資料 */
    public statementInquiryView:DebitCardStatementInquiryItem[];
    /** 所有資料的幣別中文名稱(相同幣別只取一個，TWD在最前面) */
    public currencyNameList:string[];
    /** 記錄頁面當前所選幣別 */
    public currencyNameNow:string;
    /** 本期/累計 未扣款金額所有回傳資訊 */
    public specialRecordResult = [];
    /** 本期/累計 未扣款金額(Items)依據幣別分類 */
    public specialRecordItems = {};
    /** 本期/累計 未扣款金額紀錄 */
    public specialRecordView:specialRecordViewItem = {active:false,cardNumber:"",CumulativeUndebitedAmount:"",AmountUndebiteInThisPeriod:""};

    constructor(
        private accountService: AccountService,
        private memberService: MemberService,
        private router: Router
    ) {}

    public async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('交易紀錄');
        this.cardLast4 = history.state?.cardLast4;
        this.cardNo = history.state?.cardNo;
        this.customerid = AuthHelper.CustomerId;
        await this.getMonthSelect();
        await this.getDebitLatestTx();
        await this.getDebitStatementInquiry(this.Months[0].value);
        await this.getCurrencyEName();
        await this.changeCurrencyEName(this.currencyNameList[0]);
        const CurrencyCName = history.state?.CurrencyCName;
        if(CurrencyCName){
            this.currencyNameNow = CurrencyCName;
            await this.changeCurrencyEName(CurrencyCName);
        }
    }

    /** 產生月份下拉清單 */
    private getMonthSelect() {
        this.Months = [];
        const now = new Date(Date.now());
        for (let index = 0; index < 12; index++) {
            const tmp = new Date(now.getFullYear(), now.getMonth() - index, 1)
            const tmpmonth = tmp.getMonth() < 9 ? '0' + (tmp.getMonth() + 1) : tmp.getMonth() + 1;
            this.Months.push({ Month: tmp.getFullYear()+' / '+(tmp.getMonth() + 1 )+ '月', value: tmp.getFullYear() + tmpmonth.toString() });
        }
    }

    /** 查詢Debit卡授權金額 */
    public async getDebitLatestTx () {
        const response = await this.accountService.GetDebitCardLatestTx({ ID: this.customerid })
        if(response.ResultCode === "00"){
            this.latestTxResult = response.Result;
            //處理數字顯示樣式
            this.latestTxResult.Items?.forEach(element => {
                element.AuthAmtView = this.toThousands(element);
                element.AuthDate = element.AuthDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1/$2/$3");
            })
            //從卡片管理頁進來的，要做資料塞選，只留下特定卡號資料
            if(this.cardLast4) {
                this.latestTxResult.Cards = response.Result.Cards?.filter(T => T.CardLast4 === this.cardLast4);
                this.latestTxResult.Items = response.Result.Items?.filter(T => T.CardLast4 === this.cardLast4);
            }
            //依據幣別將資料分類
            this.latestTxItems = {};
            if(this.latestTxResult?.Items?.length > 0)
            {
                this.latestTxItems = this.latestTxResult.Items?.reduce((group,items) => {
                    if(!group[items.CurrencyCName]) {group[items.CurrencyCName] =[];}
                    group[items.CurrencyCName].push(items);
                    return group;
                },{});
            }
            //將 授權金額 在各幣別內依據日期排序由近到遠
            for( const key in this.latestTxItems) {
                this.latestTxItems[key].sort((a, b) => {
                    const endTimeA = new Date(`${a.AuthDate} ${a.AuthTime}`);
                    const endTimeB = new Date(`${b.AuthDate} ${b.AuthTime}`);
                    return endTimeB.getTime() - endTimeA.getTime();
            })}
        }
    }
    /** 查詢Debit卡交易紀錄 */
    public async getDebitStatementInquiry (queryMonth: string) {
        //清空資料
        this.statementInquiryResult = {Cards:[],Items:[]};
        this.statementInquiryItems = {};
        this.statementInquiryView = [];
        this.specialRecordResult = [];
        this.specialRecordItems = {};
        //查詢
        const response = await this.accountService.GetDebitCardStatementInquiry({ ID: this.customerid, QueryMonth: queryMonth })
        if(response.ResultCode === "00"){
            this.statementInquiryResult = response.Result;
            //處理數字，如果是臺幣去除小數點如果是外幣則保留
            this.statementInquiryResult.Items?.forEach(function(element) {if(element.CurrencyCName === "臺幣") {element.AMT = element.AMT.split(".")[0] }})
            //取出 累積/本期 未扣款金額資料，並在原始資料中刪除
            this.specialRecordResult = this.statementInquiryResult.Items?.filter((T) => {
                if(T.TXDATE.trim() === '')
                {
                    T.ACCOUNT = T.ACCOUNT.replace(/(\d{3})\d+(\d{4})/, "$1*****$2");
                    T.MEMO = T.MEMO.split("  ")[1];
                    return T;
                }
                return false
            });
            this.statementInquiryResult.Items = this.statementInquiryResult.Items?.filter(T => T.TXDATE.trim() !== '');
            //將 累積/本期 未扣款金額資料，依據幣別排列
            if(this.specialRecordResult?.length > 0)
            {
                this.specialRecordItems = this.specialRecordResult?.reduce((group,items) => {
                    if(!group[items.CurrencyCName]) {group[items.CurrencyCName] =[];}
                    group[items.CurrencyCName].push(items);
                    return group;
                },{});
            }
            //從卡片管理頁進來的，要做資料塞選，只留下特定卡號資料
            if(this.cardLast4) {
                this.statementInquiryResult.Cards = response.Result.Cards?.filter(T => T.CardLast4 === this.cardLast4);
                this.statementInquiryResult.Items = response.Result.Items?.filter(T => T.CARDNO === this.cardLast4);
            }
            //將 交易紀錄 依據幣別將資料分類
            this.statementInquiryItems = {};
            if(this.statementInquiryResult?.Items?.length > 0)
            {
                this.statementInquiryItems = this.statementInquiryResult.Items?.reduce((group,items) => {
                    if(!group[items.CurrencyCName]) {group[items.CurrencyCName] =[];}
                    group[items.CurrencyCName].push(items);
                    return group;
                },{});
            }
            //將 交易紀錄 在各幣別內依據日期排序由近到遠
            for( const key in this.statementInquiryItems) {
                this.statementInquiryItems[key].sort((a, b) => {
                    const endTimeA = new Date(a.TXDATE).getTime();
                    const endTimeB = new Date(b.TXDATE).getTime();
                    return endTimeB - endTimeA;
                  });
            }
        }
    }

    /** 選擇月份時查詢Debit卡交易紀錄 */
    public async getDetail (queryMonth: string) {
        await this.getDebitStatementInquiry(queryMonth);
        await this.getCurrencyEName();
        await this.changeCurrencyEName(this.currencyNameNow);
    }

    /** 蒐集使用幣別 */
    public getCurrencyEName () {
        //清空資料
        this.currencyNameList = []
        //Debit卡交易紀錄、Debit卡授權金額，幣別整合
        const LatestTxCurrencyNameList = [...new Set(this.latestTxResult.Items?.map(item => item.CurrencyCName))];
        const StatementInquiryCurrencyNameList = [...new Set(this.statementInquiryResult.Items?.map(item => item.CurrencyCName))];
        this.currencyNameList = LatestTxCurrencyNameList.concat(StatementInquiryCurrencyNameList);
        //如果 累積/本期 未扣款金額有資料，將其加入幣別序列
        if(this.specialRecordResult?.length > 0)
        {
            const SpecialRecordNameList = [...new Set(this.statementInquiryResult.Items?.map(item => item.CurrencyCName))];
            this.currencyNameList = this.currencyNameList.concat(SpecialRecordNameList);
        }
        //幣別整理
        if(this.currencyNameList?.length > 0)
        {
            //過濾陣列是否有重複的幣別
            this.currencyNameList = [...new Set(this.currencyNameList)];
            //如果"臺幣"不在第一位提到第一位
            if (this.currencyNameList.indexOf("臺幣") > 0 && this.currencyNameList.indexOf("臺幣") !== -1)
            {
                this.currencyNameList = this.currencyNameList.filter((value) => {return value !== "臺幣"});
                this.currencyNameList.unshift("臺幣");
            }
        }
        else
        {
            //如果完全沒有資料就顯示臺幣
            this.currencyNameList.unshift("臺幣");
        }

    }

    /** HTML調整幣別時顯示不同幣別的資料 */
    public changeCurrencyEName (CurrencyName: string) {
        if(this.currencyNameList.includes(CurrencyName)) {this.currencyNameNow = CurrencyName;}
        else {this.currencyNameNow = this.currencyNameList[0]}
        this.latestTxItemView = this.currencyNameNow in this.latestTxItems? this.latestTxItems[this.currencyNameNow]:[];
        this.statementInquiryView = this.currencyNameNow in this.statementInquiryItems? this.statementInquiryItems[this.currencyNameNow]:[];
        //未扣款金額顯示控制
        if(this.currencyNameNow in this.specialRecordItems )
        {
            this.specialRecordView.active = true;
            this.specialRecordView.cardNumber = this.specialRecordItems[this.currencyNameNow][0].ACCOUNT;
            this.specialRecordItems[this.currencyNameNow].forEach(T => {
                if(T.MEMO === '本期未扣款金額'){this.specialRecordView.AmountUndebiteInThisPeriod = T.AMT;}
                if(T.MEMO === '累積未扣款金額'){this.specialRecordView.CumulativeUndebitedAmount = T.AMT;}
            });
        }
        else
        {
            this.specialRecordView = {
                active:false,cardNumber:"",
                CumulativeUndebitedAmount:"",
                AmountUndebiteInThisPeriod:""
            };
        }
    }

    /** 關閉 */
    public close() {
        if(this.cardLast4) {
            this.router.navigate(['/Account/CardManage'], {
                state: {
                    cardNo: this.cardNo
                }
            });
        }
        else if (history.state?.source === 'bill') {
            this.router.navigate(['/Account/CardBill']);
        }
        else{
            this.app.exitWeb();
        }

    }

    /** 加上千分位，臺幣要去掉小數點後面數字，外幣則保留 */
    public toThousands(item:LatestTxItem) {
        const num = +item.AuthAmt;
        if(item.CurrencyCName === "臺幣") {
            return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        else {
            const formattedNum = (num || 0).toFixed(2);
            const parts = formattedNum.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return parts.join('.');
        }
    }
}
