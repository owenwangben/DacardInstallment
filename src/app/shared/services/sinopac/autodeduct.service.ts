import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import { ApplyAutoDeductRq, ApplyAutoDeductRs, AuthAutoDeductRq, AuthAutoDeductRs, GetAutoDeductAccountRq, GetAutoDeductAccountRs, GetAutoDeductRq, GetAutoDeductRs, SetAutoDeductTypeRq, SetAutoDeductTypeRs } from './autodeduct.models';

@Injectable()
export class AutoDeductService extends BaseService {
    private readonly URL = {
        AuthAutoDeductUrl: 'api/AutoDeduct/AuthAutoDeduct',
        GetAutoDeductUrl: 'api/AutoDeduct/GetAutoDeduct',
        ApplyAutoDeductUrl: 'api/AutoDeduct/ApplyAutoDeduct',
        SetAutoDeductTypeUrl: 'api/AutoDeduct/SetAutoDeductType',
        GetAutoDeductAccountUrl: 'api/AutoDeduct/GetAutoDeductAccount'
    }

    /** 驗證是否為自動扣繳設定身份
     * 01: 不是 MMA 會員1&3 (尚未申請服務)
     * 02: 非本行信用卡客戶
     * 03: 持有之帳戶不能設定自扣
     * 04: 其他錯誤
     * 05: 無台幣帳戶 (尚未申請服務)
     */
    public AuthAutoDeduct(model: AuthAutoDeductRq): Promise<BaseResponse<AuthAutoDeductRs>> {
        return this.post(this.URL.AuthAutoDeductUrl, model);
    }

    /** 取得自動扣繳設定 */
    public GetAutoDeduct(model: GetAutoDeductRq): Promise<BaseResponse<GetAutoDeductRs>> {
        return this.post(this.URL.GetAutoDeductUrl, model);
    }

    /** 申請設定自動扣繳設定 */
    public ApplyAutoDeduct(model: ApplyAutoDeductRq): Promise<BaseResponse<ApplyAutoDeductRs>> {
        return this.post(this.URL.ApplyAutoDeductUrl, model);
    }

    /** 設定自動扣繳方式 */
    public SetAutoDeductType(model: SetAutoDeductTypeRq): Promise<BaseResponse<SetAutoDeductTypeRs>> {
        return this.post(this.URL.SetAutoDeductTypeUrl, model);
    }

    /** 取得可以自動扣繳的帳號清單 */
    public GetAutoDeductAccount(model: GetAutoDeductAccountRq): Promise<BaseResponse<GetAutoDeductAccountRs>> {
        return this.post(this.URL.GetAutoDeductAccountUrl, model);
    }

}


