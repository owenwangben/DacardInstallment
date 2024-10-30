import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import {
    QueryVerifiyRecordRq,
    QueryVerifiyRecordRs,
    VerifiyCompleteRq,
    VerifiyCompleteRs,
} from './fido.models';

@Injectable()
export class FidoService extends BaseService {
    private readonly URL = {
        QueryVerifiyRecordUrl: 'api/Fido/QueryVerifiyRecord',
        VerifiyCompleteUrl: 'api/Fido/VerifiyComplete',
    };

    /** 查詢 3D FIDO 驗證記錄  */
    public QueryVerifiyRecord(
        model: QueryVerifiyRecordRq
    ): Promise<BaseResponse<QueryVerifiyRecordRs>> {
        return this.post(this.URL.QueryVerifiyRecordUrl, model);
    }

    /** 3D FIDO 驗證完成  */
    public VerifiyComplete(
        model: VerifiyCompleteRq
    ): Promise<BaseResponse<VerifiyCompleteRs>> {
        return this.post(this.URL.VerifiyCompleteUrl, model);
    }
}
