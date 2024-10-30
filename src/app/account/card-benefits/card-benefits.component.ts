import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppWrapper, LoginData } from 'src/app/shared/helpers/app.wrapper';
import { RegisterService, ServiceHelper } from 'src/app/shared/shared.module';
import {
    PocCalendarItems,
    PocCalendarItem,
    PocActivityRs,
    PocBannerList,
    BannerContent,
} from 'src/app/shared/services/sinopac/poc.model';
import {
    ActivityItem,
    RightMessage,
} from 'src/app/shared/services/sinopac/shared.model';
import {
    GetActivityItem,
    GetActivityRq,
} from 'src/app/shared/services/sinopac/register.models';
import { ActivityClick, BannerClick, BannerShow, RightClick, RightShow } from 'src/app/shared/services/sensorsdata';
import Swal from 'sweetalert2';
import { ErrCode, RecommendBannerHeader, RecommendBannerParam, RecommendBannerRq } from 'src/app/shared/sensorstracker';
import { SensorsService } from 'src/app/shared/services/sensors.service';
import { DatePipe } from '@angular/common';
declare var sensors: any;

@Component({
    selector: 'app-card-benefits',
    templateUrl: './card-benefits.component.html',
    styleUrls: ['./card-benefits.component.scss'],
})
export class CardBenefitsComponent implements OnInit {
    private readonly app = new AppWrapper();
    @ViewChildren('calendar') calendar: QueryList<any>;
    @ViewChildren('banner') banner: QueryList<any>;
    @ViewChildren('activity') activity: QueryList<any>;
    // 所有活動List
    public activityList: PocActivityRs[] = [] as PocActivityRs[];
    // 顯示的活動List
    public activityShowList: PocActivityRs[] = [] as PocActivityRs[];
    // Banner list
    public bannerList: PocBannerList[] = [] as PocBannerList[];
    // Banner list 預設值
    public defaultBannerList: PocBannerList[] = [{
        Section_id: '',
        Priority: 0,
        Strategy_id: '',
        Strategy_name: '',
        Rec_frame_site: 0,
        Log_id: '',
        Sf_plan_strategy_id: '',
        Material_type: '',
        data: {
            ActivityName: '預設banner',
            Title: '刷卡享優惠',
            Subtitle: '聰明消費品生活，天天刷出心幸福！',
            Style: 'linen',
            Image: 'mma8/card/images/dacard/banner/defaultbanner.png',
            Link: 'https://bank.sinopac.com/sinopacBT/personal/credit-card/discount/list.html'
        }
    }];
    // 今天日期
    public today: string = new Date().toISOString().split('T')[0];
    // 活動顯示的行事曆規格
    public activityCalendar: PocCalendarItems[] = [] as PocCalendarItems[];
    // 今天的星期index ex.0:星期日,1:星期一,2:星期二,...
    public dayOfWeek = new Date(this.today).getDay();
    // 權益優惠banner，已綁且有卡則五組隨機顯示
    public rightMessage: RightMessage = {
        imageUrl: 'assets/images/demo/0立即辦卡.png',
        logTitleOne: '還不是卡友?',
        logTitleTwo: '立即申辦信用卡!',
        buttonMsg: '立即辦卡',
    };
    // 登入資訊
    public loginData: LoginData = {} as LoginData;
    // 有卡無卡
    public customCard: boolean = false;
    // 進行中活動勾選狀態
    public activityInProgress: boolean = false;
    // 行事曆讀取完成
    public calendarLoadFinish: boolean = false;
    // 活動讀取完成
    public activityLoadFinish: boolean = false;
    // 單次點擊更多活動顯示的活動數量 showItemOnce * showMoreItemCount
    public showItemOnce: number = 10;
    // API回傳的活動資料
    public activityDBList: GetActivityItem[] = [] as GetActivityItem[];
    // 燈箱顯示狀態
    public lightBoxStatus: boolean = false;
    // 活動分類欄
    public navList: ActivityItem[] = [
        {
            navTitle: '熱門活動',
            navImage: 'assets/images/icon/icon-hot.svg',
            active: false,
            showMoreItemCount: 1,
        },
        {
            navTitle: '旅遊交通',
            navImage: 'assets/images/icon/icon-plane.svg',
            active: false,
            showMoreItemCount: 1,
        },
        {
            navTitle: '網購3C',
            navImage: 'assets/images/icon/icon-cart.svg',
            active: false,
            showMoreItemCount: 1,
        },
        {
            navTitle: '量販生活',
            navImage: 'assets/images/icon/icon-store.svg',
            active: false,
            showMoreItemCount: 1,
        },
        {
            navTitle: '百貨美食',
            navImage: 'assets/images/icon/icon-dining.svg',
            active: false,
            showMoreItemCount: 1,
        },
        // {
        //     navTitle: '繳費支付',
        //     navImage: 'assets/images/icon/icon-coin-gold.svg',
        //     active: false,
        //     showMoreItemCount: 1,
        // },
        {
            navTitle: '卡友服務',
            navImage: 'assets/images/icon/icon-two-cards.svg',
            active: false,
            showMoreItemCount: 1,
        },
        // {
        //     navTitle: '新戶活動',
        //     navImage: 'assets/images/icon/icon-user.svg',
        //     active: false,
        //     showMoreItemCount: 1,
        // },
        {
            navTitle: '其他優惠',
            navImage: 'assets/images/icon/icon-gift-gold.svg',
            active: false,
            showMoreItemCount: 1,
        },
    ] as ActivityItem[];
    // 燈箱顯示活動項目
    public lightBoxItem: PocActivityRs = {} as PocActivityRs;
    // 神策用參數
    Material_type: string = '輪播圖';
    constructor(
        private router: Router,
        private registerService: RegisterService,
        private activatedRoute: ActivatedRoute,
        private sensorsService: SensorsService,
        private datePipe: DatePipe
    ) { }

