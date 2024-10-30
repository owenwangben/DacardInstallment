import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SimpleModalService } from 'ngx-simple-modal';
import {
    NoticeDialogComponent,
    urlColor,
} from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { AppWrapper, LoginData } from 'src/app/shared/helpers/app.wrapper';
import { DailyActivityClick, DailyActivityList, DailyActivityLogin, DailyActivityResult, DailyRightClick } from 'src/app/shared/services/sensorsdata';
import { PocActivityRs } from 'src/app/shared/services/sinopac/poc.model';
import {
    GetActivityItem,
    GetActivityRq,
} from 'src/app/shared/services/sinopac/register.models';
import { RegisterService } from 'src/app/shared/services/sinopac/register.service';
import { RightMessage } from 'src/app/shared/services/sinopac/shared.model';
import {
    AuthHelper,
    AuthService,
    ServiceHelper,
} from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-daily-activity',
    templateUrl: './daily-activity.component.html',
    styleUrls: ['./daily-activity.component.scss'],
})
export class DailyActivityComponent implements OnInit {
    private readonly app = new AppWrapper();
    // 取得綁定資料
    public loginData: LoginData = {} as LoginData;
    // 是否是卡戶
    public customCard: boolean;
    // 是否是存戶
    public customAcct: boolean;
    // 頁籤狀態 true:左, false:右
    public tab: boolean = true;
    // 今日日期 yyyy-MM-dd
    public today: string = new Date().toISOString().split('T')[0];
    // 前後兩個禮拜共五個禮拜 35天的日期
    public dateArray: string[] = [];
    // 選擇的日期 dateArray index
    public dateIndex: number = 0;
    // 顯示日期文字
    public dateDisplay: string = '';
    // API回傳的活動資料
    public activityDBList: GetActivityItem[] = [];
    // API回傳的活動資料(符合條件and條件)
    public activityDBShowList: GetActivityItem[] = [];
    // 靜態檔活動資料
    public activityList: PocActivityRs[] = [] as PocActivityRs[];
    // 靜態檔活動資料(符合日期and條件)
    public activityShowList: PocActivityRs[] = [] as PocActivityRs[];
    // API活動讀取完成
    public dbActivityLoadFinish: boolean = false;
    // 靜態檔活動讀取完成
    public pocActivityLoadFinish: boolean = false;
    // 靜態檔活動燈箱狀態
    public pocActivityLightBox: boolean = false;
    // API活動燈箱狀態
    public dbActivityResultLightBox: boolean = false;
    // 靜態檔活動燈箱內容
    public pocActivityLightBoxContent: PocActivityRs = {} as PocActivityRs;
    // 登錄按鈕狀態
    public canSign: boolean = true;
    // 登錄結果 標題
    public Title: string = '';
    // 登錄結果 lightbox ID
    public lightboxID: string = '';
    // 登錄結果 內文
    public text: string = '';
    // 返回按鈕文字
    public dbActivityResultLightBoxButtonOnetext: string = '';
    // 身分證字號
    public idNumber: string = '';
    // 是否為MMA會員且有卡
    public memberWithCard: boolean = false;
    // 登入狀態
    public isLogin: boolean = false;
    // 權益優惠banner
    public rightMessage: RightMessage = {
        imageUrl: 'assets/images/demo/0立即辦卡.png',
        logTitleOne: '還不是卡友?',
        logTitleTwo: '立即申辦信用卡!',
        buttonMsg: '立即辦卡',
    };

    constructor(
        private registerService: RegisterService,
        private modalService: SimpleModalService,
        private datePipe: DatePipe,
        private router: Router,
        private authService: AuthService,
    ) {
    }

