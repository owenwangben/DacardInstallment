import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { QueryAirportPickupRs, QueryAirportVIPServiceRs, QueryRoadsideAssistanceRs } from 'src/app/shared/services/sinopac/register.models';
import {
    AuthHelper,
    AuthService,
    RegisterService,
    ServiceHelper,
} from 'src/app/shared/shared.module';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

enum SelectOption {
    Rights = '卡友權益',
    RewardPoints = '紅利點數',
    GoldBee = '金Bee',
    DacardMission = '大咖任務',
    FonPoint = '活動登錄',
    SwitchUser = '切換使用者',
    ServiceDescription = '服務說明',
}

enum SelectOptionE {
    Rights = 'Rights',
    RewardPoints = 'Point',
    GoldBee = 'Goldbee',
    DacardMission = 'Mission',
    FonPoint = 'Activity',
    SwitchUser = 'User',
    ServiceDescription = 'Description',
}

/** 視窗確認按鈕事件用 */
enum DialogEventType {
    /** 未登入要求使用者登入 */
    NotLogin = 'NotLogin',
    /** 網銀會員升級 */
    Upgrade = 'Upgrade',
    /** 網銀會員升級 */
    Recommend = 'Recommend',
    /** 旅行綜合平安險 前往投保專區 */
    Insurance = 'insurance',
    /** 機場接送服務 立即預約 */
    AirportReserve = 'AirportReserve',
    /** 機場接送服務 查詢服務內容 */
    AirportService = 'AirportService',
    /** 貴賓室 尋找貴賓室 */
    VipReserve = 'VipReserve',
    /** 貴賓室 查詢貴賓室資訊 */
    VipService = 'VipService',
    /** 道路救援 撥打預約電話 */
    RescueRegister = 'RescueRegister',
    /** 外圍停車 查看優惠內容 */
    ParkingService = 'ParkingService',
}

/** 權益項目內容 */
export interface EquityItems {
    /** 標題 */
    title: string;
    /** 備註 */
    remark?: string;
    /** 內容 */
    content: string;
    /** 活動時期間 */
    time: string;
    /** 項目預設排序順序 (打開的Dialog會使用到index當作key對應) */
    index: number;
    /** 是否符合資格 (如果apiStatus = false 讀取失敗要顯示不符合資格的內容) */
    coincidence: boolean;
    /** API讀取資料是否正常 (影響顯示的項目:資格與次數)*/
    apiStatus?: boolean;
}

export interface DialogModel {
    /** 視窗標題 */
    title?: string;
    /** 視窗事件類型 */
    eventType?: DialogEventType;
    /** 內容 */
    content?: string;
    /** 是否顯示視窗 */
    show?: boolean;
    /** 確認按鈕 名稱 */
    confirm?: string;
    /** 取消按鈕 名稱 */
    cancel?: string;
    /** 是否達標(用於判斷觸發不同事件)*/
    coincidence?: boolean;
}

@Component({
    selector: 'app-right',
    templateUrl: './right.component.html',
    styleUrls: ['./right.component.scss'],
})
export class RightComponent implements OnInit {
    private readonly app = new AppWrapper();
    selectOption = [];
    selectOptionC: string;
    SelectOptionE = SelectOptionE;
    selectOptionNow: string;
    /** 權益項目list */
    equityItems: Array<EquityItems> = [];
    /** 會員判別用 視窗 */
    memberCheckDialog: DialogModel = {};
    /** 權益條款用 視窗 */
    equityTerms: DialogModel = {};
    /** 活動開始日 */
    startDate: string;
    /** 活動結束日 */
    endDate: string;
    /** 道路救援API狀態 */
    rescueAPISucc: boolean = false;
    /** 貴賓室API狀態 */
    vipAPISucc: boolean = false;
    /** 機場接送API狀態 */
    airportAPISucc: boolean = false;
    /** 外圍停車API狀態 */
    parkingAPISucc: boolean = false;
    public show: boolean = !environment.openRightsFunction;
    /** 機場接送資料 */
    AirportPickupData: QueryAirportPickupRs;
    /** 道路救援 */
    RoadsideAssistanceData: QueryRoadsideAssistanceRs;
    /** 機場貴賓室資格查詢資料 */
    AirportVIPServiceData: QueryAirportVIPServiceRs;
    /** api錯誤計數 */
    apiErrorCnt: number = 0;

