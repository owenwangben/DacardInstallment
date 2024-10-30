import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { RewardPointSensorsTrack } from 'src/app/shared/services/sensorsdata';
import { ExchangeRecordItems } from 'src/app/shared/services/sinopac/bouns.models';
import { memberStatus } from 'src/app/shared/services/sinopac/register.models';
import { RewardDataService } from 'src/app/shared/services/sinopac/reward-data.service';
import {
    AuthHelper,
    AuthService,
    BonusService,
    ServiceHelper,
} from 'src/app/shared/shared.module';

enum pointtype {
    pointPile = 'pointPile',
    pointExchange = 'pointExchange',
}
enum selectoption {
    rewardPoints = '紅利點數',
    goldBee = '金Bee',
    dacardMission = '大咖任務',
    fonPoint = '活動登錄',
    switchUser = '切換使用者',
    serviceDescription = '服務說明',
    right='卡友權益'
}
enum selectoptionE {
    rewardPoints = 'point',
    goldBee = 'goldbee',
    dacardMission = 'mission',
    fonPoint = 'activity',
    switchUser = 'user',
    serviceDescription = 'description',
    right = 'right',
}
@Component({
    selector: 'app-rewardpoints-manage',
    templateUrl: './rewardpoints-manage.component.html',
    styleUrls: ['./rewardpoints-manage.component.scss'],
})
export class RewardPointsManageComponent implements OnInit {
    private readonly app = new AppWrapper();
    pointtype = pointtype;
    pointtypeNow = pointtype.pointExchange;
    selectoption = [];
    selectoptionC: string;
    selectoptionE = selectoptionE;
    selectoptionNow: string;
    pointAll: number = 0;
    Expoint: number = 0;
    ExDate: string;
    exchangeRecordList: ExchangeRecordItems[];
    pileRecordList: ExchangeRecordItems[];
    show: boolean = false;
    title: string;
    content: string;
    type: string;
    btn1: string;
    btn2: string;

    constructor(
        private router: Router,
        private bonus: BonusService,
        private rewardData: RewardDataService,
        private authService: AuthService,
    ) { }

    async ngOnInit() {
        if (this.rewardData.getActiveTab === 'pointPile')
            this.pointtypeNow = pointtype.pointPile;
        else
            this.pointtypeNow = pointtype.pointExchange;
        this.optionSet();
        document.body.classList.remove('rewardPointRecord-non');
        this.app.initHeaderBackWithCustomerService('紅利點數');
        await this.memberdata();
        this.point();
        this.ExchangeRecord();
        // this.PileRecord();
    }

    optionSet() {
        this.selectoption = [{
            id: selectoptionE.rewardPoints,
            name: selectoption.rewardPoints
        }, {
            id: selectoptionE.goldBee,
            name: selectoption.goldBee
        }, {
            id: selectoptionE.dacardMission,
            name: selectoption.dacardMission
        }, {
            id: selectoptionE.fonPoint,
            name: selectoption.fonPoint
        }, {
            id: selectoptionE.right,
            name: selectoption.right
        }];
        this.selectoptionC = this.selectoption[0].name;
        this.selectoptionNow = this.selectoption[0].id;
    }

