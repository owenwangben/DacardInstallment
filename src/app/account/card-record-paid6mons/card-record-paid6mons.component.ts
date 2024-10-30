import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { PaymentRecordsItems } from 'src/app/shared/services/sinopac/account.models';
import { AccountService, AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-card-record-paid6mons',
    templateUrl: './card-record-paid6mons.component.html',
    styleUrls: ['./card-record-paid6mons.component.scss']
})
export class CardRecordPaid6monsComponent implements OnInit {
    paymentRecords: PaymentRecordsItems[];
    paymentRecordsList: PaymentRecordsItems[];
    private readonly app = new AppWrapper();
    constructor(
        private accountService: AccountService,
    ) { }

    ngOnInit() {
        //新增返回
        this.app.initHeaderBack('信用卡繳款紀錄查詢');
        this.getRecentBill();
    }

    /**取得帳務資訊 */
    async getRecentBill() {
        const response = await this.accountService.PaymentRecords({
            ID: AuthHelper.CustomerId,
            LastMonths: 6
        })
        if (ServiceHelper.ifSuccess(response, false)) {
            this.paymentRecords = response.Result.Items.filter(x=>x.CurrencyCode === '000').map(item => {
                return {
                    ...item,
                    TXDATE: this.date(item.TXDATE)
                }
            });
            //金額取絕對值
            this.paymentRecordsList = this.paymentRecords.map(item => {
                return {
                    ...item,
                    AMT: this.RemoveNegativeSign(item.AMT)
                }
            });
            return;
        }
    }

    date(date: string) {
        return dayjs(date).format('YYYY/MM/DD').toString();
    }

    RemoveNegativeSign(value:number) {
        return Math.floor(Math.abs(value));
    }
}
