import { ServiceHelper } from 'src/app/shared/shared.module';
import { Injectable } from "@angular/core";
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import {
    AllCardsRq, AllCardsRs, CardStatus2Rs, CardStatusRq, CardStatusRs, GenerateOTPRq, GenerateOTPRs, GetContactInfoRq, GetContactInfoRs, GetEnglishNameRq, GetEnglishNameRs, QueryCardInfoRq, QueryCardInfoRs, QueryMobileRq, QueryMobileRs,
    UpdateOrderedCardListRq, UpdateOrderedCardListRs, VerifyOTPRq, VerifyOTPRs
} from "./member.models";

@Injectable()
export class MemberService extends BaseService {
    private readonly URL = {
        AllCards: 'api/member/allCards',
        CardStatus: 'api/Member/CardStatus',
        UpdateOrderedCardList: 'api/Member/UpdateOrderedCardList',
        QueryMobile: 'api/Member/QueryMobile',
        GenerateOTP: 'api/Member/GenerateOTP',
        VerifyOTP: 'api/Member/VerifyOTP',
        GetEnglishName: 'api/Member/GetEnglishName',
        CardStatus2: 'api/Member/CardStatus2',
        QueryCardInfo:'api/Member/QueryCardInfo',
        GetContactInfo:'api/Member/GetContactInfo'
    }
    public AllCards(model: AllCardsRq): Promise<BaseResponse<AllCardsRs>> {
        return this.post(this.URL.AllCards, model);
    }

    public async CardStatus(model: CardStatusRq): Promise<BaseResponse<CardStatusRs>> {
        const response = (await this.post(this.URL.CardStatus, model)) as BaseResponse<CardStatusRs>;
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'ProductCode', 'CardFace')
        }
        return response;
    }

    public async CardStatus2(model: CardStatusRq): Promise<BaseResponse<CardStatus2Rs>> {
        const response = (await this.post(this.URL.CardStatus2, model)) as BaseResponse<CardStatus2Rs>;
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'ProductCode', 'CardFace')
        }
        return response;
    }

    public UpdateOrderedCardList(model: UpdateOrderedCardListRq): Promise<BaseResponse<UpdateOrderedCardListRs>> {
        return this.post(this.URL.UpdateOrderedCardList, model);
    }

    public QueryMobile(model: QueryMobileRq): Promise<BaseResponse<QueryMobileRs>> {
        return this.post(this.URL.QueryMobile, model);
    }

    public GenerateOTP(model: GenerateOTPRq): Promise<BaseResponse<GenerateOTPRs>> {
        return this.post(this.URL.GenerateOTP, model);
    }

    public VerifyOTP(model: VerifyOTPRq): Promise<BaseResponse<VerifyOTPRs>> {
        return this.post(this.URL.VerifyOTP, model);
    }

    public GetEnglishName(model: GetEnglishNameRq): Promise<BaseResponse<GetEnglishNameRs>> {
        return this.post(this.URL.GetEnglishName, model);
    }

    public QueryCardInfo(model: QueryCardInfoRq): Promise<BaseResponse<QueryCardInfoRs>> {
        return this.post(this.URL.QueryCardInfo, model);
    }

    public GetContactInfo(model: GetContactInfoRq): Promise<BaseResponse<GetContactInfoRs>> {
        return this.post(this.URL.GetContactInfo, model);
    }
}