    constructor(
        private authService: AuthService,
        private registerService: RegisterService,) { }

    ngOnInit(): void {
        window.scroll(0, 0);
        this.app.initHeaderBackWithCustomerService('卡友權益');

        this.optionSet();
        this.memberData();
        if (this.show) {
            this.openLightbox();
        }
    }

    optionSet() {
        this.selectOption = [
            {
                id: SelectOptionE.Rights,
                name: SelectOption.Rights,
            },
            {
                id: SelectOptionE.DacardMission,
                name: SelectOption.DacardMission,
            },
            {
                id: SelectOptionE.GoldBee,
                name: SelectOption.GoldBee,
            },
            {
                id: SelectOptionE.FonPoint,
                name: SelectOption.FonPoint,
            },
            {
                id: SelectOptionE.RewardPoints,
                name: SelectOption.RewardPoints,
            },
        ];
        this.selectOptionC = this.selectOption[0].name;
        this.selectOptionNow = this.selectOption[0].id;
    }

    /**取APP會員狀態 */
    async memberData() {
        //取APP會員狀態
        let LoginData = await this.app.getLoginData();
        AuthHelper.AppToken = LoginData.token || '';
        ServiceHelper.SessionId = (await this.app.getDeviceUUID()) || '';
        AuthHelper.PairedWatch =
            Number(LoginData.paired_watch) === 1 ? 'Y' : 'N';
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if (LoginData.userType === null || LoginData.userType?.trim() === '') {
            LoginData.userType = 'None';
        }
        /** 是否是卡戶 */
        let customCard: boolean;
        /** 是否是存戶 */
        let customAcct: boolean;
        //身分判斷依據this.LoginData.has_sinopac_acct及has_sinopac_card，IOS回應0/1，安卓回應true/false
        if (
            LoginData.has_sinopac_acct === '0' ||
            LoginData.has_sinopac_acct === false
        ) {
            customAcct = false;
        }
        if (
            LoginData.has_sinopac_acct === '1' ||
            LoginData.has_sinopac_acct === true
        ) {
            customAcct = true;
        }
        if (
            LoginData.has_sinopac_card === '0' ||
            LoginData.has_sinopac_card === false
        ) {
            customCard = false;
        }
        if (
            LoginData.has_sinopac_card === '1' ||
            LoginData.has_sinopac_card === true
        ) {
            customCard = true;
        }

        //網銀會員且有卡-取得customID
        if (LoginData.userType === 'MMA' && !!customCard) {
            if (AuthHelper.AppToken) {
                const response = await this.authService.verifyToken({
                    AppToken: AuthHelper.AppToken,
                    WebToken: AuthHelper.WebToken,
                });
                if (ServiceHelper.ifSuccess(response)) {
                    AuthHelper.storeAuthData({
                        Token: response.Result.NewToken,
                        TokenExpiredAt: response.Result.TokenExpiredAt,
                        CustomerId: response.Result.CustomerId,
                    });
                }
            } else {
                this.app.showMsgDialog({
                    id: 'AuthGuard',
                    title: '發生錯誤',
                    msg: '無法取得AppToken',
                });
            }
        }
        //已綁定(網銀會員)
        if (LoginData.userType === 'MMA') {
            if (!customCard) {
                this.lightboxRecommend();
            }
        }
        //已綁定(電支會員)
        if (LoginData.userType === 'PayMember') {
            if (!customCard) {
                this.lightboxRecommend();
            } else {
                this.lightboxUpgrade();
            }
        }
        //未綁定
        if (LoginData.userType === 'None') {
            this.lightboxLogin();
        }
        await this.setEquityItems();
    }

    lightboxLogin() {
        this.memberCheckDialog = {
            title: '登入查看權益',
            content:
                '若您為永豐銀行信用卡客戶，使用永豐銀行網銀會員登入即可查詢專屬權益!',
            eventType: DialogEventType.NotLogin,
            show: true,
            confirm: '立即登入',
            cancel: '沒有永豐信用卡?',
        };
    }

    lightboxUpgrade() {
        this.memberCheckDialog = {
            title: '快速升等查看權益',
            content: '您是永豐銀行信用卡客戶，立即升級網銀會員，查看專屬禮遇!',
            eventType: DialogEventType.Upgrade,
            show: true,
            confirm: '升等網銀會員',
            cancel: '取消',
        };
    }

