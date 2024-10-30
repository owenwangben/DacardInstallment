import { Injectable } from "@angular/core";
import { ServiceHelper } from "../../shared.module";
import { BaseResponse } from '../webapi.service';
import { ApplyCardReissueRq, ApplyCardReissueRs, ApplyLostCardsRq, ApplyLostCardsRs, CardActivateRq, CardActivateRs, CardActivateSsoRq, CardDealSettingRq, CardDealSettingRs, CardReissueCheckRq, CardReissueCheckRs, CompleteUploadRq, PriorActivateCardRq, PriorActivateCardRs, QueryCardDealSettingInfoRq, QueryCardDealSettingInfoRs, QueryCardReissueRq, QueryCardReissueRs, QueryLostCardsRq, QueryLostCardsRs, QueryPriorActivateCardInfoRq, QueryPriorActivateCardInfoRs, StatusInquiryRq, StatusInquiryRs, StatusInquirySsoRq, WorkflowRq } from "./apply.model";
import { BaseService } from './base.service';

@Injectable()
export class ApplyService extends BaseService {
    private readonly URL = {
        CardActivation: 'api/Apply/CardActivation',
        CardActivationSso: 'api/Apply/CardActivationSso',
        StatusInquiry: 'api/Apply/StatusInquiry',
        StatusInquirySso: 'api/Apply/StatusInquirySso',
        Workflow: 'api/Apply/ApplicationStatusWorkflow',
        CompleteUpload: 'api/Apply/CompleteUploadFile',
        CompleteUpload2: 'api/Apply/CompleteUploadFile2',
        QueryPriorActivateCardInfo: 'api/Apply/QueryPriorActivateCardInfo',
        PriorActivateCard: 'api/Apply/PriorActivateCard',
        CheckId: 'api/Apply/UploadFileCheckID',
        QueryLostCards: 'api/Apply/QueryLostCards',
        ApplyLostCards: 'api/Apply/ApplyLostCards',
        QueryCardDealSettingInfo: 'api/Apply/QueryCardDealSettingInfo',
        CardDealSetting: 'api/Apply/CardDealSetting',
        QueryCardReissue: 'api/Apply/QueryCardReissue',
        ApplyCardReissue: 'api/Apply/ApplyCardReissue',
        CardReissueCheck: 'api/Apply/CardReissueCheck'
    }

    public CardActivation(model: CardActivateRq, captcha: string): Promise<BaseResponse<CardActivateRs>> {
        return this.post(this.URL.CardActivation, model, { 'Captcha-Code': captcha });
    }

    public CardActivationSso(model: CardActivateSsoRq, captcha: string): Promise<BaseResponse<CardActivateRs>> {
        return this.post(this.URL.CardActivationSso, model, { 'Captcha-Code': captcha });
    }

    public async StatusInquiry(model: StatusInquiryRq, captcha: string): Promise<BaseResponse<StatusInquiryRs>> {
        const response = (await this.post(this.URL.StatusInquiry, model, { 'Captcha-Code': captcha }))
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'CARD_TYPE', 'EBOSSING_TYPE')
        }
        return response;
    }

    public async StatusInquirySso(model: StatusInquirySsoRq): Promise<BaseResponse<StatusInquiryRs>> {
        const response = (await this.post(this.URL.StatusInquirySso, model))
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'CARD_TYPE', 'EBOSSING_TYPE')
        }
        return response;
    }

    public async CheckId(id: string, captcha: string): Promise<BaseResponse<any>> {
        const response = (await this.post(this.URL.CheckId, { ID: id }, { 'Captcha-Code': captcha }));
        return response;
    }

    public SendWorkflow(model: WorkflowRq): Promise<BaseResponse<any>> {
        return this.post(this.URL.Workflow, model);
    }

    public CompleteUpload(model: CompleteUploadRq): Promise<BaseResponse<any>> {
        return this.post(this.URL.CompleteUpload, model);
    }

    public CompleteUpload2(model: CompleteUploadRq): Promise<BaseResponse<any>> {
        return this.post(this.URL.CompleteUpload2, model);
    }

    public async QueryPriorActivateCardInfo(model: QueryPriorActivateCardInfoRq): Promise<BaseResponse<QueryPriorActivateCardInfoRs>> {
        const response = await this.post(this.URL.QueryPriorActivateCardInfo, model);
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'ProductCode', 'CardFace')
        }
        return response;
    }

    public PriorActivateCard(model: PriorActivateCardRq): Promise<BaseResponse<PriorActivateCardRs>> {
        return this.post(this.URL.PriorActivateCard, model);
    }

    public async QueryLostCards(model: QueryLostCardsRq): Promise<BaseResponse<QueryLostCardsRs>> {
        const response = await this.post(this.URL.QueryLostCards, model)
        if (ServiceHelper.ifSuccess(response, false)) {
            this.assignCardFaceUrl(response.Result.Items, 'ProductCode', 'CardFace')
        }
        return response;
    }

    public ApplyLostCards(model: ApplyLostCardsRq): Promise<BaseResponse<ApplyLostCardsRs>> {
        return this.post(this.URL.ApplyLostCards, model);
    }

    public QueryCardDealSettingInfo(model: QueryCardDealSettingInfoRq): Promise<BaseResponse<QueryCardDealSettingInfoRs>> {
        return this.post(this.URL.QueryCardDealSettingInfo, model);
    }

    public CardDealSetting(model: CardDealSettingRq): Promise<BaseResponse<CardDealSettingRs>> {
        return this.post(this.URL.CardDealSetting, model);
    }
    public async QueryCardReissue(model: QueryCardReissueRq): Promise<BaseResponse<QueryCardReissueRs>> {
       return this.post(this.URL.QueryCardReissue, model);
    }
    public async ApplyCardReissue(model: ApplyCardReissueRq): Promise<BaseResponse<ApplyCardReissueRs>> {
        return this.post(this.URL.ApplyCardReissue, model);
     }
     public async CardReissueCheck(model: CardReissueCheckRq): Promise<BaseResponse<CardReissueCheckRs>> {
        return this.post(this.URL.CardReissueCheck, model);
     }

}
