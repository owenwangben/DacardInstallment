import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import AuthHelper from '../helpers/auth.helper';

@Injectable()
export class WebApiService {
	constructor(private http: HttpClient) { }

	public async post(apiURL: string, model: any, headers?: { [key: string]: string }, withCredentials?: boolean): Promise<any> {
		let newHeaders = new HttpHeaders(headers);
		const token = AuthHelper.WebToken;
		if (token) { newHeaders = newHeaders.append('Authorization', 'Bearer ' + token); }
		return await this.http.post(apiURL, model, { headers: newHeaders, responseType: 'json', withCredentials }).toPromise();
	}
}

export class BaseRequest {
	public constructor(
		public Content: any,
		public Header: RequestHeader
	) { }
}

export interface RequestHeader {
	ApplicationName: string;
	SessionID?: string;
	ClientIP?: string;
	UserAgent?: string;
	ClientRefNo?: string;
	ClientTimestamp?: Date;
}

export interface BaseResponse<T> {
	Original: any;
	Header: ResponseHeader;
	ResultCode: string;
	ResultMessage: string;
	Result: T;
}

export interface ResponseHeader {
	ApplicationName: string;
    ResponseTime: Date;
}
