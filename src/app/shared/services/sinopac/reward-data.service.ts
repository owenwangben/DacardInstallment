import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import {
    ExchangeRecordRs,
    GiftExchangeRs,
    GiftItem,
    MainCategories,
    PointRs,
} from './bouns.models';

@Injectable({
    providedIn: 'root',
})
export class RewardDataService {
    /** 紅利點數 */
    private _Point?: BaseResponse<PointRs>;

    set setPoint(point: BaseResponse<PointRs>) {
        this._Point = point;
    }

    get getPoint() {
        return this._Point;
    }

    /** 兌換紀錄 */
    private _ExchangeRecord?: BaseResponse<ExchangeRecordRs>;

    set setExchangeRecord(ExchangeRecord: BaseResponse<ExchangeRecordRs>) {
        this._ExchangeRecord = ExchangeRecord;
    }

    get getExchangeRecord() {
        return this._ExchangeRecord;
    }

    /** 累計紀錄 */
    private _PileRecord?: BaseResponse<ExchangeRecordRs>;

    set setPileRecord(PileRecord: BaseResponse<ExchangeRecordRs>) {
        this._PileRecord = PileRecord;
    }

    get getPileRecord() {
        return this._PileRecord;
    }

    /** 紅利商品 */
    private _Gifts?: GiftItem[];

    set setGifts(Gifts: GiftItem[]) {
        this._Gifts = Gifts;
    }

    get getGifts() {
        return this._Gifts;
    }

    /** 商品類別 */
    private _MainCategories?: MainCategories[];

    set setMainCategories(MainCategories: MainCategories[]) {
        this._MainCategories = MainCategories;
    }

    get getMainCategories() {
        return this._MainCategories;
    }

    /** 兌換紅利商品 */
    private _GiftExchange?: BaseResponse<GiftExchangeRs>;

    set setGiftExchange(GiftExchange: BaseResponse<GiftExchangeRs>) {
        this._GiftExchange = GiftExchange;
    }

    get getGiftExchange() {
        return this._GiftExchange;
    }

    /** 設定點數累積/點數兌換Tab*/
    private activeTab: string;

    set setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    get getActiveTab() {
        return this.activeTab;
    }
}