    public async ngOnInit(): Promise<void> {
        this.app.initHeaderMenu('信用卡');
        $('body').removeClass().addClass('card-discount');
        window.scroll(0, 0);
        this.loginData = await this.app.getLoginData();
        await this.getActivityList();

        //未綁定的 IOS的usertype=None時 安卓會是空值
        if (
            this.loginData.userType === null ||
            this.loginData.userType?.trim() === ''
        ) {
            //未綁定
            this.loginData.userType = 'None';
        }
        //身分判斷依據has_sinopac_card，IOS回應0/1，安卓回應true/false
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
        this.activityLoadFinish = await this.getAndSortActivityList();
        await this.getAndFilterAndSortBannerList();
        this.calendarLoadFinish =
            await this.convertToActivityCalendar_Enhance();
        // 效能測試 convertToActivityCalendar -> convertToActivityCalendar_Enhance 速度提升90%左右
        // const times:number[] = [];
        // const count = 100;
        // for (let index = 0; index < count; index++) {
        //     const start = performance.now();
        //     this.calendarLoadFinish = await this.convertToActivityCalendar();
        //     const end = performance.now();
        //     const time = end - start;
        //     times.push(time);
        //     console.log(`第${index+1}次：${time} 毫秒`)
        // }
        // const average1 = times.reduce((acc, curr) => acc + curr, 0) / count;
        // times.length = 0;
        // for (let index = 0; index < count; index++) {
        //     const start = performance.now();
        //     this.calendarLoadFinish = await this.convertToActivityCalendar_Enhance();
        //     const end = performance.now();
        //     const time = end - start;
        //     times.push(time);
        //     console.log(`第${index+1}次：${time} 毫秒`)
        // }
        // const average2 = times.reduce((acc, curr) => acc + curr, 0) / count;
        // console.log(`convertToActivityCalendar運行${count}次，平均：${average1} 毫秒`);
        // console.log(`convertToActivityCalendarTest運行${count}次，平均：${average2} 毫秒`);
        // console.log(`時間縮減${100 - ((average2 / average1) * 100)}%`);
        await this.changeNav(0);
        this.getRightMessage();
        const { logTitleOne, logTitleTwo, buttonMsg } = this.rightMessage;
        //神測埋點
        RightShow('RightShow', logTitleOne, logTitleTwo, buttonMsg);

        this.activatedRoute.fragment.subscribe((fragment: string | null) => {
            if (fragment) {
                this.scrollToFragment(fragment);
            }
        });
    }