    /**取APP會員狀態 */
    async memberdata() {
        //取APP會員狀態
        const LoginData = await this.app.getLoginData();
        AuthHelper.AppToken = LoginData.token || '';
        ServiceHelper.SessionId = await this.app.getDeviceUUID() || '';
        AuthHelper.PairedWatch = Number(LoginData.paired_watch) === 1 ? "Y" : "N";
        //未綁定的 IOS的usertype=None時 安卓會是空值
        if (LoginData.userType === null || LoginData.userType?.trim() === "") {
            LoginData.userType = "None";
        }
        /** 是否是卡戶 */
        let customCard: boolean;

        let customAcct: boolean;
        //身分判斷依據this.LoginData.has_sinopac_acct及has_sinopac_card，IOS回應0/1，安卓回應true/false
        if (LoginData.has_sinopac_acct === "0" || LoginData.has_sinopac_acct === false) {
            customAcct = false;
        }
        if (LoginData.has_sinopac_acct === "1" || LoginData.has_sinopac_acct === true) {
            customAcct = true;
        }
        if (LoginData.has_sinopac_card === "0" || LoginData.has_sinopac_card === false) {
            customCard = false;
        }
        if (LoginData.has_sinopac_card === "1" || LoginData.has_sinopac_card === true) {
            customCard = true;
        }

        //網銀會員且有卡-取得customID
        if (LoginData.userType === 'MMA' && !!customCard) {
            if (AuthHelper.AppToken) {
                const response = await this.authService.verifyToken({ AppToken: AuthHelper.AppToken, WebToken: AuthHelper.WebToken });
                if (ServiceHelper.ifSuccess(response)) {
                    AuthHelper.storeAuthData({
                        Token: response.Result.NewToken,
                        TokenExpiredAt: response.Result.TokenExpiredAt,
                        CustomerId: response.Result.CustomerId
                    });
                }
            } else {
                this.app.showMsgDialog({ id: 'AuthGuard', title: '發生錯誤', msg: '無法取得AppToken' });
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
    }

    lightboxLogin() {
        this.title = "先登入 後查點";
        this.content = "若您為永豐銀行信用卡客戶，使用永豐銀行網銀會員登入即可查詢紅利點數及兌換紅利商品";
        this.type = "Login";
        this.show = true;
        this.btn1 = "立即登入";
        this.btn2 = "沒有永豐信用卡?";
    }

    lightboxUpgrade() {
        this.title = "升等一步 查點快速";
        this.content = "您是永豐銀行信用卡客戶，查詢紅利點數及兌換紅利商品只差一步，立即升級網銀會員!";
        this.type = "Upgrade";
        this.show = true;
        this.btn1 = "升等網銀會員";
        this.btn2 = "取消";
    }

    lightboxRecommend() {
        this.title = "辦卡消費享紅利!";
        this.content = "持有永豐信用卡並消費才能累積紅利點數，大咖手刀帶你去辦卡!";
        this.type = "Recommend";
        this.show = true;
        this.btn1 = "推薦信用卡";
        this.btn2 = "查看說明";
    }

    lightboxBtn(bool) {
        if (this.type === "Login") {
            bool ? this.routeByBillID(selectoptionE.switchUser) : this.cardRecommend();
        }
        if (this.type === "Upgrade") {
            bool ? this.routeByBillID(selectoptionE.serviceDescription) : this.exitWeb();
        }
        if (this.type === "Recommend") {
            bool ? this.cardRecommend() : this.memoinfo();
        }
    }

    //彈窗模駔(有取消鈕)
    public showbox1(tx: memberStatus) {
        this.app.showMsgSelDialog({
            id: tx.ID, title: '紅利點數',
            msg: tx.text,
            btnOK: tx.check, btnNO: tx.uncheck
        });
    }

    /**取紅利點數 */
    async point() {
        try {
            const response = await this.bonus.Point({
                ID: AuthHelper.CustomerId,
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.rewardData.setPoint = response;
                this.pointAll = response.Result.Point;
                this.Expoint = response.Result.ExpiringPoint;
                this.ExDate = dayjs(response.Result.ExpireOn).format("YYYY/MM/DD");
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**取兌換點數 */
    async ExchangeRecord() {
        try {
            const response = await this.bonus.ExchangeRecord({
                ID: AuthHelper.CustomerId,
                QTYPE: '',
                NearlyYEAR: 1
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.rewardData.setExchangeRecord = response;
                this.exchangeRecordList = response.Result?.Items?.sort((a, b) => this.gettime(b?.DE_DATE) - this.gettime(a?.DE_DATE));
                this.exchangeRecordList = this.exchangeRecordList.map(item => {
                    return {
                        ...item,
                        DE_DATE: dayjs(item.DE_DATE).format('YYYY/MM/DD')
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    /**取累計點數 */
    async PileRecord() {
        try {
            const response = await this.bonus.ExchangeRecord({
                ID: AuthHelper.CustomerId,
                QTYPE: 'ADD',
                NearlyYEAR: 1
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.rewardData.setPileRecord = response;
                this.pileRecordList = response.Result?.Items?.sort((a, b) => this.gettime(b?.DE_DATE) - this.gettime(a?.DE_DATE));
                this.pileRecordList = this.pileRecordList.map(item => {
                    return {
                        ...item,
                        DE_DATE: dayjs(item.DE_DATE).format('YYYY/MM/DD')
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    gettime(item: string) {
        // 取得日期的Time
        if (item && item.trim() !== '') {
            return dayjs(item).valueOf();
        }
        return 0;
    }

    selectchange(event) {
        this.selectoptionNow = event.target.value;
        this.selectoptionC = this.selectoption.find(x => x.id === event.target.value)?.name;
        this.routeByBillID(event.target.value);
    }

    toRecord(type) {
        this.router.navigate(['/Reward/RewardPointsRecord'], {
            state: {
                type: type,
            },
        });
    }

    routeByBillID(type) {
        switch (type) {
            case selectoptionE.dacardMission: //大咖任務
                return this.app.routeByBillID({
                    billID: 'ae645995-1744-45f2-9a9a-77610942d7ed',
                    closeWeb: true,
                });
            case selectoptionE.goldBee: //金Bee點數
                return this.app.routeByBillID({
                    billID: '94a3722b-1faa-4376-8691-36d844cb4c8e',
                    closeWeb: true,
                });
            case selectoptionE.fonPoint: //活動登錄
                return this.app.routeByBillID({
                    billID: '8c71f111-a97c-43c1-9990-8cd46094affc',
                    closeWeb: true,
                });
            case selectoptionE.switchUser: //切換使用者
                return this.app.routeByBillID({
                    billID: '39F8DED8-F8E9-4D09-B68E-EA1D5466777D',
                    closeWeb: true,
                });
            case selectoptionE.serviceDescription: //服務說明
                return this.app.routeByBillID({
                    billID: '45A0340B-D11F-4A20-B7BC-BB709D1DFA81',
                    closeWeb: true,
                });
            case selectoptionE.right: //卡友權益
                return this.app.routeByBillID({
                    billID: '5e8c3599-309a-4474-82d1-999c46c7cc51',
                    closeWeb: true,
                });
            default:
                return '';
        }
    }

    memoinfo() {
        window.open('https://bank.sinopac.com/sinopacBT/personal/credit-card/bonus/accumulation.html#open-browser', '_blank');
    }

    exitWeb() {
        this.app.exitWeb();
    }

    //卡片推薦頁
    cardRecommend() {
        const appUrl = location.origin + '/CawhoPay/Card/Recommend';
        window.location.href = appUrl;
    }

    /** 兌換 */
    goExChange() {
        RewardPointSensorsTrack("BonusPage");
        this.router.navigateByUrl('/Reward/RewardPointsRdemption/Cart');
    }

}
