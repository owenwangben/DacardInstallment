import { Injectable } from "@angular/core";
import { BaseResponse } from "../webapi.service";
import { BaseService } from "./base.service";
import { CheckIsHolidayRq, CheckIsHolidayRs, GetBankListRs, GetBranchListRq, GetBranchListRs, TWZip3CodeRq, TWZip3CodeRs } from "./data.models";


@Injectable()
export class DataService extends BaseService {
    private readonly URL = {
        checkIsHoliday:'api/Data/CheckIsHoliday',
        getBankList: 'api/Data/GetBankList',
        getBranchList:'api/Data/GetBranchList',
        TWZip3Code:'api/Data/TWZip3Code'
    }

    public checkIsHoliday(model: CheckIsHolidayRq): Promise<BaseResponse<CheckIsHolidayRs>> {
        return this.post(this.URL.checkIsHoliday, model);
    }

    public getBankList(): Promise<BaseResponse<GetBankListRs>> {
        return this.post(this.URL.getBankList, {});
    }
    public getBranchList(model:GetBranchListRq): Promise<BaseResponse<GetBranchListRs>> {
        return this.post(this.URL.getBranchList, model);
    }
    /** 取得台灣3碼郵遞區號資訊 */
	public TWZip3Code(model:TWZip3CodeRq): Promise<BaseResponse<TWZip3CodeRs>> {
		return this.post(this.URL.TWZip3Code, model);
	}
}