    scrollToFragment(section: string | null) {
        if (section) {
            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 切版提供的carousel
    private initScrollTop(): void {
        //- 滾動到精選活動列表的tab時，讓該tab固定在頁面頂端
        $(window).off('scroll');
        $('#top').hide();
        let scrollTab = $('.scroll-tab');
        scrollTab.removeClass('fixed');
        $('.filter').removeClass('pt-lg-3');
        let scrollTabOffset = scrollTab.offset().top;
        let noticeOffset = $('.notice').offset().top;
        const fn = (): void => {
            let scrollTop = $(window).scrollTop();
            if (scrollTop > scrollTabOffset) {
                scrollTab.addClass('fixed');
                $('.filter').addClass('pt-lg-3');
                $('#top').fadeIn('fast');
            } else {
                scrollTab.removeClass('fixed');
                $('.filter').removeClass('pt-lg-3');
            }
            //- 頁首按鈕
            // 接近頂部100px隱藏top按鈕
            if (scrollTop < 50) {
                $('#top').fadeOut('fast');
            }
            if (scrollTop + $(window).height() > noticeOffset) {
                $('#top').addClass('absolute');
            } else {
                $('#top').removeClass('absolute');
            }
        };
        fn();
        $(window).scroll(fn);
        $('#top').click(function () {
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            //- $("#top").hide();
        });
    }

    // 切版提供的carousel
    private initBannerSlick(): void {
        $('.banner--slide ul').slick({
            arrows: false,
            dots: true,
            autoplay: true,
            autoplaySpeed: 5000,
            centerMode: true,
            //- 讓左右未active的slider露出來一點點
            centerPadding: '10px',
            slidesToShow: 1,
            slidesToScroll: 1,
        }).on('afterChange', (event, slick, idx) => {
            this.getBannerItem(idx)
        });
        //手動觸發初始化第一項
        this.getBannerItem(0);
    }

    // 切版提供的carousel
    private initCalendarSlick(): void {
        $('.banner--calendar .week').off('afterChange');
        $('.banner--calendar .week').slick({
            arrows: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            //- 讓slider的初始位置在今天這周
            initialSlide: 2,
            infinite: false,
        });

        const fn = (): void => {
            let $activeUl = $('.banner--calendar .week ul.slick-active');
            let monthNumber =
                ' ' + $activeUl.find('li:last-child .month').text();
            $('#month').text(monthNumber);
        };
        fn();

        $('.banner--calendar .week').on('afterChange', fn);
    }

    public ngAfterViewInit(): void {
        this.banner.changes.subscribe((t) => {
            this.initBannerSlick();
            this.initScrollTop();
        });
        this.calendar.changes.subscribe((t) => {
            this.initCalendarSlick();
            this.initScrollTop();
        });
        this.activity.changes.subscribe((t) => {
            this.initScrollTop();
        });
    }

    // 因應切板問題，Destroy時body tag需改回card_manage
    public ngOnDestroy(): void {
        $('body').removeClass().addClass('card_manage');
    }

    // 取得API活動資料
    public async getActivityList(): Promise<void> {
        //目前不用傳入ID
        const response = await this.registerService.GetActivity(
            {} as GetActivityRq
        );
        if (ServiceHelper.ifSuccess(response, false)) {
            this.activityDBList = response.Result.Items;
            this.setTodayTime(response.Header.ResponseTime);
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
    }

    // 轉換API回傳當天日期
    public setTodayTime(date: Date) {
        this.today = this.datePipe.transform(date, 'yyyy/MM/dd');
        this.dayOfWeek = new Date(this.today).getDay();
    }

    // 產出包含當個星期+前後兩個星期的日期，共五個星期 35天
    public generateDateArray(): string[] {
        const currentDate = new Date(this.today);
        const dateArray: string[] = [];
        for (let i = -14; i < 21; i++) {
            const currentDateCopy = new Date(currentDate);
            currentDateCopy.setDate(currentDate.getDate() - this.dayOfWeek + i);
            dateArray.push(currentDateCopy.toISOString().split('T')[0]);
        }
        return dateArray;
    }

    // 確認日期對應的星期
    public checkDateWeek(dateObj: Date, currentDate: Date): string {
        const diffInDays = Math.floor(
            (dateObj.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
        );
        let week = '';
        if (diffInDays >= -14 && diffInDays < -7) {
            week = 'beforeLastWeek';
        } else if (diffInDays >= -7 && diffInDays < 0) {
            week = 'lastWeek';
        } else if (diffInDays >= 0 && diffInDays < 7) {
            week = 'thisWeek';
        } else if (diffInDays >= 7 && diffInDays < 14) {
            week = 'nextWeek';
        } else if (diffInDays >= 14 && diffInDays < 21) {
            week = 'afterNextWeek';
        }
        return week;
    }

    // 產生行事曆單日項目
    public createNewItem(
        date: Date,
        anyAcivityBeginToday: boolean
    ): PocCalendarItem {
        const weekDay = ['日', '一', '二', '三', '四', '五', '六'][
            date.getDay()
        ];
        const isToday =
            date.toDateString() === new Date(this.today).toDateString();
        return {
            weekDay: weekDay,
            month: (date.getMonth() + 1).toString(),
            date: date.getDate().toString(),
            isToday: isToday,
            anyAcivityBeginToday: anyAcivityBeginToday,
            fullDate: date.toISOString().split('T')[0],
        } as PocCalendarItem;
    }

    // public async convertToActivityCalendar(): Promise<boolean> {
    //     const weeks: { [key: string]: PocCalendarItem[] } = {
    //         beforeLastWeek: [],
    //         lastWeek: [],
    //         thisWeek: [],
    //         nextWeek: [],
    //         afterNextWeek: [],
    //     };
    //     const dateArray: string[] = this.generateDateArray();
    //     dateArray.forEach((item) => {
    //         const pocData = this.activityList.filter(
    //             (t) =>
    //                 new Date(item).toDateString() ===
    //                 new Date(t.StartTime).toDateString()
    //         );
    //         const dbData = this.activityDBList.filter(
    //             (t) =>
    //                 new Date(item).toDateString() ===
    //                 new Date(t.RegisterBeginTime).toDateString()
    //         );
    //         const dateObj = new Date(item);
    //         const currentDate = new Date(this.today);
    //         currentDate.setDate(currentDate.getDate() - this.dayOfWeek);
    //         let week = this.checkDateWeek(dateObj, currentDate);
    //         if (week) {
    //             let anyAcivityBeginToday = this.checkAnyActivityStartToday(
    //                 dateObj,
    //                 pocData,
    //                 dbData
    //             );
    //             weeks[week].push(
    //                 this.createNewItem(dateObj, anyAcivityBeginToday)
    //             );
    //         }
    //     });

    //     // 轉換星期物件為輸出格式
    //     Object.keys(weeks).forEach((week) => {
    //         this.activityCalendar.push({
    //             week: week,
    //             item: weeks[week],
    //         });
    //     });
    //     return this.activityCalendar.length > 0;
    // }

    // public checkAnyActivityStartToday(
    //     date: Date,
    //     pocData: PocActivityRs[],
    //     dbData: GetActivityItem[]
    // ): boolean {
    //     let pocActivityStartToday =
    //         pocData?.some(
    //             (t) =>
    //                 date.toDateString() ===
    //                     new Date(t.StartTime).toDateString() &&
    //                 new Date(this.today).getTime() >=
    //                     new Date(t.DisplayPeriodS).getTime() &&
    //                 new Date(this.today).getTime() <=
    //                     new Date(t.DisplayPeriodE).getTime() &&
    //                 t.ShowCalendar
    //         ) || false;
    //     let dbActivityStartToday =
    //         dbData?.some(
    //             (t) =>
    //                 date.toDateString() ===
    //                     new Date(t.RegisterBeginTime).toDateString() &&
    //                 new Date(t.RegisterBeginTime).getTime() <=
    //                     new Date(this.today).getTime() &&
    //                 new Date(t.RegisterEndTime).getTime() >=
    //                     new Date(this.today).getTime()
    //         ) || false;
    //     return pocActivityStartToday || dbActivityStartToday;
    // }

    // 活動資料轉換行事曆 + 條件判斷
    public async convertToActivityCalendar_Enhance(): Promise<boolean> {
        const weeks: { [key: string]: PocCalendarItem[] } = {
            beforeLastWeek: [],
            lastWeek: [],
            thisWeek: [],
            nextWeek: [],
            afterNextWeek: [],
        };
        const dateArray: string[] = this.generateDateArray();

        const pocData = this.activityList.reduce((acc, curr) => {
            const date = new Date(curr.StartTime).toDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                StartTime: curr.StartTime,
                DisplayPeriodS: curr.DisplayPeriodS,
                DisplayPeriodE: curr.DisplayPeriodE,
                ShowCalendar: curr.ShowCalendar,
            } as PocActivityRs);
            return acc;
        }, {} as { [key: string]: PocActivityRs[] });
        const dbData = this.activityDBList.reduce((acc, curr) => {
            const date = new Date(curr.RegisterBeginTime).toDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                RegisterBeginTime: curr.RegisterBeginTime,
                RegisterEndTime: curr.RegisterEndTime,
            } as GetActivityItem);
            return acc;
        }, {} as { [key: string]: GetActivityItem[] });
        dateArray.forEach((item) => {
            let pdata = pocData[new Date(item).toDateString()];
            let ddata = dbData[new Date(item).toDateString()];
            const dateObj = new Date(item);
            const currentDate = new Date(this.today);
            currentDate.setDate(currentDate.getDate() - this.dayOfWeek);
            let week = this.checkDateWeek(dateObj, currentDate);
            if (week) {
                let anyAcivityBeginToday =
                    this.checkAnyActivityStartTheDay_Enhance(
                        dateObj,
                        pdata,
                        ddata
                    );
                weeks[week].push(
                    this.createNewItem(dateObj, anyAcivityBeginToday)
                );
            }
        });

        // 轉換星期物件為輸出格式
        Object.keys(weeks).forEach((week) => {
            this.activityCalendar.push({
                week: week,
                item: weeks[week],
            });
        });
        return this.activityCalendar.length > 0;
    }