    lightboxRecommend() {
        this.memberCheckDialog = {
            title: '手刀辦卡享權益',
            content: '持有永豐銀行指定信用卡享有專屬禮遇，大咖手刀帶你去辦卡!',
            eventType: DialogEventType.Recommend,
            show: true,
            confirm: '推薦信用卡',
            cancel: '查看卡友服務',
        };
    }

    lightboxBtn(bool) {
        if (this.memberCheckDialog.eventType === DialogEventType.NotLogin) {
            bool
                ? this.routeByBillID(SelectOptionE.SwitchUser)
                : this.cardRecommend();
        }
        if (this.memberCheckDialog.eventType === DialogEventType.Upgrade) {
            bool
                ? this.routeByBillID(SelectOptionE.ServiceDescription)
                : this.exitWeb();
        }
        if (this.memberCheckDialog.eventType === DialogEventType.Recommend) {
            bool ? this.cardRecommend() : this.memoinfo();
        }
    }

    selectchange(event) {
        this.selectOptionNow = event.target.value;
        this.selectOptionC = this.selectOption.find(
            (x) => x.id === event.target.value
        )?.name;
        this.routeByBillID(event.target.value);
    }

    routeByBillID(type) {
        switch (type) {
            case SelectOptionE.DacardMission: //大咖任務
                return this.app.routeByBillID({
                    billID: 'ae645995-1744-45f2-9a9a-77610942d7ed',
                    closeWeb: true,
                });
            case SelectOptionE.GoldBee: //金Bee點數
                return this.app.routeByBillID({
                    billID: '94a3722b-1faa-4376-8691-36d844cb4c8e',
                    closeWeb: true,
                });
            case SelectOptionE.FonPoint: //活動登錄
                return this.app.routeByBillID({
                    billID: '8c71f111-a97c-43c1-9990-8cd46094affc',
                    closeWeb: true,
                });
            case SelectOptionE.RewardPoints: //紅利點數
                return this.app.routeByBillID({
                    billID: 'd28582a9-aa6f-49ae-bf1e-ac33c13ea292',
                    closeWeb: true,
                });
            case SelectOptionE.SwitchUser: //切換使用者
                return this.app.routeByBillID({
                    billID: '39F8DED8-F8E9-4D09-B68E-EA1D5466777D',
                    closeWeb: true,
                });
            case SelectOptionE.ServiceDescription: //服務說明
                return this.app.routeByBillID({
                    billID: '45A0340B-D11F-4A20-B7BC-BB709D1DFA81',
                    closeWeb: true,
                });
            default:
                return '';
        }
    }

    memoinfo() {
        window.open(
            'https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/list.html#open-browser',
            '_blank'
        );
    }

    exitWeb() {
        this.app.exitWeb();
    }

    //卡片推薦頁
    cardRecommend() {
        const appUrl = location.origin + '/CawhoPay/Card/Recommend';
        window.location.href = appUrl;
    }

