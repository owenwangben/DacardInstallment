import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { RewardPointSensorsTrack } from 'src/app/shared/services/sensorsdata';
import {
    GiftItem,
    MainCategories,
} from 'src/app/shared/services/sinopac/bouns.models';
import { RewardDataService } from 'src/app/shared/services/sinopac/reward-data.service';
import {
    AuthHelper,
    BonusService,
    ServiceHelper,
} from 'src/app/shared/shared.module';

@Component({
    selector: 'app-rewardpoints-rdemption-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
    private readonly app = new AppWrapper();
    /** 所有類別 */
    mainCategories: MainCategories[];
    /** 目前類別 */
    categoryNow: number = 0;
    /** 所有商品 */
    gifts: GiftItem[];
    /** 目前類別商品 */
    giftsList: GiftItem[];
    /** 目前兌換總計 */
    pointNow: number = 0;
    /** 全部點數 */
    pointAll: number = 0;
    /** 目前兌換數量 */
    qtyNow: number = 0;
    /** 說明 */
    memoPrduucts = false;
    /** 目前商品說明 */
    giftmemo: GiftItem;
    /** 點數提醒燈箱 */
    lightbox_point = false;

    constructor(
        private router: Router,
        private bonusSer: BonusService,
        private rewardDataSer: RewardDataService,
    ) { }

    ngOnInit() {
        document.body.classList.add('rewardPointsSelected');
        document.body.classList.remove('rewardPointRecord-non');
        this.app.initHeaderBackWithCustomerService('紅利兌換');
        this.point();
        this.getGifts();
    }

    /** 取紅利點數 */
    async point() {
        try {
            let response = this.rewardDataSer.getPoint;
            if (!response) {
                response = await this.bonusSer.Point({
                    ID: AuthHelper.CustomerId,
                });
            }
            this.pointAll = response.Result.Point;
            this.rewardDataSer.setPoint = response;
        } catch (error) {
            console.log(error);
        }
    }

    /** 取紅利商品 */
    async getGifts() {
        try {
            this.gifts = this.rewardDataSer.getGifts;
            if (!this.gifts) {
                const response = await this.bonusSer.Gifts({
                    IsPreview: false,
                });
                if (ServiceHelper.ifSuccess(response, false)) {
                    this.rewardDataSer.setMainCategories = response.Result.MainCategories;
                    this.gifts = response.Result.Gifts.map(item => {
                        return {
                            ...item,
                            EndTime: dayjs(item.EndTime).format('YYYY/MM/DD'),
                            qty: 0,
                            Description: item.Description.replace(/(\r\n)/g, '<br>')
                        }
                    });
                }
            }
            this.mainCategories = this.rewardDataSer.getMainCategories;
            this.categoryNow = 0;
            this.giftsList = this.gifts;
            this.pointMath();
        } catch (error) {
            console.log(error);
        }
    }

    /** 切換類別 */
    categoryChange(ID?) {
        if (ID === 0) {
            this.giftsList = this.gifts;
        } else {
            this.giftsList = this.gifts.filter((x) => x.MainCategoryId === ID);
        }
    }

    /** 商品說明 */
    memoShow(item) {
        this.memoPrduucts = true;
        this.giftmemo = item;
    }

    /** 點數計算 */
    pointMath() {
        this.pointNow = this.gifts
            .filter((x) => x.qty > 0)
            .reduce((sum, item) => sum + Number(item.Point) * item.qty, 0);
        this.qtyNow = this.gifts
            .filter((x) => x.qty > 0)
            .reduce((sum, item) => sum + item.qty, 0);
    }

    /** 商品兌換 */
    add(ID) {
        const cost = this.gifts.find((x) => x.ID === ID).Point;
        if (this.pointAll - this.pointNow - cost >= 0) {
            this.gifts.find((x) => x.ID === ID).qty += 1;
        } else {
            this.lightbox_point = true;
        }
        this.pointMath();
    }

    /** 商品減少 */
    reduce(ID) {
        this.gifts.find((x) => x.ID === ID).qty -= 1;
        this.pointMath();
    }

    /** 前往商品兌換確認頁 */
    goExchangeConfirmation() {
        if (this.qtyNow > 0 && this.pointNow <= this.pointAll) {
            //#region  神測埋點
            const selectedGifts = this.gifts.filter((gift) => gift.qty !== 0);
            const _exchange_name: string[] = selectedGifts.map(
                (gift) => gift.Name
            );
            const _exchange_amount: string[] = selectedGifts.map((gift) => gift.qty.toString());
            const sensorData = {
                exchange_name: _exchange_name,
                exchange_amount: _exchange_amount,
            };
            RewardPointSensorsTrack("ExchangeProductSelect", sensorData);
            //#endregion
            this.rewardDataSer.setGifts = this.gifts;
            document.body.classList.remove('rewardPointsSelected');
            this.router.navigateByUrl(
                '/Reward/RewardPointsRdemption/Confirmation'
            );
        }
    }
}
