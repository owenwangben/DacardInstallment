import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BaseResponse } from '../webapi.service';
import { PaymentToolQueryRq, PaymentToolQueryRs, BindCreditCardRq, BindCreditCardRS } from './paybill.model';

@Injectable({
    providedIn: 'root'
})
export class PaybillService extends BaseService {
    private readonly URL = {
        PaymentToolQuery: 'api/PayBill/PaymentToolQuery',
        BindCreditCard: 'api/PayBill/BindCreditCard',
    }

    public PaymentToolQuery(model: PaymentToolQueryRq): Promise<BaseResponse<Array<PaymentToolQueryRs>>> {
        return this.post(this.URL.PaymentToolQuery, model);
    }

    public BindCreditCard(model: BindCreditCardRq): Promise<BaseResponse<BindCreditCardRS>> {
        return this.post(this.URL.BindCreditCard, model);
    }
}