    public async ngOnInit(): Promise<void> {
        this.app.initHeaderBackWithCustomerService('當日活動');
        $('body').removeClass().addClass('card-discount');
        window.scroll(0, 0);
        //取APP會員狀態
        this.loginData = await this.app.getLoginData();
        AuthHelper.AppToken = this.loginData.token || '';
        ServiceHelper.SessionId = (await this.app.getDeviceUUID()) || '';
        AuthHelper.PairedWatch =
            Number(this.loginData.paired_watch) === 1 ? 'Y' : 'N';

        this.dbActivityLoadFinish = await this.getAndSortDbActivityList();
        this.pocActivityLoadFinish = await this.getAndSortPocActivityList();

        //未綁定的 IOS的usertype=None時 安卓會是空值
        if (
            this.loginData.userType === null ||
            this.loginData.userType?.trim() === ''
        ) {
            this.loginData.userType = 'None';
        }
        //身分判斷依據this.LoginData.has_sinopac_acct及has_sinopac_card，IOS回應0/1，安卓回應true/false
        if (
            this.loginData.has_sinopac_acct === '0' ||
            this.loginData.has_sinopac_acct === false
        ) {
            this.customAcct = false;
        }
        if (
            this.loginData.has_sinopac_acct === '1' ||
            this.loginData.has_sinopac_acct === true
        ) {
            this.customAcct = true;
        }
        if (
            this.loginData.has_sinopac_card === '0' ||
            this.loginData.has_sinopac_card === false
        ) {
            this.customCard = false;
        }
        if (
            this.loginData.has_sinopac_card === '1' ||
            this.loginData.has_sinopac_card === true
        ) {
            this.customCard = true;
        }

        // 這是用來本機開發可以測試各種身分別
        // this.loginData.userType = 'MMA';
        // this.customCard = true;
        // this.customAcct = false;

        //已綁定(網銀會員)無存有卡
        if (
            this.loginData.userType === 'MMA' &&
            !this.customAcct &&
            this.customCard
        ) {
            this.memberWithCard = true;
        }
        //已綁定(網銀會員)有存有卡
        if (
            this.loginData.userType === 'MMA' &&
            this.customAcct &&
            this.customCard
        ) {
            this.memberWithCard = true;
        }

        //已綁定(網銀會員)有卡
        if (this.memberWithCard) {
            this.isLogin = await this.app.isLogin();
            if (this.isLogin) {
                await this.getID();
            }
        }

        if (history.state.selectDate) {
            this.dateIndex = this.dateArray.findIndex(
                (date) => date === history.state.selectDate
            );
        } else {
            this.dateIndex = this.dateArray.findIndex(
                (date) => date === this.today
            );
        }
        this.setDate();
        await this.filterTheDateActivity();
    }

    // 切換下一個日期
    public nextDate(): void {
        if (this.dateIndex < this.dateArray.length - 1) {
            this.dateIndex++;
            this.setDate();
            this.filterTheDateActivity();
        }
    }

    // 切換上一個日期
    public previousDay(): void {
        if (this.dateIndex > 0) {
            this.dateIndex--;
            this.setDate();
            this.filterTheDateActivity();
        }
    }

    // 設定標題日期
    public setDate(): void {
        const currentDate: Date = new Date(this.dateArray[this.dateIndex]);
        const weekDay = ['日', '一', '二', '三', '四', '五', '六'][
            currentDate.getDay()
        ];
        this.dateDisplay =
            this.dateArray[this.dateIndex].replace(/-/g, '/') + ` (${weekDay})`;
    }

    // 轉換API回傳當天日期
    public setTodayTime(date: Date) {
        this.today = this.datePipe.transform(date, 'yyyy/MM/dd');
    }

    // 因應切板問題，Destroy時body tag需改回card_manage
    public ngOnDestroy(): void {
        $('body').removeClass().addClass('card_manage');
    }

    // Tab切換
    public changeTab(tab: boolean): void {
        this.tab = tab;
    }

    // 導轉卡片推薦頁
    public toCardRecommend(): void {
        //神測埋點
        const { logTitleOne, logTitleTwo, buttonMsg } = this.rightMessage;
        const date = this.dateArray[this.dateIndex].replace(/-/g, '/');
        DailyRightClick('DailyRightClick', logTitleOne, logTitleTwo, buttonMsg, date);
        const appUrl = location.origin + '/CawhoPay/Card/Recommend';
        window.location.href = appUrl;
    }

    // 產出包含當個星期+前後兩個星期的日期，共五個星期 35天
    public generateDateArray(): string[] {
        const currentDate = new Date(this.today);
        const dateArray: string[] = [];
        for (let i = -14; i < 21; i++) {
            const currentDateCopy = new Date(currentDate);
            currentDateCopy.setDate(
                currentDate.getDate() - new Date(this.today).getDay() + i
            );
            dateArray.push(currentDateCopy.toISOString().split('T')[0]);
        }
        return dateArray;
    }

    // 取得API活動資料及排序
    public async getAndSortDbActivityList(): Promise<boolean> {
        // 目前不用傳入ID
        const response = await this.registerService.GetActivity(
            {} as GetActivityRq
        );
        if (ServiceHelper.ifSuccess(response, false)) {
            this.setTodayTime(response.Header.ResponseTime);
            this.activityDBList = response.Result.Items.sort((a, b) => {
                return (
                    new Date(a.RegisterBeginTime).getTime() -
                    new Date(b.RegisterEndTime).getTime()
                );
            });
            this.dateArray = this.generateDateArray();
        } else {
            Swal.fire({
                text: response?.ResultMessage,
                icon: 'error',
                confirmButtonText: '確定',
                showClass: {
                    popup: 'animate__animated animate__fadeIn animate__faster',
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut animate__faster',
                },
            });
        }
        return true;
    }