    // 確認活動開始日為當天
    public checkAnyActivityStartTheDay_Enhance(
        date: Date,
        pocData: PocActivityRs[],
        dbData: GetActivityItem[]
    ): boolean {
        let pocActivityStartToday =
            pocData?.length > 0
                ? pocData.some(
                    (t) =>
                        date.toDateString() ===
                        new Date(t.StartTime).toDateString() &&
                        new Date(this.today).getTime() >=
                        new Date(t.DisplayPeriodS).getTime() &&
                        new Date(this.today).getTime() <=
                        new Date(t.DisplayPeriodE).getTime() &&
                        t.ShowCalendar
                ) || false
                : false;
        let dbActivityStartToday =
            dbData?.length > 0
                ? dbData.some(
                    (t) =>
                        date.toDateString() ===
                        new Date(t.RegisterBeginTime).toDateString() &&
                        new Date(t.RegisterBeginTime).getTime() <=
                        new Date(this.today).getTime() &&
                        new Date(t.RegisterEndTime).getTime() >=
                        new Date(this.today).getTime()
                ) || false
                : false;
        return pocActivityStartToday || dbActivityStartToday;
    }

    // 導卡片推薦頁or卡友權益頁
    public toRightPage(): void {
        const { logTitleOne, logTitleTwo, buttonMsg } = this.rightMessage;
        if (this.checkMemberType()) {
            const appUrl = location.origin + '/CawhoPay/Card/Recommend';
            //神測埋點
            RightClick('RightClick', logTitleOne, logTitleTwo, buttonMsg, appUrl);
            window.location.href = appUrl;
        } else {
            //神測埋點
            RightClick('RightClick', logTitleOne, logTitleTwo, buttonMsg, location.origin + '/Activity/Right');
            this.router.navigate(['/Activity/Right']);
        }
    }

