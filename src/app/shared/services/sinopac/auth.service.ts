import { Injectable } from "@angular/core";
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';

@Injectable()
export class AuthService extends BaseService {

    public verifyToken(model: VerifyTokenRq): Promise<BaseResponse<VerifyTokenRs>> {
        return this.post('api/auth/verifyToken', model);
    }

    public AuthByBirthday(model: AuthByBirthdayRq): Promise<BaseResponse<AuthByBirthdayRs>> {
        return this.post('api/auth/AuthByBirthday', model);
    }

    public AuthByBirthdayWithCaptcha(model: AuthByBirthdayRq, captcha: string): Promise<BaseResponse<AuthByBirthdayRs>> {
        return this.post('api/auth/AuthByBirthdayWithCaptcha', model, { 'Captcha-Code': captcha });
    }

    public CheckFunctionLimit(model: CheckFunctionLimitRq): Promise<BaseResponse<CheckFunctionLimitRs>> {
        return this.post('api/auth/CheckFunctionLimit', model);
    }

    public UpdateFunctionCount(model: UpdateFunctionCountRq): Promise<BaseResponse<UpdateFunctionCountRs>> {
        return this.post('api/auth/UpdateFunctionCount', model);
    }
    public CheckFunctionLimitByCode(model: CheckFunctionLimitByCodeRq): Promise<BaseResponse<CheckFunctionLimitByCodeRs>> {
        return this.post('api/Auth/CheckFunctionLimitByCode', model);
    }
}

export interface VerifyTokenRq {
    AppToken: string;
    WebToken?: string;
}

export interface VerifyTokenRs {
    NewToken: string;
    TokenExpiredAt: string;
    CustomerId: string;
}

export interface AuthByBirthdayRq {
    ID: string;
    Birthday: string;
}

export interface AuthByBirthdayRs {
    // CAWHO 卡網 API Token
    Token: string;
    // CAWHO 卡網 API Token 效期
    TokenExpiredAt: string;
    // 客戶身分證字號
    CustomerId: string;
}

// 檢查功能當日使用次數 - 請求內容
export interface CheckFunctionLimitRq {
    // 功能代碼 1:卡片資訊查詢, 2:交易設定
    FunctionCode:string;
    // 功能Key
    FunctionKey:string;
    // 來源 DACARD
    Source:string;
}

// 檢查功能當日使用次數 - 回應內容
export interface CheckFunctionLimitRs {
    // 當日已使用次數
    TodayCount:number;
    // 功能限制次數
    DailyLimit:number;
}

// 更新功能當日使用次數 - 請求內容
export interface UpdateFunctionCountRq {
    // 功能代碼 1:卡片資訊查詢, 2:交易設定
    FunctionCode:string;
    // 功能Key 卡號 or ID
    FunctionKey:string;
    // 來源 DACARD
    Source:string;
}

// 更新功能當日使用次數 - 回應內容
export interface UpdateFunctionCountRs {
    AffectedRows:number;
}

// 更新功能當日使用次數 - 請求內容
export interface CheckFunctionLimitByCodeRq {
    // 功能代碼 掛失補發：M1 毀損補發：M2
    FunctionCode:string;
    // 功能Key (如：ID、卡號…)
    FunctionKey:string;
    // 來源 DACARD
    Source:string;
}

// 更新功能當日使用次數 - 回應內容
export interface CheckFunctionLimitByCodeRs {
    //已使用次數 掛失補發：當月使用次數 毀損補發：當月使用次數
    Count:number;
    //功能限制次數 掛失補發：一個月限制次數毀損補發：一個月限制次數
    Limit:number;
}