    // 取得靜態檔活動資料及排序(尚未串POC)
    public async getAndSortPocActivityList(): Promise<boolean> {
        this.activityList = window['activity_list'] as PocActivityRs[];
        this.activityList.sort((a, b) => {
            if (a.SortOrder !== b.SortOrder) {
                return a.SortOrder - b.SortOrder; // 按 order 排序
            } else {
                return (
                    new Date(a.CreateTime).getTime() -
                    new Date(b.CreateTime).getTime()
                );
            }
        });
        return true;
    }

    // 只顯示當日資料
    public async filterTheDateActivity(): Promise<void> {
        this.activityShowList = this.activityList.filter(
            (item) =>
                new Date(this.today).getTime() >=
                new Date(item.DisplayPeriodS).getTime() &&
                new Date(this.today).getTime() <=
                new Date(item.DisplayPeriodE).getTime() &&
                new Date(this.dateArray[this.dateIndex]).getTime() >=
                new Date(item.StartTime).getTime() &&
                new Date(this.dateArray[this.dateIndex]).getTime() <=
                new Date(item.EndTime).getTime() &&
                item.ShowCalendar
        );
        if (this.activityShowList.length) {
            const compareDate = new Date(this.dateArray[this.dateIndex]);
            const todayYear = compareDate.getFullYear();
            const todayMonth = compareDate.getMonth();
            const todayDate = compareDate.getDate();

            this.activityShowList.sort((a, b) => {
                const startTimeA = new Date(a.StartTime);
                const startTimeB = new Date(b.StartTime);

                // 提取YYYY/MM/DD部分
                const aStartIsToday = startTimeA.getFullYear() === todayYear &&
                    startTimeA.getMonth() === todayMonth &&
                    startTimeA.getDate() === todayDate;
                const bStartIsToday = startTimeB.getFullYear() === todayYear &&
                    startTimeB.getMonth() === todayMonth &&
                    startTimeB.getDate() === todayDate;

                if (aStartIsToday && !bStartIsToday) return -1;
                if (!aStartIsToday && bStartIsToday) return 1;

                // 比較SortOrder
                if (a.SortOrder !== b.SortOrder) return a.SortOrder - b.SortOrder;

                // 比較CreateTime
                const createTimeA = new Date(a.CreateTime).getTime();
                const createTimeB = new Date(b.CreateTime).getTime();
                return createTimeA - createTimeB;
            });
        }
        this.activityDBShowList = this.activityDBList.filter(
            (item) =>
                new Date(item.RegisterBeginTime).toDateString() ===
                new Date(this.dateArray[this.dateIndex]).toDateString()
        );
        if (this.activityDBList.length) {
            //時間排序，由先到後
            this.activityDBList.sort((a, b) => {
                return new Date(a.RegisterBeginTime).getTime() - new Date(b.RegisterBeginTime).getTime()
            });
        }
    }

    // 顯示靜態檔燈箱資料
    public showPocActivityLightBox(item: PocActivityRs): void {
        //神測埋點
        const { TextOne, TextTwo } = item;
        const date = this.dateArray[this.dateIndex].replace(/-/g, '/');
        DailyActivityClick('DailyActivityClick', TextOne, TextTwo, date);
        this.pocActivityLightBox = true;
        this.pocActivityLightBoxContent = item;
    }

    // 注意事項同意條款
    public async showPrecautions(item: GetActivityItem): Promise<void> {
        //神測埋點
        const { Title, Code } = item;
        const date = this.dateArray[this.dateIndex].replace(/-/g, '/');
        DailyActivityList('DailyActivityList', Title, Code, date);
        if (!this.memberWithCard) {
            this.toRegisterPage();
            return;
        }

        if (!this.isLogin) {
            let isLogin = await this.app.checkLogin();
            if (!isLogin) return;
            else this.isLogin = isLogin;
        }

        if (!this.idNumber) {
            await this.getID();
        }

        if (this.idNumber) {
            const agree = await this.modalService
                .addModal(NoticeDialogComponent, {
                    Title: '永豐銀行活動登錄注意事項',
                    Source: 'CAWHO',
                    NoticeMatter: '永豐銀行活動登錄注意事項',
                    NoticeContent:
                        '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                    color: urlColor.None,
                })
                .toPromise();
            if (agree) {
                //神測埋點
                DailyActivityLogin('DailyActivityLogin', Title, Code, date);
                await this.SignActivity(item);
            }
        }
    }

    // 外開活動頁面
    public SignUrl(url: string): void {
        location.href = url + '#open-browser';
    }