    /** 權益項目Dialog顯示內容 */
    openDetailDialog(index: number, coincidence: boolean) {
        switch (index) {
            case 0: //旅行綜合平安險
                this.equityTerms = {
                    title: '旅行綜合平安險',
                    content: `<ul class="lightbox__listUl lightbox__listUl--decimal black">
                    <li><a class="fc-gold underline" href="https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/travel.html#open-browser" target="_blank" rel="noopener noreferrer">詳情請見權益說明網頁</a>
                    <li>不論是國內外旅遊或洽公，只要您以永豐銀行信用卡或簽帳金融卡，於出發前支付被保險人(持卡本人及其家屬)之公共運輸交通工具全部費用或80%以上旅遊團費，且於發生理賠時信用卡也是有效卡，即可享有旅遊險相關保險內容。
                    </li>
                    </ul>`,
                    show: true,
                    confirm: '更多投保項目',
                    cancel: '下次再說',
                    eventType: DialogEventType.Insurance,
                };
                break;
            case 2: //機場接送
                this.equityTerms = {
                    title: '國際機場接/送機服務',
                    content: `<ul class="lightbox__listUl lightbox__listUl--decimal black">
                    <li><a class="fc-gold underline" href="https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/airport-pickup.html#open-browser" target="_blank" rel="noopener noreferrer">詳情請見權益說明網頁</a>
                    <li>適用期間:2024年1月1日至12月31日止</li>
                    <li>預約方式：
                      <ul class="lightbox__listUl lightbox__listUl--disc">
                        <li>請透過網路進行預約：<a class="fc-gold underline" href="https://www.youfirst.com.tw/event/sinopac/airport#open-browser" target="_blank" rel="noopener noreferrer">https://www.youfirst.com.tw/event/sinopac/airport</a>，透過網路預約可額外獲得紅利點數500點</li>
                        <li>撥打24 小時「機場接送服務預約專線」0800-825-588/ (04) 2206-6379，無額外贈送紅利點數。</li>
                      </ul>
                    </li>
                    <li>使用機場接送服務之客戶，請於使用日前完成機團費消費，並於刷卡消費3個工作天後且於90天內進行預約，非於前述期間，或預約不符合資格者，恕無法使用本服務。</li>
                    <li>持卡人須於使用日前五個工作天(係指週一至週五及補行上班之週六08:30-17:30)前完成預約程序，如使用日遇行政院人事行政局規定之連續假期及春節，則需七個工作日前完成預約。</li>
                    </ul>`,
                    show: true,
                    coincidence: coincidence,
                    confirm: coincidence ? '立即預約' : '查詢服務內容',
                    cancel: '下次再說',
                    eventType: DialogEventType.AirportService,
                };
                break;
            case 3: //貴賓室
                this.equityTerms = {
                    title: '國際機場貴賓室服務',
                    content: `<ul class="lightbox__listUl lightbox__listUl--decimal black">
                    <li><a class="fc-gold underline" href="https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/airport-vip.html#open-browser" target="_blank" rel="noopener noreferrer">詳情請見權益說明網頁</a></li>
                    <li>服務期間：2024/1/1~2024/12/31</li>
                    <li>使用資格：使用時須持有適用本服務之有效信用卡並符合下述使用說明
                      <ul class="lightbox__listUl lightbox__listUl--disc">
                        <li><p>【永傳世界卡/永富世界卡】</p><p>持有有效之永傳世界卡或永富世界卡，即可申請「龍騰卡電子票卡」。</p></li>
                        <li><p>【永豐財富無限卡、世界卡、幣倍卡、美安聯名卡】</p>
                        <p>前一年度享機場貴賓室權益之指定卡片（永豐財富無限卡、世界卡、幣倍卡、美安聯名卡）正、附卡合計累積一般消費達NT$30萬(含)以上方可申請「龍騰卡電子票卡」。</p>
                        <p>（例如︰客戶持有卡片一般消費，永豐財富無限卡10萬元、世界卡10萬元、幣倍卡5萬元、美安聯名卡5萬元，合計為30萬元）</p></li>
                      </ul>
                    </li>
                    <li>免費次數條件：正、附卡合併計算免費使用次數，倘違反使用規定、使用超出免費次數、未符合使用條件、攜帶同行貴賓使用，為自費使用，將於持卡人信用卡帳單收取每位每次NT$900費用。</li>
                    <li>申請方式：
                      <ul class="lightbox__listUl lightbox__listUl--disc">
                        <li>請於使用龍騰卡機場貴賓室/機場餐廳前三個工作天申請「龍騰卡電子票卡」，每位適用對象限核發一張「龍騰卡電子票卡」且限本人使用，申請時須符合使用資格且持有適用本優惠之有效信用卡。
                            <a class="fc-gold underline" href="https://www.dragonpass.com.tw/sinopac/#open-browser"" target="_blank" rel="noopener noreferrer">龍騰出行電子票卡教學說明</a>
                        </li>
                        <li>「龍騰卡電子票卡」有效期限為1年，到期後如需使用請重新申請，申請時須符合當時之使用資格。</li>
                        <li>符合使用資格之持卡人可持本人之「龍騰卡電子票卡」使用此卡配合之機場貴賓室/機場餐廳。</li>
                      </ul>
                    </li>
                    </ul>`,
                    show: true,
                    confirm: coincidence ? '尋找貴賓室' : '查詢貴賓室資訊',
                    cancel: '下次再說',
                    eventType: DialogEventType.VipService,
                };
                break;
            case 1: //機場外圍停車
                this.equityTerms = {
                    title: '機場外圍停車',
                    content: `<ul class="lightbox__listUl lightbox__listUl--decimal black">
                    <li><a class="fc-gold underline" href="https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/airport-parking.html#open-browser" target="_blank" rel="noopener noreferrer">詳情請見權益說明網頁</a></li>
                    <li>活動期間：2024/1/1-2024/12/31</li>
                    <li>服務專線：0800-058-888 / (02)2528-7776</li>
                    <li>服務對象：永豐銀行無限卡、商務世界卡、世界卡、御璽卡、鈦金卡、晶緻卡、白金卡、簽帳金融卡之正/附卡持卡人。</li>
                    <li>使用資格：限持卡本人使用，並於當次出國前90天內且消費店家已完成請款入帳者，以永豐銀行無限卡、商務世界卡、世界卡、御璽卡、鈦金卡、晶緻卡、白金卡、簽帳金融卡刷卡支付本人當次出國機票全額或80%以上國外旅遊團費者，且前述資格需單筆達NT$20,000以上(永傳世界卡、永富世界卡為單筆達NT$15,000以上)。</li>
                    <li>使用方式：請於刷卡後90天內至配合停車場以當次消費之有效實體信用卡或簽帳金融卡進/出場停車場過卡確認並使用完畢；使用期限為2024/1/1-12/31，逾期失效不得再使用(詳閱使用須知)。</br>貼心提醒！各停車場車位有限，停滿為止。建議提早確認停車場狀況再評估是否開車前往，或可規劃其他往返機場方式。</li>
                    </ul>`,
                    show: true,
                    confirm: '查詢使用資格',
                    cancel: '下次再說',
                    eventType: DialogEventType.ParkingService,
                };
                break;
            case 4: //道路救援
                this.equityTerms = {
                    title: '道路救援',
                    content: `<ul class="lightbox__listUl lightbox__listUl--decimal black">
                    <li><a class="fc-gold underline" href="https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/rescue.html#open-browser" target="_blank" rel="noopener noreferrer">詳情請見權益說明網頁</a>
                    <li>活動期間：2024/1/1~2024/12/31</li>
                    <li>請事先至全鋒道路救援官網 www.24tms.com.tw 選擇道路救援權益登錄項目，並依指示完成登錄</li>
                    <li>實際道路救援服務使用，須透過免付費電話0800-020-050 申請</li>
                  </ul>`,
                    show: true,
                    confirm: coincidence ? '車號登錄' : '撥打服務電話',
                    cancel: '下次再說',
                    eventType: DialogEventType.RescueRegister,
                };
                break;
        }
    }