    // 導活動登錄頁
    public toRegisterPage(): void {
        this.router.navigate(['/Activity/Register']);
    }

    // 權益優惠banner隨機顯示訊息
    public getRightMessage(): void {
        if (this.checkMemberType()) return;
        const message: RightMessage[] = [
            {
                imageUrl: 'assets/images/demo/airportTransfer.png',
                logTitleOne: '刷機票、團費，',
                logTitleTwo: '享機場接送機服務！',
                buttonMsg: '查詢次數',
            },
            {
                imageUrl: 'assets/images/demo/travelInsurance.png',
                logTitleOne: '旅遊刷卡，享高額',
                logTitleTwo: '旅平險及不便險保障 ',
                buttonMsg: '立即查看',
            },
            {
                imageUrl: 'assets/images/demo/offAirportParking.png',
                logTitleOne: '桃園、小港機場，',
                logTitleTwo: '外圍免費停車服務',
                buttonMsg: '立即查看',
            },
            {
                imageUrl: 'assets/images/demo/airportLounge.png',
                logTitleOne: '刷機票、團費，',
                logTitleTwo: '享國際機場貴賓室',
                buttonMsg: '立即查看',
            },
            {
                imageUrl: 'assets/images/demo/roadsideAssistance.png',
                logTitleOne: '全年無休 ',
                logTitleTwo: '24hr道路救援服務',
                buttonMsg: '查詢次數',
            },
        ];
        this.rightMessage = message[Math.floor(Math.random() * message.length)];
    }

