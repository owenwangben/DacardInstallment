import { FeedbackSummary, FeedbackDetailB, FeedbackDetailA, InquiryTypeOptions, QueryFeedbackRs, QueryFeedbackList, CardFeedBackItem, TPointsFeedbackSummary, TPointsQueryFeedbackRs, TPointsFeedbackDetailModel, TPointsFeedbackItem, TPointsRedemptionRecordsResultModel, TPointsFeedback } from 'src/app/shared/services/sinopac/bouns.models';
import { AfterViewInit, Component, OnInit, ViewChildren, QueryList, NgZone } from '@angular/core';
import { AccountService, AppHelper, ApplyService, AuthHelper, AuthService, BonusService, CardReissueService, dataTranslateHelper, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import { Router } from '@angular/router';
import { LatestTxItem } from 'src/app/shared/services/sinopac/account.models';
import { PaybillService } from 'src/app/shared/services/sinopac/paybill.service';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { CardStatus2Item } from 'src/app/shared/services/sinopac/member.models';
import { PaymentToolQueryRs } from 'src/app/shared/services/sinopac/paybill.model';
import { LightBoxStatus } from 'src/app/shared/services/sinopac/shared.model';
import { QueryCardDealSettingInfoRs, LostCard, LostCardItem } from 'src/app/shared/services/sinopac/apply.model';
import Swal from 'sweetalert2';
import { CardTransactionSettingSensorsTrack, CashAdvanceSensorsTrack, CreditCardResultSensorsTrack, CreditCardSensorsTrack, GeneralSensorsTrack, SensorsTrack} from 'src/app/shared/services/sensorsdata';
declare var $: any;

@Component({
    selector: 'app-card-manage',
    templateUrl: './card-manage.component.html',
    styleUrls: ['./card-manage.component.scss']
})
export class CardManageComponent implements OnInit, AfterViewInit {
    private app = new AppWrapper();
    private customerid: string = '';
    public Is_iOS: boolean = AppHelper.Is_iOS;
    @ViewChildren('allCards') allCards: QueryList<any>;

    // 卡片狀態區
    public Cards: CardStatus2Item[];
    public activeCard: CardStatus2Item;
    public current_card_index: number;
    private activeIndex: number = 0;
    //紀錄卡大車隊卡片選擇頁月份
    public monthSelected : string;
    // 卡片資訊區
    public AllLatestTxs: LatestTxItem[];
    public LatestTxs: LatestTxItem[];
    public Months: Array<{ Month: string, value: string }> = [];
    public typeOptions = InquiryTypeOptions;
    public inquiryTypeName: string;
    public selectedMonth: string;
    public bindstate: boolean = false;
    public cardBrand: string;
    /** 登入方式 */
    public loginMethod: string;
    public lightBoxFido: boolean = false;

    // 回饋資料區
    public dcurFeedbackList: Array<QueryFeedbackList> = [];
    public dawhoFeedbackList: Array<QueryFeedbackList> = [];
    public sportFeedbackList: Array<QueryFeedbackList> = [];
    public cashFeedbackList: Array<QueryFeedbackList> = [];
    public mitsuiFeedbackList: Array<QueryFeedbackList> = [];
    public carsFeedbackList: Array<QueryFeedbackList> = [];
    public dawayFeedbackList: Array<QueryFeedbackList> = [];
    public bonusFeedback: QueryFeedbackRs;
    public TPointsbonusFeedback: TPointsQueryFeedbackRs;
    public detailModel: TPointsFeedback;
    public detailMode = false;
    public showLinePoints = false;
    public detailA: FeedbackDetailA;
    public detailB: FeedbackDetailB;
    public cardItem: Array<CardFeedBackItem>;
    private pageYOffset: any;
    public resultModel: TPointsRedemptionRecordsResultModel;
    public ExchangeRecordButton = false;

    // 綁定支付工具區
    public paymentTools: Array<PaymentToolQueryRs> = [];

    // 交易設定
    public tradeManagerError = false;
    public tradeOptionsOrigin: QueryCardDealSettingInfoRs;
    public tradeOptionsOriginTemp: QueryCardDealSettingInfoRs;
    public tradeOptions: QueryCardDealSettingInfoRs = {
        BLOCK_ALL: "N",
        BLOCK_L_P: "Y",
        BLOCK_L_O: "Y",
        BLOCK_F_P: "Y",
        BLOCK_F_O: "Y",
        LIMIT_AMT: 0
    };

    // 燈箱內容及顯示狀態
    public lightBoxStatus: LightBoxStatus = { IsDisplay: false };

    dataReady = false;

    //FIDO驗證相關
    /** 雙按鈕燈箱 */
    twoBtnBox: boolean = false;
    /** 單按鈕燈箱 */
    oneBtnBox: boolean = false;
    oneData: any;
    twoData: any;


    public constructor(
        private router: Router,
        private accountService: AccountService,
        private applyService: ApplyService,
        private memberService: MemberService,
        private bonusService: BonusService,
        private paybillService: PaybillService,
        private authService: AuthService,
        private cardReissueService: CardReissueService,
        private zone: NgZone
    ) {

    }

    public compareTradeOptionsChange() {
        return ((JSON.stringify(this.tradeOptions) === JSON.stringify(this.tradeOptionsOriginTemp) || (this.tradeOptions.BLOCK_ALL == "Y" && this.tradeOptions.BLOCK_ALL == this.tradeOptionsOriginTemp.BLOCK_ALL))) || !((this.activeCard?.VIREAL === '1' && this.activeCard?.IsVCard) || this.activeCard?.IsActivated || this.activeCard?.Spac == "2") || this.activeCard?.XferFlag == "Y";
    }
    // 開啟/關閉交易設定
    public changeTradeOption(e) {
        if (this.tradeOptions[e.target.name] == "Y")
            this.tradeOptions[e.target.name] = "N";
        else
            this.tradeOptions[e.target.name] = "Y";
    }

    // 設定單筆交易額度
    public changeTradeLimit(e) {
        this.tradeOptions.LIMIT_AMT = +e.target.value;
    }

    // 取消單筆交易額度
    public cancelTradeLimit() {
        this.tradeOptions.LIMIT_AMT = 0;
    }

    // 查詢交易設定次數 00:未超過當日設定上限, 01:已超過當日上限, 02:查詢失敗
    public async checkFunctionLimit() {
        try {
            const response = await this.authService.CheckFunctionLimit({
                FunctionCode: "2",
                FunctionKey: this.activeCard.CardNo,
                Source: "DACARD"
            })
            if (ServiceHelper.ifSuccess(response, false))
                return response.Result.TodayCount < response.Result.DailyLimit ? '00' : '01';
        } catch (error) {
            console.log(error);
        }
        return '02';
    }

    // 更新交易設定次數
    public async updateFunctionCount() {
        try {
            await this.authService.UpdateFunctionCount({
                FunctionCode: "2",
                FunctionKey: this.activeCard.CardNo,
                Source: "DACARD"
            })
        } catch (error) {
            console.log(error);
        }
    }

    // 取得交易設定API
    public async queryCardDealSettingInfo() {
        if (this.activeCard.IsVCard || this.activeCard.IsActivated || this.activeCard?.Spac == "2") {
            try {
                const response = await this.applyService.QueryCardDealSettingInfo({
                    CardNo: this.activeCard.CardNo,
                    CARD_TYPE: this.activeCard.ProductCode
                })
                if (ServiceHelper.ifSuccess(response, false)) {
                    this.tradeOptions = { ...response.Result };
                    this.tradeOptionsOrigin = { ...this.tradeOptions };
                    this.tradeOptionsOriginTemp = { ...this.tradeOptions };
                    return;
                }
            } catch (error) {
                console.log(error);
            }
            this.tradeManagerError = true;
            this.showSweetAlertMessages('無法進行卡片管理設定，若有問題請洽客服專線(02)2528-7776');
        }
        this.tradeOptions = {
            BLOCK_ALL: "N",
            BLOCK_L_P: "Y",
            BLOCK_L_O: "Y",
            BLOCK_F_P: "Y",
            BLOCK_F_O: "Y",
            LIMIT_AMT: 0
        }
        this.tradeOptionsOrigin = { ...this.tradeOptions };
        this.tradeOptionsOriginTemp = { ...this.tradeOptions };
        return;
    }

    // 設定卡片交易設定狀態
    public async cardDealSetting() {
        let response
        let checkFunctionLimitRs = await this.checkFunctionLimit();
        try {
            this.tradeManagerError = true;
            if (checkFunctionLimitRs == "00") {
                let tradeOptionsRq = this.tradeOptions.BLOCK_ALL == "Y" ? { ...this.tradeOptionsOrigin } : { ...this.tradeOptions };
                tradeOptionsRq.BLOCK_ALL = this.tradeOptions.BLOCK_ALL == "Y" && this.tradeOptions.BLOCK_ALL == this.tradeOptionsOrigin.BLOCK_ALL ? this.tradeOptionsOrigin.BLOCK_ALL : this.tradeOptions.BLOCK_ALL;
                const req = {
                    ID: this.customerid,
                    CardNo: this.activeCard.CardNo,
                    CARD_TYPE: this.activeCard.ProductCode,
                    ...tradeOptionsRq
                }
                response = await this.applyService.CardDealSetting(req)
                CardTransactionSettingSensorsTrack("CardTransactionSetting", this.tradeOptions.BLOCK_ALL === "Y" ? "開啟" : "關閉", this.tradeOptions.BLOCK_L_P === "N" ? "開啟" : "關閉", this.tradeOptions.BLOCK_L_O === "N" ? "開啟" : "關閉",
                    this.tradeOptions.BLOCK_F_P === "N" ? "開啟" : "關閉", this.tradeOptions.BLOCK_F_O === "N" ? "開啟" : "關閉", this.tradeOptions.LIMIT_AMT, this.activeCard?.Name); //神策埋點
                if (ServiceHelper.ifSuccess(response, false)) {
                    this.updateFunctionCount()
                    await this.showSweetAlertMessages('此卡片交易設定完成', false);
                    this.tradeOptionsOriginTemp = { ...this.tradeOptions };
                    this.tradeOptionsOrigin = { ...tradeOptionsRq };
                    this.tradeManagerError = false;
                    return;
                }
            }
            if (checkFunctionLimitRs !== "00" || !(ServiceHelper.ifSuccess(response, false))) {
                await this.showSweetAlertMessages(checkFunctionLimitRs == '01' ? '本日設定次數已達3次，若有問題請洽客服專線(02)2528-7776' : '設定失敗，若有問題請洽客服專線(02)2528-7776');
                this.tradeOptions = { ...this.tradeOptionsOrigin };
                this.tradeManagerError = false;
                return;
            }
        } catch (error) {
            console.log(error);
        }

    }

    // 交易管理SweetAlert視窗
    public async showSweetAlertMessages(text: string, showConfirmButton: boolean = true) {
        // 確認與聯絡客服按鈕互換位置
        let swal = Swal.fire({
            text: text, confirmButtonText: '聯絡客服',
            showConfirmButton: showConfirmButton,
            showDenyButton: true, denyButtonText: '確定',
            target: '.sweet-alert-target',
            toast: true,
            customClass: {
                container: 'position-absolute',
                htmlContainer: 'text-center',
                actions: 'action-center'
            },
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        // 聯絡客服按鈕
        if ((await swal).isConfirmed)
            this.CallCustomerServer();
    }
    public isApplicationApproved(card: CardStatus2Item) {
        return card?.StatusCode === '4' || card?.StatusCode === '5';
    }
    private IsShowVCardBtn(card: CardStatus2Item) {
        return card.IsVIREAL && !card.IsActivated;
    }
    public IsShowAppleMessge() {
        if (AppHelper.Is_App && this.Is_iOS) {
            // 判斷版本
            const version: Array<number> = [1, 1, 0]; // 版本 1.1.0 以上才顯示 APPLE PAY 加卡 按鈕
            const appVer = new URL(navigator?.userAgent)?.searchParams.get("appVer");

            // 找不到 appVer 或 格式錯誤，則直接不顯示
            if (appVer === null || !isAppVerFormat(appVer)) {
                return false;
            }

            // 不確定未來會不會有 1.2 (兩碼)這種格式，所以由前比到後，數字皆大於等於則顯示按鈕
            const appVerList = appVer.split('.');
            for (let i = 0; i < appVerList.length; i++) {
                if (i >= 3) { // 4碼以上則不繼續做比較
                    break;
                }
                let data = parseInt(appVerList[i]);
                if (isNaN(data) || data < version[i]) {
                    return false;
                }
                else if (data > version[i]) {
                    return true;
                }
            }
            if (appVerList.length === 1) return false;
            return true;
        }
        else {
            return false;
        }
    }

    /** 取得回饋類別項目 */
    private getCardFeedBackItem(card: CardStatus2Item) {
        return this.cardItem.filter((e) => e.CardFaceId.toString() === (card.ProductCode + card.CardFace));
    }

    public IsShowAppleButton(card: CardStatus2Item) {
        // 符合以下情況，不顯示「Apple pay加卡」按鈕
        const [feedBackItem] = this.getCardFeedBackItem(card);
        if (feedBackItem?.FeedBackType == 11 /* 承銷卡 */ ||
            feedBackItem?.FeedBackType == 14 /* 配銷卡 */ ||
            (card.ProductCode + card.CardFace) == '427950') {
            return false;
        }

        if (AppHelper.Is_App && this.Is_iOS && card != undefined && card.CardBrand != "J" && !card.IsDebitCard) {
            // 判斷iphone與Apple Watch加卡狀況
            if (card.IsApplePay_iphone) {
                if (card.IsApplePay_watch || (!card.IsApplePay_watch && AuthHelper.PairedWatch === "N")) {
                    return false;
                }
                return true;
            }
            return true;
        }
        return false;
    }
    private IsApplicationVCard(card: CardStatus2Item) {
        return card?.VCard === '2' || card.IsActivated;
    }
    public async GetCardType(card: CardStatus2Item) {
        // const Dcur = ['213978', '211840', '212392', '238038', '247038', '237038'];
        const typeFace = card.ProductCode + card.CardFace;
        const [feedBackType] = this.cardItem.filter((e) => e.CardFaceId.toString() === typeFace)
        switch (feedBackType?.FeedBackType) {
            case 1:
                return 'dcur'; // 幣倍
            case 2:
                return 'dawho'; // 大戶(金屬卡)
            case 3:
                return 'sport'; // 運動卡
            case 4:
                return 'cash'; //現金回饋卡
            case 5:
                return 'mitsui'; //三井卡
            case 13:
                return 'cars'; //大車隊卡
            case 16:
                return 'daway'; //DAWAY卡
            default:
                return '';
        }
    }
    public cardBundleFlag(card: CardStatus2Item) {
        return !((card?.VIREAL === '1' && card?.IsVCard) || card?.IsActivated || card?.Spac == "2") || card?.XferFlag == "Y" || this.tradeOptions?.BLOCK_ALL == "Y" || this.tradeManagerError;
    }

    public showCardInfoFlag(card: CardStatus2Item) {
        let flag = false;
        if (card?.XferFlag == 'Y' || card?.IsDebitCard) return flag;
        if (card?.MobileFlag !== 'Y') {
            if (card?.VIREAL !== '1' && card?.IsActivated) { // 實體卡：已開卡
                flag = true;
            }
            else if (card?.VIREAL === '1' && card?.VCard === '2') { // 虛實卡：已啟用
                flag = true;
            }
            else if (card?.VIREAL === '1' && card?.VCard === '1' && card?.IsActivated) { // 虛實卡：未啟用+已開卡
                flag = true;
            }
            else if (card?.VIREAL === '1' && card?.VCard === '3' && card?.IsActivated) { // 虛實卡：啟用碼過期+已開卡
                flag = true;
            }
        }
        return flag;
    }

    public async ngOnInit(): Promise<void> {
        this.msgDialoglistening();
        this.getFidoVerifyResult();
        $('.js-ExchangeRecord').hide();
        $('.wrap__pd').hide();
        const Cardno: string = history.state.cardNo;
        this.customerid = AuthHelper.CustomerId;
        let last4No: Array<string> = [];
        const response = await this.memberService.CardStatus2({ ID: this.customerid,  IsIncludeDebitCard:true})
        if (ServiceHelper.ifSuccess(response)) {
            this.Cards = response.Result.Items.filter(item => item.CardTypeCode != "NP"); //API已處理排序 過濾附卡

            if (this.Cards.length !== 0) {
                const feedBackResponse = await this.bonusService.QueryCardFeedbackType({});
                if (ServiceHelper.ifSuccess(response)) {
                    this.cardItem = feedBackResponse.Result.Items;
                }
                for (let i = 0; i < this.Cards.length; i++) {
                    this.Cards[i].showVCardBtn = this.Cards[i].VIREAL === "1" ? this.IsShowVCardBtn(this.Cards[i]) : false;
                    this.Cards[i].IsVCard = this.Cards[i].VIREAL === "1" ? this.IsApplicationVCard(this.Cards[i]) : false;
                    this.Cards[i].cardtype = await this.GetCardType(this.Cards[i]);
                    this.Cards[i].IsApplePay_iphone = false;
                    this.Cards[i].IsApplePay_watch = false;
                    this.Cards[i].ApplePayItem_iphone = { APDevice: "", DANS: "" };
                    this.Cards[i].ApplePayItem_watch = { APDevice: "", DANS: "" };
                    if (this.Cards[i].CardNo) {
                        last4No.push(this.Cards[i].CardNo.slice(this.Cards[i].CardNo.length - 4, this.Cards[i].CardNo.length));
                    }
                    if (Cardno && Cardno === this.Cards[i].CardNo) { this.activeIndex = i; }
                }

                //取此帳號下消費紀錄
                const latestTxResponse = await this.accountService.getLatestTx({ ID: this.customerid, IsIncludeBusinessCard: true })
                if (ServiceHelper.ifSuccess(latestTxResponse)) {
                    //因DebitCard會有外幣，故為利於判斷此處手動加上台幣
                    latestTxResponse.Result.Items?.forEach( e=>e.CurrencyCName = "臺幣");
                    this.AllLatestTxs = latestTxResponse.Result.Items;
                }

                //設定Header名稱
                if(this.Cards.every(X => X.IsDebitCard == true)) {
                    this.app.initHeaderMenu('Debit卡');
                }
                else if(this.Cards.some(X => X.IsDebitCard == true)){
                    this.app.initHeaderMenu('信用卡/Debit卡');
                }
                else {
                    this.app.initHeaderMenu('信用卡');
                }

                //取此帳號下Dabit消費紀錄
                if(this.Cards.some(X => X.IsDebitCard == true)) {
                    const DebitlatestTxResponse = await this.accountService.GetDebitCardLatestTx({ ID: this.customerid })

                    if (ServiceHelper.ifSuccess(DebitlatestTxResponse) && DebitlatestTxResponse.Result.Items?.length > 0) {
                        //將日期變為XXXX/XX/XX格式
                        DebitlatestTxResponse.Result.Items?.forEach( element => element.AuthDate = element.AuthDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1/$2/$3"));
                        //合併兩陣列
                        this.AllLatestTxs =  [...this.AllLatestTxs,...DebitlatestTxResponse.Result.Items];
                    }
                }

                //取此帳號下CawhoPay綁定紀錄
                const StateResponse = await this.paybillService.PaymentToolQuery({ query_type: 'C' })
                if (ServiceHelper.ifSuccess(StateResponse)) {
                    this.paymentTools = StateResponse.Result;
                }
                // await this.ChangeCard(this.activeIndex);
                $('.carousel__outer ul').slick('slickGoTo', this.activeIndex, true);

                //取所有卡片加卡狀態
                if (this.Is_iOS) {
                    const statusData = await this.app.getPassStatus(last4No.join(","));
                    console.log(statusData);
                    if (statusData) {
                        for (let i = 0; i < statusData.length; i++) {
                            if (statusData[i].state < 3) {
                                if (toASCII(statusData[i].device) === "iphone") {
                                    this.Cards.filter(card =>
                                        card.CardNo && card.CardNo.slice(card.CardNo.length - 4, card.CardNo.length) === statusData[i].PANS
                                    ).forEach(card => { card.IsApplePay_iphone = true, card.ApplePayItem_iphone = { DANS: statusData[i].DANS, APDevice: "iPhone" } });
                                }
                                else if (toASCII(statusData[i].device) === "apple watch") {
                                    this.Cards.filter(card =>
                                        card.CardNo && card.CardNo.slice(card.CardNo.length - 4, card.CardNo.length) === statusData[i].PANS
                                    ).forEach(card => { card.IsApplePay_watch = true, card.ApplePayItem_watch = { DANS: statusData[i].DANS, APDevice: "Apple Watch" } });
                                }
                            }
                        }
                    }
                }

                this.dataReady = true;
            }
            else {
                //如果是空的卡片list，導向卡片推薦頁
                const appUrl = location.origin + '/CawhoPay/Card/Recommend';
                window.location.href = appUrl;
            }
            console.log(this.Cards);
        }
        else {
            this.app.showMsgDialog({ id: 'CardNoData', title: '信用卡功能維護中', msg: response.ResultMessage, btnStr: '確定' });
        }

        this.app.addCardFinishCallackEvent.subscribe(event => {
            if (event.data !== undefined) {
                let data: any;
                if (event.data.length > 0) {
                    data = event.data[0];
                }
                else {
                    // 加卡失敗
                    this.app.showMsgDialog({ id: 'addCardFinishCallackEvent', title: '', msg: 'Apple Pay加卡失敗', data: '', btnStr: '確定' });
                }

                if (!(event.action == 0 && (data.state == 0 || data.state == 1 || data.state == 2))) {
                    // 加卡失敗
                    this.app.showMsgDialog({ id: 'addCardFinishCallackEvent', title: '', msg: 'Apple Pay加卡失敗', data: '', btnStr: '確定' });
                }
                else {
                    if (data.state < 3) {
                        // this.changeApplePayStaus(this.activeCard.CardNo);
                        if (toASCII(data.device) === "iphone") {
                            this.activeCard.IsApplePay_iphone = true;
                            this.activeCard.ApplePayItem_iphone = { DANS: data.DANS, APDevice: "iPhone" };
                        }
                        else if (toASCII(data.device) === "apple watch") {
                            this.activeCard.IsApplePay_watch = true;
                            this.activeCard.ApplePayItem_watch = { DANS: data.DANS, APDevice: "Apple Watch" };
                        }
                        this.app.showMsgDialog({ id: 'addCardFinishCallackEvent', title: '', msg: 'Apple Pay加卡成功', data: '', btnStr: '確定' });
                    }
                }
            }
            else {
                // 加卡失敗
                this.app.showMsgDialog({ id: 'addCardFinishCallackEvent', title: '', msg: 'Apple Pay加卡失敗', data: '', btnStr: '確定' });
            }
        })
    }

    public ngAfterViewInit() {
        this.allCards.changes.subscribe(t => {
            this.initSlick();
        })
    }

    /**error msg dialog 監聽 */
    msgDialoglistening() {
        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'CardUnbind' && event.action === 0) {
                this.BindCreditCard();
            }
            if (event.id === 'CardNoData' && event.action === 0) {
                this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
            }
            if (event.id === 'RepeatApply' && event.action === 1) {
                this.CallCustomerServer();
            }
            if (event.id === 'SystemError' && event.action === 1) {
                this.CallCustomerServer();
            }
            if (event.id === 'modifyAddr' && event.action === 1) {
                this.CallCustomerServer();
            }
        });
    }

    private initSlick() {
        $('.carousel__outer ul').slick({
            arrows: false,
            centerMode: true,
            centerPadding: '25%',
        });
        $('.carousel__outer ul').slick('slickGoTo', this.activeIndex, true);
        $('.carousel__outer ul').on('afterChange', async (event, slick, currentSlide) => {
            this.activeIndex = $('.slick-active').data('slick-index');
            await this.ChangeCard(this.activeIndex);
        });
    }

    private async ChangeCard(index: number) {
        this.activeCard = this.Cards[index];
        this.addCardBrandclass(this.activeCard.CardBrand);
        this.queryCardDealSettingInfo()
        if (this.activeCard.IsEmbossed) {
            this.getLatestTx(this.activeCard.CardNo);
            this.getMonthSelect();
            this.monthSelected = this.Months[0].value;
            await this.getbonus(this.Months[0].value, this.activeCard.cardtype);
            this.queryCawhoBindState(this.activeCard.CardNo);
        }
    }

    private addCardBrandclass(brand: string) {
        switch (brand) {
            case 'M':
                this.cardBrand = 'icon--master';
                break;
            case 'V':
                this.cardBrand = 'icon--visa';
                break
            case 'J':
                this.cardBrand = 'icon--jcb';
                break
            default:
                this.cardBrand = '';
                break;
        }
    }

    private getLatestTx(cardNo: string) {
        this.LatestTxs = this.AllLatestTxs
            .filter(item => item.CardNo === cardNo)// 取相同卡號資料
            .sort(function (a, b) {// 組合日期、時間，日期反序
                const aDatetime = Date.parse(b.AuthDate + " " + b.AuthTime);
                const bDatetime = Date.parse(a.AuthDate + " " + a.AuthTime);
                return aDatetime - bDatetime;
            }).slice(0, 2); // 取前兩筆
        this.LatestTxs?.forEach(element => element.AuthAmtView = this.toThousands(element))
        console.log('LatestTxs.length = ' + this.LatestTxs.length);// debug
    }

    public toThousands(item:LatestTxItem) {
        return item.AuthAmtDesc;
    }

    public showTXDetail(tx: LatestTxItem) {
        const text = '<div style="text-align:left;">' +
            '<p>金額：' + tx.AuthAmtView + '</p>' +
            '<p>類別：' + tx.Memo + '</p>' +
            '<p>授權時間：' + tx.AuthDate + ' ' + tx.AuthTime + '</p>' +
            '<p>卡別：' + tx.CardName + '(' + tx.CardLast4 + ')</p>' +
            '<P>消費國家：' + tx.CountryCode + '</p>' +
            '<p>授權結果：' + tx.AuthResult + '</p>' +
            '</div>';
        this.app.showHtmlDialog({ id: 'showTXDetail', title: '最新消費紀錄內容', htmlstr: text, btnOK: '關閉' })
    }

    public showAllTX(Card:CardStatus2Item) {
        GeneralSensorsTrack("ConsumeRecordViewMore",true);
        if(Card.IsDebitCard) {
            var cardLast4 = Card.CardNo.slice(12,16)
            this.router.navigate(['/Account/DebitCard'], {
                state: {
                    cardLast4: cardLast4,
                    cardNo: Card.CardNo
                }
            });
        }
        else {
            // TODO 待確認交易明細是否要加上initHeaderMenu
            //this.app.initHeaderBack('交易明細');
            this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
        }

    }

    // 產生月份下拉清單
    private getMonthSelect() {
        this.Months = [];
        const now = new Date(Date.now());
        for (let index = 0; index < 6; index++) {
            const tmp = new Date(now.getFullYear(), now.getMonth() - index, 1)
            const tmpmonth = tmp.getMonth() < 9 ? '0' + (tmp.getMonth() + 1) : tmp.getMonth() + 1;
            this.Months.push({ Month: tmp.getMonth() + 1 + '月', value: tmp.getFullYear() + tmpmonth.toString() });
        }
    }

    public async getbonus(date: string, cardtype: string) {
        this.bonusFeedback = { Summary:[]};
        this.TPointsbonusFeedback = {Summary:[]};
        this.monthSelected = date;
        switch (cardtype) {
            case 'dcur':
                let dcurFeedback = this.dcurFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (dcurFeedback.length >= 1) {
                    this.bonusFeedback = dcurFeedback[0]?.data;
                }
                else {
                    const dcurResponse = await this.bonusService.QueryDcurFeedback({ ID: this.customerid, period: date });
                    if (ServiceHelper.ifSuccess(dcurResponse)) {
                        let dcur: QueryFeedbackList = { date, data: dcurResponse.Result };
                        this.dcurFeedbackList.push(dcur);
                        this.bonusFeedback = dcurResponse.Result || {};
                    }
                }
                break;
            case 'dawho':
                let dawhoFeedback = this.dawhoFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (dawhoFeedback.length >= 1) {
                    this.bonusFeedback = dawhoFeedback[0]?.data;
                }
                else {
                    const dawhoResponse = await this.bonusService.QueryDawhoFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(dawhoResponse)) {
                        let dawho: QueryFeedbackList = { date, data: dawhoResponse.Result };
                        this.dawhoFeedbackList.push(dawho);
                        this.bonusFeedback = dawhoResponse.Result || {};
                    }
                }
                break;
            case 'sport':
                let sportFeedback = this.sportFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (sportFeedback.length >= 1) {
                    this.bonusFeedback = sportFeedback[0]?.data;
                }
                else {
                    const sportResponse = await this.bonusService.QuerySportFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(sportResponse)) {
                        let sport: QueryFeedbackList = { date, data: sportResponse.Result };
                        this.sportFeedbackList.push(sport);
                        this.bonusFeedback = sportResponse.Result || {};
                    }
                }
                break;
            case 'cash':
                let cashFeedback = this.cashFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (cashFeedback.length >= 1) {
                    this.bonusFeedback = cashFeedback[0]?.data;
                } else {
                    const cashBackResponse = await this.bonusService.QueryCashFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(cashBackResponse)) {
                        let cashBack: QueryFeedbackList = { date, data: cashBackResponse.Result };
                        this.cashFeedbackList.push(cashBack);
                        this.bonusFeedback = cashBackResponse.Result || {};
                    }
                }
                break;
            case 'mitsui':
                let mitsuiFeedback = this.mitsuiFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (mitsuiFeedback.length >= 1) {
                    this.bonusFeedback = mitsuiFeedback[0]?.data;
                } else {
                    const mitsuiResponse = await this.bonusService.QueryMitsuiFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(mitsuiResponse)) {
                        let mitsui: QueryFeedbackList = { date, data: mitsuiResponse.Result };
                        this.mitsuiFeedbackList.push(mitsui);
                        this.bonusFeedback = mitsuiResponse.Result || {};
                    }
                }
                break;
            case 'cars':
                    const carsResponse = await this.bonusService.QueryCarsFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(carsResponse)) {
                        this.TPointsbonusFeedback = carsResponse.Result;
                    }
                break;
            case 'daway':
                let dawayFeedback = this.dawayFeedbackList.filter(p => p.date === date).slice(0, 1);
                if (dawayFeedback.length >= 1) {
                    this.bonusFeedback = dawayFeedback[0]?.data;
                } else {
                    const dawayResponse = await this.bonusService.QueryDawayFeedback({ ID: this.customerid, period: date })
                    if (ServiceHelper.ifSuccess(dawayResponse)) {
                        let daway: QueryFeedbackList = { date, data: dawayResponse.Result };
                        if (daway.data?.DeadLine) {
                            daway.data.DeadLine = daway.data?.DeadLine.replace(/(\d{4})(\d{2})(\d{2})/, "$1/$2/$3");
                        }
                        this.dawayFeedbackList.push(daway);
                        this.bonusFeedback = dawayResponse.Result || {};
                    }
                }
                break;
            default:
                this.bonusFeedback = {Summary:[]};
                this.TPointsbonusFeedback = {Summary:[]};
                break;
        }
    }

    public async onSelectMonth (month: string) {
        const response = await this.bonusService.TPointsRedemptionRecords({ ID: this.customerid, period: month });
		if (response.ResultCode === "00") {
			this.resultModel = response.Result;
            this.resultModel.AvailablePoints = !!this.resultModel.AvailablePoints? this.resultModel.AvailablePoints:0
            $('.js-IsRedeemSpecificChannels').prop("checked", this.resultModel.IsRedeemSpecificChannels);
		}
    }

    public ShowDetail(item: FeedbackSummary) {
        SensorsTrack("CardReportStart", { card_type: this.activeCard?.Name });
        this.pageYOffset = window.pageYOffset;

        this.detailA = null;
        this.detailB = null;
        this.showLinePoints = this.activeCard.cardtype === 'daway' && item?.DESC === '1';

        if (this.bonusFeedback.DetailA && this.bonusFeedback.DetailA.length > 0) {
            this.detailA = this.bonusFeedback.DetailA.filter(p => p.Code === item.Code).shift();
        }

        if (!this.detailA && this.bonusFeedback.DetailB && this.bonusFeedback.DetailB.length > 0) {
            this.detailB = this.bonusFeedback.DetailB.filter(p => p.Code === item.Code).shift();
        }

        if (this.detailA || this.detailB) {
            this.app.initHeaderMenu('回饋報告');
            $('.wrap').hide();
            $('.wrap__pd').show();
            window.scrollTo(0, 0);
        }
        else {
            this.app.showMsgDialog({ id: 'NoData', title: '查無資料', msg: '查無明細資料', btnStr: '確定' });
        }
    }

    public ShowCarsDetail(item: TPointsFeedbackSummary) {
        console.log('ShowCarsDetail()...');
        SensorsTrack("CardReportStart", { card_type: this.activeCard?.Name });
        this.pageYOffset = window.pageYOffset;
        this.detailModel = {
            DetailName: item.Name,
            Details: this.TPointsbonusFeedback.Details.filter(p => p.SummaryID === item.SummaryID)
        };

        if (this.detailModel.Details.length > 0) {
            this.app.initHeaderMenu('回饋報告');
            $('.wrap').hide();
            $('.wrap__pd').show();
            window.scrollTo(0, 0);

        }
        else {
            this.app.showMsgDialog({ id: 'NoData', title: '查無資料', msg: '查無明細資料', btnStr: '確定' });
        }
    }

    onBack() {
        this.detailModel = null;
        this.detailA = null;
        this.detailB = null;
        this.showLinePoints = false;
        this.ExchangeRecordButton = false;
        this.app.initHeaderMenu('信用卡');
        $('.wrap').show();
        $('.wrap__pd').hide();
        window.scrollTo(0, this.pageYOffset);
    }

    async ExchangeRecord() {
        SensorsTrack("CardReportDetail", { card_type: this.activeCard?.Name });
        this.pageYOffset = window.pageYOffset;
        this.detailModel = null;
        this.detailA = null;
        this.detailB = null;
        this.ExchangeRecordButton = true;
        window.scrollTo(0, 0);
        this.app.initHeaderMenu('回饋報告');
            $('.wrap').hide();
            $('.wrap__pd').show();
            window.scrollTo(0, 0);
        await this.onSelectMonth(!!this.monthSelected? this.monthSelected: this.Months[0].value);
        $("#selected2").val(!!this.monthSelected? this.monthSelected: this.Months[0].value).change();

    }

    async ChangeTPointSeting() {
        let confirmText = $('.js-IsRedeemSpecificChannels').prop("checked")? "確定要開啟「折抵信用卡帳單」設定？":"確定要關閉「折抵信用卡帳單」設定？"

        let swal = Swal.fire({
            text: confirmText, title: '提醒訊息', showCancelButton: true, confirmButtonText: '取消', cancelButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });

        if ((await swal).isDismissed)
        {
            SensorsTrack("CardReportRedeem", { card_type: this.activeCard?.Name,
                card_report_redeem: $('.js-IsRedeemSpecificChannels').prop("checked") });

            const response2 = await this.bonusService.TPointsSetting(this.customerid, $('.js-IsRedeemSpecificChannels').prop("checked") );
            if (response2.ResultCode != '00') {
                $('.js-IsRedeemSpecificChannels').prop("checked",!$('.js-IsRedeemSpecificChannels').prop("checked") );
            }
        } else {
            $('.js-IsRedeemSpecificChannels').prop("checked",!$('.js-IsRedeemSpecificChannels').prop("checked") );
        }

	}

    queryCawhoBindState(cardNo: string) {
        this.bindstate = false;
        const card = this.paymentTools.find(x => x.acct_num === cardNo);
        if (card?.bound && (this.activeCard?.IsActivated || (this.activeCard?.VIREAL === '1' && this.activeCard?.IsVCard))) {
            this.bindstate = true;
        }
    }

    public CallCustomerServer() {
        this.app.showCustomerService();
    }

    // Apple Pay加卡
    public async applePayAddCard() {
        const Response = await this.memberService.GetEnglishName({ CARD: this.activeCard.CardNo });
        if (ServiceHelper.ifSuccess(Response) && Response.Result) {
            const result = await this.app.applePayAddCard({ cardHolderName: Response.Result.EName, cardName: this.activeCard.Name, cardNo: this.activeCard.CardNo });
        }
        else {
            // 沒有則先不傳姓名
            const result = await this.app.applePayAddCard({ cardHolderName: '', cardName: this.activeCard.Name, cardNo: this.activeCard.CardNo });
        }
    }

    // public async changeApplePayStaus(CardNo: string) {
    //     const statusData = await this.app.getPassStatus(CardNo.slice(CardNo.length - 4, CardNo.length));
    //     if (statusData) {
    //         for (let i = 0; i < statusData.length; i++) {
    //             if (statusData[i].state < 3) {
    //                 if (toASCII(statusData[i].device) === "iphone") {
    //                     this.Cards.filter(card =>
    //                         card.CardNo && card.CardNo.slice(card.CardNo.length - 4, card.CardNo.length) === statusData[i].PANS
    //                     ).forEach(card => { card.IsApplePay_iphone = true, card.ApplePayItem_iphone = { DANS: statusData[i].DANS, APDevice: "iPhone" } });
    //                 }
    //                 else if (toASCII(statusData[i].device) === "apple watch") {
    //                     this.Cards.filter(card =>
    //                         card.CardNo && card.CardNo.slice(card.CardNo.length - 4, card.CardNo.length) === statusData[i].PANS
    //                     ).forEach(card => { card.IsApplePay_watch = true, card.ApplePayItem_watch = { DANS: statusData[i].DANS, APDevice: "Apple Watch" } });
    //                 }
    //             }
    //         }
    //     }
    // }

    public showMessages(infoType, card?: CardStatus2Item) {
        // this.app.showMsgDialog({ id: 'showBundleInfo', title: 'DACARD APP 卡片綁定', msg: '立即綁定卡片，繳費支付免輸效期，快速又便利', btnStr: '確定' });
        if (infoType == "bundle") {
            this.lightBoxStatus = {
                Title: "DACARD App 卡片綁定",
                Content: "立即綁定卡片，繳費支付免輸效期， 快速又便利",
                IsContentCenter: true,
                LightBoxType: "Info"
            }
        }
        if (infoType == "stopTrade") {
            this.lightBoxStatus = {
                Title: "暫停所有交易",
                Content: "暫停所有交易啟用後，將關閉國內實體交易、國內線上交易、國外實體交易、國外線上交易。",
                IsContentCenter: false,
                LightBoxType: "Info"
            }
        }
        if (infoType == "tradeSetting") {
            if(card.IsDebitCard)
            {
                this.lightBoxStatus = {
                    Title: "卡片管理服務注意事項",
                    LightBoxType: "Notice",
                    NoticeUrl: "assets/htmls/卡片管理服務注意事項.html"
                }
            }
            else
            {
                this.lightBoxStatus = {
                    Title: "交易設定",
                    LightBoxType: "Notice",
                    NoticeUrl: "assets/htmls/信用卡交易設定注意事項.html"
                }
            }
        }

        if (infoType == "cars") {
            this.lightBoxStatus = {
                LightBoxType: "cars"
            }
        }
        this.lightBoxStatus.IsDisplay = true;

    }

    // 跳轉信用卡綁定/解綁 (綁定到OTP驗證；解綁在管理頁直接進行，不需經過OTP)
    public gobundle(event) {
        event.preventDefault();

        // 綁定
        if (event.target.checked) {
            // // 跳轉方法1
            // const options: NavigationExtras = {
            //     queryParams: {
            //         encodeCardno: btoa(this.activeCard.CardNo),
            //         ecnodeExpDate: btoa(this.activeCard.ExpDate),
            //         bindstate: this.bindstate, //反向為取得真實綁定狀態
            //     },
            //     skipLocationChange: true
            // };
            // this.router.navigate(['/Account/CardBundle'], options);

            // 跳轉方法2為App Top 返回按鈕如果吃URL時可使用
            // 跳轉方法2 URL不顯示參數、URL會改變
            GeneralSensorsTrack("DacardAppBinding",true)
            this.router.navigate(['/Account/CardBundle'], {
                state: {
                    encodeCardno: btoa(this.activeCard.CardNo),
                    ecnodeExpDate: btoa(this.activeCard.ExpDate),
                    bindstate: !event.target.checked //反向為取得真實綁定狀態
                }
            });
        }
        // 解綁
        else {
            GeneralSensorsTrack("DacardAppBinding",false)
            this.app.showMsgSelDialog({ id: 'CardUnbind', title: '解除卡片綁定', msg: '下次綁定需要再重新輸入簡訊驗證碼喔', btnOK: '確定解除', btnNO: '取消' });
        }
    }

    private async BindCreditCard() {
        const StateResponse = await this.paybillService.BindCreditCard({
            creditcard_no: btoa(this.activeCard.CardNo),
            expire_date: btoa(this.activeCard.ExpDate),
            bound: !this.bindstate,
            is_default: null
        })

        if (ServiceHelper.ifSuccess(StateResponse)) {
            this.bindstate = !this.bindstate;
            this.paymentTools.filter(card => card.acct_num === this.activeCard.CardNo)
                .forEach(card => { card.bound = this.bindstate });
        }
    }

    // 跳轉開卡頁
    public goCardActivate() {
        GeneralSensorsTrack("EnableCard",true);
        this.router.navigate(['/Application/CardActivate/Sso'], {
            state: {
                cardNo: this.activeCard.CardNo,
                ExpDate: this.activeCard.ExpDate
            }
        });
    }

    // 跳轉啟用頁
    public goCardEnable() {
        SensorsTrack("EnableCardConfirm", { card_type: this.activeCard?.Name });
        this.router.navigate(['/Application/CardEnable/Sso'], {
            state: {
                productCode: this.activeCard.ProductCode,
                cardface: this.activeCard.CardFace
            }
        });
    }

    // 跳轉卡片掛失頁
    public goCardLose() {
        this.router.navigate(['/Application/CardLose'], {
            state: {
                productCode: this.activeCard.ProductCode,
                cardFace: this.activeCard.CardFace,
                cardNo: this.activeCard.CardNo
            }
        });
    }

    /** 取得註冊確認 */
    async getLoginMethod() {
        const LoginData = await this.app.getLoginData();
        this.loginMethod = LoginData.loginMethod;
    }

    // 跳轉卡片資訊頁
    public async goCardInfo() {
        await this.getLoginMethod();
        if (this.loginMethod === 'Fido') {
            this.fidoVerify();
        }else{
            this.lightBoxFido = true;
        }
    }

    /**  跳轉快登設定頁  */
    public goCardSetting() {
        this.app.routeByBillID({ billID: 'D1A12239-C8E3-460F-B6CC-1DC98C8D5149', closeWeb: true });
    }

    // 3D刷卡Fido交易驗證
    public async fidoVerify() {
        this.app.fidoVerify({id:'fidoVerify'});
    }

    /** 取得驗證結果 */
    getFidoVerifyResult() {
        this.app.dataCallackEvent.subscribe((event) => {
            if (event.id === 'fidoVerify') {
                let data = event.data as any;
                data = dataTranslateHelper.dataTranslate(data);
                if (data?.fido_result === "1") {
                    this.zone.run(() =>{
                        this.router.navigate(['/Application/CardInfo'], {
                            state: {
                                CardNo: this.activeCard.CardNo,
                                ExpDate: this.activeCard.ExpDate,
                                CardBrand: this.activeCard.CardBrand,
                                CardName: this.activeCard.Name,
                                CardUrl: this.activeCard.CardFaceURL
                            }
                        });
                    });
                }
            }
        });
    }

    // 跳轉換補發
    async goCardReissue(applyType: string) { //applyType :Loss、Damag
        if (this.activeCard.IsEmbossed && !this.activeCard.IsActivated) {
            this.app.showMsgSelDialog({
                id: 'RepeatApply', title: '已重複申請',
                msg: '此卡7天內已申請過補發卡片，無法重複申請，若有問題請聯繫客服。',
                btnOK: '確定', btnNO: '聯繫客服'
            });
            return;
        }
        if (this.activeCard.AddrMaint !== 'Y') {//沒更動過地址
            if (this.cardReissueService.checkRepeatApply(this.customerid, [{
                ProductCode: this.activeCard.ProductCode,
                CardFace: this.activeCard.CardFace,
                CardNo: this.activeCard.CardNo,
                ExpDate: this.activeCard.ExpDate,
                Name: this.activeCard.Name,
                CardBrand: this.activeCard.CardBrand,
                CardTypeCode: this.activeCard.CardTypeCode,
                CardTypeDesc: this.activeCard.CardTypeDesc,
                CardHolderName: ''
            }], applyType))
                return;
        } else {
            this.app.showMsgSelDialog(
                {
                    id: 'modifyAddr',
                    title: '無法申請補發',
                    msg: '無法進行線上補發，請聯繫客服進行補發卡片申請作業。',
                    btnOK: '取消申請', btnNO: '聯絡客服'
                });
        }
    }

    // 外開連結
    toExternalLink(link: string) {
        location.href = link;
    }

    downloadFile(letterCode) {
        let url = letterCode == "B" || letterCode == "D" ? "https://bank.sinopac.com/MMA8/DocDownload/CPM-207.pdf#open-browser" : "https://bank.sinopac.com/MMA8/DocDownload/CPM-206.pdf#open-browser"
        this.toExternalLink(url)
    }
}

// 是否由數字與 . 組成
function isAppVerFormat(str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) < '0' || str.charAt(i) > '9') {
            if (str.charAt(i) != '.')
                return false;
        }
    }
    return true;
}

// 全形轉半形 & toLowerCase & trim
function toASCII(chars) {
    if (chars !== undefined && chars !== null) {
        chars = chars.trim().toLowerCase();
        var ascii = '';
        for (var i = 0, l = chars.length; i < l; i++) {
            var c = chars[i].charCodeAt(0);
            //只針對半形去轉換
            if (c >= 0xFF00 && c <= 0xFFEF) {
                c = 0xFF & (c + 0x20);
            }
            ascii += String.fromCharCode(c);
        }
        return ascii;
    }
    else {
        return chars;
    }
}