    /** 權益項目Dialog按鈕事件 */
    detailDialogEvent(event: DialogEventType, coincidence: boolean) {
        switch (event) {
            case DialogEventType.Insurance: //旅行綜合平安險 前往投保專區
                window.open('https://mma.sinopac.com/Insurance/#open-browser', '_blank');
                break;
            case DialogEventType.AirportReserve: //機場接送服務 立即預約
                window.open(
                    'https://www.youfirst.com.tw/event/sinopac/airport#open-browser',
                    '_blank'
                );
                break;
            case DialogEventType.AirportService: //機場接送服務 查詢服務內容，外開功能需加上#open-browser
                if (coincidence) {
                    window.open('https://www.youfirst.com.tw/event/sinopac/airport/#open-browser', '_blank');
                } else {
                    window.open('https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/airport-pickup.html#open-browser', '_blank');
                }
                break;
            case DialogEventType.RescueRegister: //道路救援 車號登錄，外開功能需加上#open-browser
                document.location.href = "tel:0800020050"
                break;
            case DialogEventType.ParkingService: //外圍停車 查詢使用資格，外開功能需加上#open-browser
                window.open('https://bank.sinopac.com/sinopacBT/personal/credit-card/card-right/airport-parking.html#open-browser', '_blank');
                break;
            case DialogEventType.VipReserve: //貴賓室 尋找貴賓室，外開功能需加上#open-browser
                window.open('https://www.prioritypass.com/zh-TW#open-browser', '_blank');
                break;
            case DialogEventType.VipService: //貴賓室 查詢貴賓室資訊，外開功能需加上#open-browser
                window.open('https://www.dragonpass.com.tw/sinopac/#open-browser', '_blank');
                break;
        }
    }

