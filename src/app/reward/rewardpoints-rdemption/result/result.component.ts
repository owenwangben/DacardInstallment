
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { Result } from 'src/app/shared/services/sinopac/bouns.models';
import { RewardDataService } from 'src/app/shared/services/sinopac/reward-data.service';
import { ServiceHelper } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-rewardpoints-rdemption-result',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
    private readonly app = new AppWrapper();
    /** 結果明細 */
    resultItems: Result[];
    /** 結果狀態 */
    resultStatus: boolean;
    /** 兌換結果點數 */
    resultPoint = 0;
    /** 剩餘點數 */
    lastPoint = 0;

    constructor(
        private router: Router,
        private rewardDataSer: RewardDataService,
    ) { }

    ngOnInit() {
        this.app.initHeaderMenu('紅利兌換');
        this.getdata();
    }


    // 確認兌換Btn
    getdata() {
        document.body.classList.add('rewardPointsSelected');
        document.body.classList.remove('rewardPointRecord-non');
        const response = this.rewardDataSer.getGiftExchange;
        const gifts = this.rewardDataSer.getGifts;
        const pointAll = this.rewardDataSer.getPoint?.Result.Point;
        if (response && ServiceHelper.ifSuccess(response, false)) {
            this.resultItems = response.Result.Items.map(item => {
                return {
                    ...item,
                    Item: {
                        ProdCode: item.Item.ProdCode,
                        ProjCode: item.Item.ProjCode,
                        Quantity: item.Item.Quantity,
                        EndTime: dayjs(item.Item.EndTime).format("YYYY/MM/DD"),
                        Description: item.Item.Description,
                        TotalPoints: item.Item.TotalPoints,
                        Name: gifts?.find(x => x.GiftNo === item.Item.ProdCode)?.Name
                    }
                }
            });
            const success = this.resultItems?.filter(x => x.IsExchangeSuccess === true);
            if (success?.length > 0) {
                this.resultStatus = true;
                this.resultPoint = success.reduce((sum, item) => sum + (Number(item.Item.TotalPoints) * item.Item.Quantity), 0);
                this.lastPoint = pointAll - this.resultPoint;
            }
            else {
                this.lastPoint = pointAll;
                this.resultStatus = false;
            }
        }
        else {
            this.lastPoint = pointAll;
            this.resultStatus = false;
        }
        this.reset();
    }

    /** 清空已選與點數與兌換紀錄 */
    reset() {
        this.rewardDataSer.setPoint = null;
        this.rewardDataSer.setGifts = null;
        this.rewardDataSer.setExchangeRecord = null;
    }

    /** 兌換其他商品 */
    goExchangeList() {
        this.router.navigateByUrl('/Reward/RewardPointsRdemption/Cart');
    }

    /** 查詢紅利紀錄 */
    goExchangeRecord() {
        this.router.navigate(['/Reward/RewardPointsRecord'], {
            state: {
                type: 'pointExchange'
            },
        });
    }
}
