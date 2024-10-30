import { Injectable } from "@angular/core";
import { BaseResponse } from '../webapi.service';
import { GetAgreementInfoRq, GetAgreementInfoRs, InsertAgreementRecordRq, InsertAgreementRecordRs } from "./agreement.models";
import { BaseService } from './base.service';

@Injectable()
export class AgreementService extends BaseService {
    private readonly URL = {
        GetAgreementInfo: 'api/Agreement/GetAgreementInfo',
        InsertAgreementRecord: 'api/Agreement/InsertAgreementRecord',
    }

    public async getAgreementInfo(model: GetAgreementInfoRq): Promise<BaseResponse<GetAgreementInfoRs>> {
        return await this.post(this.URL.GetAgreementInfo, model);
    }

    public async insertAgreementRecord(model: InsertAgreementRecordRq): Promise<BaseResponse<InsertAgreementRecordRs>> {
        return await this.post(this.URL.InsertAgreementRecord, model);
    }
}
