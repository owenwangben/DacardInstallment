import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import { MyDataDoRequestModel, MyDataLoginRequestModel, MyDataLoginResponseModel, SuspendCheckRq } from './shared.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService extends BaseService {
    private readonly URL = {
        suspendCheck: 'api/Security/SuspendCheck',
        mydataLogin: 'api/MyData/MyDataLogin',
        mydataDo: 'api/MyData/MyDataDo'
    };

    /**
	 * MyData Login
	 */
	public mydataLogin(model: MyDataLoginRequestModel): Promise<BaseResponse<MyDataLoginResponseModel>> {
        return this.post(this.URL.mydataLogin, model);
	}

    /**
	 * MyData Do
	 */
	public mydataDo(model: MyDataDoRequestModel): Promise<BaseResponse<any>> {
        return this.post(this.URL.mydataDo, model);
	}

    public suspendCheck(model: SuspendCheckRq): Promise<BaseResponse<any>> {
        return this.post(this.URL.suspendCheck, model);
    }
}

// 加密String
export const encryptString = (str):string => btoa(str);

// 解密String
export const decryptToString = (code:string):string => atob(code);

// 加密 for queryString
export const objectToEncryptString = (model:object):string => encodeURIComponent(encryptString(JSON.stringify(model)));

// 解密 for queryString
export const encryptStringToObject = <T>(str:string):T => JSON.parse(decryptToString(decodeURIComponent(str))) as T;