    /** 取得、排序權益項目 */
    async setEquityItems() {
        await this.getQueryAirportPickupData();
        await this.getRoadsideAssistanceData();
        await this.getQueryAirportVIPServiceData();

        //活動期間 取當年1/1~ 12/31
        this.startDate = dayjs().startOf('year').format('YYYY/MM/DD');
        this.endDate = dayjs().endOf('year').format('YYYY/MM/DD');
        const period = this.startDate.concat('-', this.endDate);
        this.equityItems = [
            {
                title: '旅行綜合平安險',
                content: `<h4 class="fs-sm fc-gray-100">旅遊刷永豐卡，享高額旅平險及不便險保障，讓您及家人出遊超安心！</h4>`,
                time: period,
                index: 0,
                coincidence: true,
            },
            {
                title: '機場外圍停車',
                content: `<h4 class="fs-sm fc-gray-100">指定卡別使用前90天消費指定項目滿額且消費店家已完成請款入帳者，享有桃園/小港國際機場外圍停車服務優惠</h4>`,
                time: period,
                index: 1,
                coincidence: true,
            },
            {
                title: '國際機場接/送機服務',
                remark: this.AirportPickupData?.LASTUSED_NUM > 0 ? `今年度可使用總次數 ${this.AirportPickupData?.LASTUSED_NUM} 次` : '未符合',
                content: `<h4 class="fs-sm fc-gray-100">持指定卡別且前一年度消費滿額享國際機場接送服務</h4>`,
                time: period,
                index: 2,
                coincidence: this.AirportPickupData?.LASTUSED_NUM > 0,
                apiStatus: this.AirportPickupData ? true : false
            },
            {
                title: '國際機場貴賓室服務',
                remark: this.AirportVIPServiceData?.CanusedCNT > 0 ? `今年度${this.AirportVIPServiceData?.CardName}最高可使用${this.AirportVIPServiceData?.CanusedCNT}次其餘卡別詳見說明` : '未符合',
                content: `<h4 class="fs-sm fc-gray-100">持指定卡別且前一年度消費滿額享全球機場貴賓室專屬禮遇</h4>`,
                time: period,
                index: 3,
                coincidence: this.AirportVIPServiceData?.CanusedCNT > 0,
                apiStatus: this.AirportVIPServiceData ? true : false
            },
            {
                title: '道路救援',
                remark: this.RoadsideAssistanceData?.CNT === '不限' ? '今年度可使用總次數不限' : this.RoadsideAssistanceData?.CNT?.trim() !== '0' ? '今年度可使用總次數 3 次' : '未符合',
                content: `<h4 class="fs-sm fc-gray-100">指定卡別客戶完成事先登錄且達消費門檻，尊享全年無休24hr道路救援服務</h4>`,
                time: period,
                index: 4,
                coincidence: this.RoadsideAssistanceData?.CNT?.trim() !== '0',
                apiStatus: this.RoadsideAssistanceData ? true : false
            },
        ];

        //以下這是動態排序，依照coincidence = true排在前面且依照index的順序來排。不需要可移除(變成自己固定排序)
        this.equityItems.sort((a, b) => {
            // 首先按照 coincidence 属性排序，true 的在前面
            if (a.coincidence && !b.coincidence) {
                return -1;
            } else {
                if (!a.coincidence && b.coincidence) {
                    return 1;
                } else {
                    // 如果 coincidence 属性相同，再按照 index 属性排序
                    return a.index - b.index;
                }
            }
        });
    }

    /** 阻擋功能視窗用 */
    close() {
        this.apiErrorCnt = 0;
    }

    openLightbox() {
        document.body.classList.add('rewardPointRecord-non');
        this.show = true;
    }

    /** 道路救援資格查詢 */
    async getRoadsideAssistanceData() {
        try {
            const response = await this.registerService.QueryRoadsideAssistance({ ID: AuthHelper.CustomerId })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.RoadsideAssistanceData = response.Result;
            } else {
                this.apiErrorCnt++;
                return;
            }
        } catch {
            this.apiErrorCnt++;
        }
    }

    /** 機場接送資格查詢 */
    async getQueryAirportPickupData() {
        try {
            const response = await this.registerService.QueryAirportPickup({ ID: AuthHelper.CustomerId })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.AirportPickupData = response.Result;
            } else {
                this.apiErrorCnt++;
                return;
            }
        } catch {
            this.apiErrorCnt++;
        }
    }

    /** 機場貴賓室資格查詢 */
    async getQueryAirportVIPServiceData() {
        try {
            const response = await this.registerService.QueryAirportVIPService({ ID: AuthHelper.CustomerId })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.AirportVIPServiceData = response.Result;
            } else {
                this.apiErrorCnt++;
                return;
            }
        } catch {
            this.apiErrorCnt++;
        }
    }
}
