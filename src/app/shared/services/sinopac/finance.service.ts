import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import { StmtInstallmentApplyRecordRq, StmtInstallmentApplyRecordRs, UnsettledInstallmentRecordRq, UnsettledInstallmentRecordRs } from './finance.models';

@Injectable()
export class FinanceService extends BaseService {
    private readonly URL = {
        UnsettledInstallmentRecordUrl: 'api/Finance/UnsettledInstallmentRecord',
        StmtInstallmentApplyRecordUrl: 'api/Finance/StmtInstallmentApplyRecord',
    }
    /** 未到期分期查詢 */
    public UnsettledInstallmentRecord(model: UnsettledInstallmentRecordRq): Promise<BaseResponse<UnsettledInstallmentRecordRs>> {
        return this.post(this.URL.UnsettledInstallmentRecordUrl, model);
    }
    /** 帳單分期申請查詢 */
    public StmtInstallmentApplyRecord(model: StmtInstallmentApplyRecordRq): Promise<BaseResponse<StmtInstallmentApplyRecordRs>> {
        return this.post(this.URL.StmtInstallmentApplyRecordUrl, model);
    }
}