    // 確認會員狀態是否為未綁定or無卡
    public checkMemberType(): boolean {
        return this.loginData.userType === 'None' || this.customCard === false;
    }

    // 切換navbar
    public async changeNav(index: number): Promise<void> {
        this.navList.forEach((item) => (item.active = false));
        this.navList[index].active = true;
        this.navList[index].showMoreItemCount = 1;
        this.showMoreItem();
    }

    // 取得靜態檔活動資料及排序(尚未串POC)
    public async getAndSortActivityList(): Promise<boolean> {
        let activityList = window['activity_list'] as PocActivityRs[];
        this.activityList = activityList
            .filter((item) => this.isActivityStartInPeriod(item))
            .sort((a, b) => {
                if (a.SortOrder !== b.SortOrder) {
                    return a.SortOrder - b.SortOrder; // 按 order 排序
                } else {
                    return (
                        new Date(a.CreateTime).getTime() -
                        new Date(b.CreateTime).getTime()
                    ); // 按 createTime 排序
                }
            });
        return true;
    }

    // 取得靜態檔banner資料過濾和排序
    public async getAndFilterAndSortBannerList(): Promise<void> {
        try {
            const distinct_id = sensors.store.getDistinctId();
            //const distinct_id = '12345';

            const param = window['site_config'].advPlatformParam;
            const header: RecommendBannerHeader = {
                ['project-name']: param.projectName,
            };
            const params: RecommendBannerParam = {
                org_id: param.orgID,
                access_token: param.accessToken,
            };
            const body: RecommendBannerRq = {
                distinct_id: distinct_id, // sensors.store.getDistinctId(); 取得
                section_id: param.sectionID,
                log_id: param.logID,
                need_sticky_item: true,
            };
            const response = await this.sensorsService.GetPOCBannerData(body, header, params);
            if (response.status === 200) {
                const res = response.body;
                if (res.errcode === ErrCode.Success) {
                    const data = res.data;

                    this.bannerList = [];
                    let list: PocBannerList[] = [];
                    data.items.forEach((items) => {
                        const material_properties = items.material_properties;

                        let bannerData: BannerContent[] = [];
                        Object.keys(material_properties).forEach(key => {
                            if (!key.startsWith('iframe')) {
                                const value = material_properties[key];
                                if (value) {
                                    try {
                                        let parsedValue = JSON.parse(value);
                                        const ActivityTime = parsedValue?.activity_time.split('-');
                                        bannerData.push({
                                            ActivityName: parsedValue?.activity_name,
                                            Subtitle: parsedValue?.subtitle,
                                            Title: parsedValue?.title,
                                            Style: parsedValue?.type,
                                            Link: parsedValue?.link,
                                            Image: parsedValue?.image,
                                            ActivityTimeS: ActivityTime[0],
                                            ActivityTimeE: ActivityTime[1],
                                        });
                                    }
                                    catch (e) { console.log(e); }
                                }
                            }
                        })

                        bannerData.forEach(x => {
                            list.push({
                                Section_id: data.section_id,
                                Priority: items.priority,
                                Strategy_id: items.strategy_id,
                                Strategy_name: items.strategy_name,
                                Rec_frame_site: items.rec_frame_site,
                                Log_id: data.log_id,
                                Sf_plan_strategy_id: items.experiment_name,
                                Material_type: this.Material_type,
                                data: x
                            })
                        })

                        this.bannerList = list ? list : this.defaultBannerList;
                    });
                    this.bannerList.sort((a, b) => {
                        return a.Rec_frame_site - b.Rec_frame_site; // 按 Rec_frame_site 排序
                    });

                } else {
                    this.bannerList = this.defaultBannerList;
                }
            } else {
                this.bannerList = this.defaultBannerList;
            }
        } catch (error) {
            this.bannerList = this.defaultBannerList;
        }
    }

    // 顯示更多活動
    public showMoreItem(): void {
        let index: number = this.navList.findIndex((item) => item.active);

        let activityList: PocActivityRs[] = this.activityList.filter(
            (item) =>
                item.ActivityCategory.includes(this.navList[index].navTitle) &&
                item.ShowActivityList
        );
        if (this.activityInProgress) {
            activityList = activityList.filter((item) =>
                this.isActivityIncludeToday(item.StartTime, item.EndTime)
            );
        }
        this.activityShowList = activityList.slice(
            0,
            this.showItemOnce * this.navList[index].showMoreItemCount
        );
        this.navList[index].showMoreItemCount++;
    }

