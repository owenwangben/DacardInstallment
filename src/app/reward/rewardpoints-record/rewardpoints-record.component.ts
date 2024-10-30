import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { ExchangeRecordItems } from 'src/app/shared/services/sinopac/bouns.models';
import { RewardDataService } from 'src/app/shared/services/sinopac/reward-data.service';
import { AuthHelper, BonusService } from 'src/app/shared/shared.module';

enum pointtype {
    pointPile = 'pointPile',
    pointExchange = 'pointExchange'
}

@Component({
    selector: 'app-rewardpoints-record',
    templateUrl: './rewardpoints-record.component.html',
    styleUrls: ['./rewardpoints-record.component.scss']
})
export class RewardPointsRecordComponent implements OnInit {
    private readonly app = new AppWrapper();
    pointtype = pointtype;
    pointtypeNow = pointtype.pointExchange;
    dateArea: string[];
    dateNow: string;
    pointAll: number = 0;
    Expoint: number = 0;
    ExDate: string;
    exchangeRecordList: ExchangeRecordItems[];
    pileRecordList: ExchangeRecordItems[];
    exchangeRecordListShow: ExchangeRecordItems[];
    pileRecordListShow: ExchangeRecordItems[];
    pointexchangeRecord: number = 0;
    pointpileRecord: number = 0;

    constructor(
        private rewardData: RewardDataService,
        private bonus: BonusService,
    ) { }

    ngOnInit() {
        document.body.classList.add('rewardPointRecord-non');
        this.app.initHeaderBackWithCustomerService('紅利點數紀錄');
        const currentMonth = dayjs().startOf('month');
        this.dateArea = Array.from({ length: 12 }, (_, index) =>
            currentMonth.subtract(index, 'month').format('YYYY/MM'),
        );
        this.dateNow = currentMonth.subtract(0, 'month').format('YYYY/MM');
        const type = history.state?.type;
        if (type) {
            this.pointtypeNow = type;
            this.setTab(type);
        }
        this.point();
        this.ExchangeRecord();
        // this.PileRecord();
    }

    /**取紅利點數 */
    async point() {
        try {
            let response = this.rewardData.getPoint;
            if(!response){
                response = await this.bonus.Point({
                    ID: AuthHelper.CustomerId,
                })
                this.rewardData.setPoint = response;
            }
            this.pointAll = response.Result.Point;
            this.Expoint = response.Result.ExpiringPoint;
            this.ExDate = dayjs(response.Result.ExpireOn).format("YYYY/MM/DD");
        } catch (error) {
            console.log(error);
        }
    }

    /**取兌換點數 */
    async ExchangeRecord() {
        try {
            let response = this.rewardData.getExchangeRecord;
            if(!response || history.state?.reset){
                response = await this.bonus.ExchangeRecord({
                    ID: AuthHelper.CustomerId,
                    QTYPE: '',
                    NearlyYEAR: 1
                });
                this.rewardData.setExchangeRecord = response;
            }
            this.exchangeRecordList = response.Result?.Items?.sort((a, b) => this.gettime(b?.DE_DATE) - this.gettime(a?.DE_DATE));
            this.exchangeRecordList = this.exchangeRecordList.map(item => {
                return {
                    ...item,
                    DE_DATE: dayjs(item.DE_DATE).format('YYYY/MM/DD')
                }
            });
            this.ExchangeRecordchange();
        } catch (error) {
            console.log(error);
        }
    }

    /**取累計點數 */
    async PileRecord() {
        try {
            let response = this.rewardData.getPileRecord;
            if(!response){
                response = await this.bonus.ExchangeRecord({
                    ID: AuthHelper.CustomerId,
                    QTYPE: 'ADD',
                    NearlyYEAR: 1
                })
            }
            this.pileRecordList = response.Result?.Items?.sort((a, b) => this.gettime(b?.DE_DATE) - this.gettime(a?.DE_DATE));
            this.pileRecordList = this.pileRecordList.map(item => {
                return {
                    ...item,
                    DE_DATE: dayjs(item.DE_DATE).format('YYYY/MM/DD')
                }
            });
            this.PileRecordchange();
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

    datechange(date) {
        this.dateNow = date;
        this.ExchangeRecordchange();
        // this.PileRecordchange();
    }

    ExchangeRecordchange() {
        this.exchangeRecordListShow = this.exchangeRecordList?.filter(x=>x.DE_DATE.includes(this.dateNow));
        this.pointexchangeRecord = this.exchangeRecordListShow.reduce((sum, item) => sum + Number(item.TRA_POINT_TTL), 0);

    }

    PileRecordchange() {
        this.pileRecordListShow = this.pileRecordList?.filter(x=>x.DE_DATE.includes(this.dateNow));
        this.pointpileRecord = this.pileRecordListShow.reduce((sum, item) => sum + Number(item.ADD_POINT), 0);
    }

    recordmemo(){
        this.app.showMsgDialog({ id: '', title: '紅利點數累積紀錄說明', msg: '累積點數及累積筆數之數值依當月帳單結帳內容為準。' });
    }

    /** 取選擇的Tab */
    setTab(pointType: pointtype) {
        this.pointtypeNow = pointType;
        this.rewardData.setActiveTab = pointType;
      }
}
