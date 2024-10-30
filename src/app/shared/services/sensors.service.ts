import { Injectable } from '@angular/core';
import { BaseSensorStrackerRes, RecommendBannerHeader, RecommendBannerParam, RecommendBannerRq, RecommendBannerRs } from '../sensorstracker';
import { HttpClient, HttpResponse } from '@angular/common/http';


@Injectable()
export class SensorsService {

    constructor(private http: HttpClient) { }
    private readonly URL = {
        POCBannerUrl: `${window['site_config'].advPlatformParam.url}api/v2/sfo/section/recommend`,
    };

    public GetPOCBannerData(body: RecommendBannerRq, headers: RecommendBannerHeader, params: RecommendBannerParam): Promise<HttpResponse<BaseSensorStrackerRes<RecommendBannerRs>>> {
        return this.http.post<BaseSensorStrackerRes<RecommendBannerRs>>(this.URL.POCBannerUrl, body, { headers: headers, params: params, observe: 'response' }).toPromise();
    }
}