    // 是否顯示更多活動按鈕
    public checkNoMoreItem(): boolean {
        let activityList: PocActivityRs[] = this.activityList.filter(
            (item) =>
                item.ActivityCategory.includes(
                    this.navList.find((item) => item.active).navTitle
                ) && item.ShowActivityList
        );
        if (this.activityInProgress) {
            activityList = activityList.filter((item) =>
                this.isActivityIncludeToday(item.StartTime, item.EndTime)
            );
        }
        return this.activityShowList.length === activityList.length;
    }

    // 顯示進行中的活動
    public showActivityInProgress(): void {
        let index = this.navList.findIndex((item) => item.active);
        this.activityInProgress = !this.activityInProgress;
        if (this.activityInProgress) {
            this.activityShowList = this.activityShowList.filter((item) => this.isActivityIncludeToday(item.StartTime, item.EndTime));
        } else {
            this.changeNav(index);
        }
    }

    // 檢查活動日期是否 包含 今日
    public isActivityIncludeToday(StartTime: string, EndTime: string): boolean {
        const today = new Date(this.today);
        const startTime = new Date(StartTime);
        const endTime = new Date(EndTime);
        return startTime <= today && today <= endTime;
    }

    // 檢查活動開始日是否為今天
    public isActivityStartToday(date: string): boolean {
        return (
            new Date(date).toDateString() ===
            new Date(this.today).toDateString()
        );
    }

    // 檢查今日是否在活動顯示區間內
    public isActivityStartInPeriod(item: PocActivityRs): boolean {
        return (
            new Date(this.today).getTime() >=
            new Date(item.DisplayPeriodS).getTime() &&
            new Date(this.today).getTime() <=
            new Date(item.DisplayPeriodE).getTime()
        );
    }

    // 顯示燈箱
    public showLightBox(item: PocActivityRs): void {
        //神測埋點
        const { TextOne, TextTwo } = item;
        ActivityClick('ActivityClick', TextOne, TextTwo);
        this.lightBoxItem = item;
        this.lightBoxStatus = true;
    }

    // 導到每日登入頁
    public toDailyActivity(date): void {
        this.router.navigate(['/Activity/DailyActivity'], {
            state: {
                selectDate: date,
            },
        });
    }

    // tab切換
    public routeByBillID(type: number): void {
        switch (type) {
            case 0: //信用卡總覽
                this.app.routeByBillID({
                    billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753',
                    closeWeb: false,
                });
                break;
            case 1: //信用卡管理
                this.app.routeByBillID({
                    billID: 'f5ae6e8a-5b67-4bfa-8f76-c156531d4246',
                    closeWeb: false,
                });
                break;
            default:
                break;
        }
        return;
    }

    // 外開連結
    public openLink(item: PocBannerList) {
        const bannerContent = item.data;
        //神測埋點
        const data = {
            section_id: item.Section_id,
            priority: item.Priority,
            strategy_id: item.Strategy_id,
            strategy_name: item.Strategy_name,
            rec_frame_site: item.Rec_frame_site,
            log_id: item.Log_id,
            $sf_plan_strategy_id: item.Sf_plan_strategy_id,
            target_url: bannerContent.Link,
            material_type: this.Material_type
        };
        BannerClick('bannerClick', data.section_id, String(data.priority), data.strategy_id, data.strategy_name, data.rec_frame_site, data.log_id, data.$sf_plan_strategy_id, data.target_url, data.material_type);
        const url = `${bannerContent.Link}#open-browser`;
        window.open(url, '_blank');
    }

    // 取得當前輪播banner的項目紀錄埋點
    public getBannerItem(idx: number) {
        const item = this.bannerList[idx];
        const data = {
            section_id: item.Section_id,
            priority: item.Priority,
            strategy_id: item.Strategy_id,
            strategy_name: item.Strategy_name,
            rec_frame_site: item.Rec_frame_site,
            log_id: item.Log_id,
            $sf_plan_strategy_id: item.Sf_plan_strategy_id,
            material_type: this.Material_type
        };
        //神測埋點
        BannerShow('bannerShow', data.section_id, String(data.priority), data.strategy_id, data.strategy_name, data.rec_frame_site, data.log_id, data.$sf_plan_strategy_id, data.material_type);
    }
}
