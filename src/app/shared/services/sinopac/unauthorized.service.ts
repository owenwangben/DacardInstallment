import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import { QueryUnauthorizedRq, QueryUnauthorizedRs, UnauthorizedConfirmRq, UnauthorizedConfirmRs } from './unauthorized.models';

@Injectable()
export class UnauthorizedService extends BaseService {
    private readonly URL = {
        UnauthorizedConfirmUrl: 'api/Unauthorized/UnauthorizedConfirm',
        QueryUnauthorizedUrl: 'api/Unauthorized/QueryUnauthorized'
    }

    /**未核准授權確認(本人/非本人)  */
    public UnauthorizedConfirm(model: UnauthorizedConfirmRq): Promise<BaseResponse<UnauthorizedConfirmRs>> {
        return this.post(this.URL.UnauthorizedConfirmUrl, model);
    }

    /**未核准授權交易查詢  */
    public QueryUnauthorized(model: QueryUnauthorizedRq): Promise<BaseResponse<QueryUnauthorizedRs>> {
        return this.post(this.URL.QueryUnauthorizedUrl, model);
    }
}