    // 登錄活動
    public async SignActivity(item: GetActivityItem): Promise<void> {
        if (this.canSign) {
            this.canSign = false;
            // 設定2秒後把canSign改為true，讓使用者可以再次點擊「搶登錄」按鈕
            const timer = setTimeout(() => {
                this.canSign = true;
            }, 2000);

            try {
                const response = await this.registerService.SignActivity({
                    ID: this.idNumber,
                    Code: item.Code,
                    Verify_Method: this.loginData.userType,
                    RegisterBeginTime: item.RegisterBeginTime,
                    RegisterEndTime: item.RegisterEndTime,
                });
                const daytimenow = this.datePipe.transform(
                    response.Header.ResponseTime,
                    'yyyy/MM/dd HH:mm:ss'
                );
                const { Title, Code } = item;
                const date = this.dateArray[this.dateIndex].replace(/-/g, '/');
                if (ServiceHelper.ifSuccess(response, false)) {
                    //神測埋點
                    DailyActivityResult('DailyActivityResult', true, Title, Code, date, Number(response.Result.Seq), '');
                    //燈箱資訊設定
                    this.Title = '登錄成功';
                    this.text =
                        '<p>恭喜您成為第' +
                        response.Result.Seq +
                        '位幸運大咖</p>' +
                        '<p><span class="fw-b">登錄活動：</span><span>' +
                        item.Title +
                        '</span></p>' +
                        '<p> <span class="fw-b">登錄時間：</span><span>' +
                        daytimenow +
                        '</span></p>';
                    this.lightboxID = 'SignActivitySuc';
                    this.dbActivityResultLightBoxButtonOnetext = '查看更多活動';
                } else {
                    //神測埋點
                    DailyActivityResult('DailyActivityResult', false, Title, Code, date, 0, response.ResultMessage);
                    //燈箱資訊設定
                    this.Title = '登錄失敗';
                    this.text =
                        '<p><span class="fw-b">登錄活動：</span><span>' +
                        item.Title +
                        '</span></p>' +
                        '<p><span class="fw-b">失敗時間：</span><span>' +
                        daytimenow +
                        '</span></p>' +
                        '<p> <span class="fw-b">失敗原因：</span><span>' +
                        response.ResultMessage +
                        '</span></p>';
                    this.lightboxID = 'SignActivitySfail';
                    this.dbActivityResultLightBoxButtonOnetext = '返回活動列表';
                }
            } catch (error) {
                let errorText = '系統發生錯誤，請稍後再試！';
                let daytimenow = this.datePipe.transform(
                    new Date(this.today),
                    'yyyy/MM/dd HH:mm:ss'
                );
                if (error.status === 403) {
                    // 活動不在可登錄時間
                    [errorText, daytimenow] = error.error.split('|');
                }

                this.Title = '登錄失敗';
                this.text =
                    '<p><span class="fw-b">登錄活動：</span><span>' +
                    item.Title +
                    '</span></p>' +
                    '<p><span class="fw-b">失敗時間：</span><span>' +
                    daytimenow +
                    '</span></p>' +
                    '<p> <span class="fw-b">失敗原因：</span><span>' +
                    errorText +
                    '</span></p>';
                this.lightboxID = 'SignActivitySfail';
                this.dbActivityResultLightBoxButtonOnetext = '返回活動列表';
            }
            this.dbActivityResultLightBox = true;
            clearTimeout(timer);
            this.canSign = true;
            return;
        }
    }

    // 導活動登錄頁
    public toRegisterPage(): void {
        if (this.memberWithCard) {
            this.router.navigate(['/Activity/Register'], {
                state: {
                    functionName: '已登錄',
                },
            });
        } else {
            this.router.navigate(['/Activity/Register']);
        }
    }

    // 取得ID
    public async getID(): Promise<void> {
        //利用Token取得ID
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
                //取得ID
                this.idNumber = AuthHelper.CustomerId;
            }
        } else {
            this.app.showMsgDialog({
                id: 'dailyActivity',
                title: '發生錯誤',
                msg: '無法取得AppToken',
            });
        }
    }

    // 導轉信用卡優惠頁 or 活動登錄頁
    public toRegisterOrBenefitsPage(): void {
        if (this.tab) {
            this.router.navigate(['/Account/CardBenefits'], { fragment: 'ChoiceActivity' });
        } else {
            this.router.navigate(['/Activity/Register']);
        }
    }

    public routeByBillID() {
        //活動登錄
        this.app.routeByBillID({
            billID: '8c71f111-a97c-43c1-9990-8cd46094affc',
            closeWeb: true,
        });
    }
}
