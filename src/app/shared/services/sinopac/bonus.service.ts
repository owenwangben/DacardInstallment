import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import {   ExchangeRecordRq, ExchangeRecordRs, GiftExchangeRq, GiftExchangeRs, GiftRq, GiftRs, GiftsRq, GiftsRs, PointRq, PointRs, QueryCardFeedbackTypeRq, QueryCardFeedbackTypeRs, QueryFeedbackRq, QueryFeedbackRs, TPointsQueryFeedbackRs, TPointsRedemptionRecordsResultModel } from './bouns.models';

@Injectable()
export class BonusService extends BaseService {
    private readonly URL = {
        QueryDcurFeedback: 'api/Bonus/QueryDcurFeedback',
        QueryDawhoFeedback: 'api/Bonus/QueryDawhoFeedback',
        QuerySportFeedback: 'api/Bonus/QuerySportFeedback',
        QueryCashFeedback: 'api/Bonus/QueryCashFeedback',
        QueryMitsuiFeedback: 'api/Bonus/QueryMitsuiFeedback',
        QueryDawayFeedback: 'api/Bonus/QueryDawayFeedback',
        QueryCardFeedbackType: 'api/Bonus/QueryCardFeedbackType',
        TPointsQueryFeedbackUrl: 'api/Bonus/TPointsQueryFeedback',
        TPointsRedemptionRecordsUrl: 'api/Bonus/TPointsRedemptionRecords',
        TPointsSettingUrl: 'api/Bonus/TPointsSetting',
        Point: 'api/Bonus/Point',
        ExchangeRecord: 'api/Bonus/ExchangeRecord',
        Gifts: 'api/Bonus/Gifts',
        Gift: 'api/Bonus/Gift',
        GiftExchange: 'api/Bonus/GiftExchange'
    }

    public QueryDcurFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QueryDcurFeedback, model);
    }

    public QueryDawhoFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QueryDawhoFeedback, model);
    }

    public QuerySportFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QuerySportFeedback, model);
    }

    public QueryCashFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QueryCashFeedback, model);
    }

    public QueryMitsuiFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QueryMitsuiFeedback, model);
    }

    public QueryDawayFeedback(model: QueryFeedbackRq): Promise<BaseResponse<QueryFeedbackRs>> {
        return this.post(this.URL.QueryDawayFeedback, model);
    }

    public QueryCardFeedbackType(model:QueryCardFeedbackTypeRq): Promise<BaseResponse<QueryCardFeedbackTypeRs>> {
        return this.post(this.URL.QueryCardFeedbackType, model);
    }

    public QueryCarsFeedback(model: QueryFeedbackRq): Promise<BaseResponse<TPointsQueryFeedbackRs>> {
        return this.post(this.URL.TPointsQueryFeedbackUrl, model);
    }

    public TPointsRedemptionRecords(model: QueryFeedbackRq): Promise<BaseResponse<TPointsRedemptionRecordsResultModel>> {
        return this.post(this.URL.TPointsRedemptionRecordsUrl, model);
    }

    public TPointsSetting(ID: string,isRedeemSpecificChannels: boolean): Promise<BaseResponse<any>> {
        return this.post(this.URL.TPointsSettingUrl, {ID,isRedeemSpecificChannels});
    }

    public Point(model: PointRq): Promise<BaseResponse<PointRs>> {
        return this.post(this.URL.Point, model);
    }

    public ExchangeRecord(model: ExchangeRecordRq): Promise<BaseResponse<ExchangeRecordRs>> {
        return this.post(this.URL.ExchangeRecord, model);
    }

    public Gifts(model: GiftsRq): Promise<BaseResponse<GiftsRs>> {
        return this.post(this.URL.Gifts, model);
    }

    public Gift(model: GiftRq): Promise<BaseResponse<GiftRs>> {
        return this.post(this.URL.Gift, model);
    }

    public GiftExchange(model: GiftExchangeRq): Promise<BaseResponse<GiftExchangeRs>> {
        return this.post(this.URL.GiftExchange, model);
    }
}


