import { Injectable } from '@angular/core';
import { BaseResponse } from '../webapi.service';
import { BaseService } from './base.service';
import {
    GetActivityRq,
    GetActivityRs,
    QueryAirportPickupRq,
    QueryAirportPickupRs,
    QueryAirportVIPServiceRq,
    QueryAirportVIPServiceRs,
    QueryIVRActivityRq,
    QueryIVRActivityRs,
    QueryRoadsideAssistanceRq,
    QueryRoadsideAssistanceRs,
    SignActivityRq,
    SignActivityRs,
} from './register.models';

@Injectable()
export class RegisterService extends BaseService {
    private readonly URL = {
        SignActivityUrl: 'api/Activity/SignActivity',
        QueryIVRActivityUrl: 'api/Activity/QueryIVRActivity',
        GetActivityUrl: 'api/Activity/GetActivity',
        QueryAirportPickupUrl: 'api/Activity/QueryAirportPickup',
        QueryRoadsideAssistanceUrl: 'api/Activity/QueryRoadsideAssistance',
        QueryAirportVIPServiceUrl: 'api/Activity/QueryAirportVIPService',
    };

    public GetActivity(
        model: GetActivityRq
    ): Promise<BaseResponse<GetActivityRs>> {
        return this.post(this.URL.GetActivityUrl, model);
    }

    public QueryIVRActivity(
        model: QueryIVRActivityRq
    ): Promise<BaseResponse<QueryIVRActivityRs>> {
        return this.post(this.URL.QueryIVRActivityUrl, model);
    }

    public SignActivity(
        model: SignActivityRq
    ): Promise<BaseResponse<SignActivityRs>> {
        return this.post(this.URL.SignActivityUrl, model);
    }

    public QueryRoadsideAssistance(
        model: QueryRoadsideAssistanceRq
    ): Promise<BaseResponse<QueryRoadsideAssistanceRs>> {
        return this.post(this.URL.QueryRoadsideAssistanceUrl, model);
    }

    public QueryAirportPickup(
        model: QueryAirportPickupRq
    ): Promise<BaseResponse<QueryAirportPickupRs>> {
        return this.post(this.URL.QueryAirportPickupUrl, model);
    }

    public QueryAirportVIPService(
        model: QueryAirportVIPServiceRq
    ): Promise<BaseResponse<QueryAirportVIPServiceRs>> {
        return this.post(this.URL.QueryAirportVIPServiceUrl, model);
    }
}
