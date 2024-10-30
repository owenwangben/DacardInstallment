import { Component, Input, OnInit } from '@angular/core';
import AlertHelper from 'src/app/shared/helpers/alert.helper';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { TemporaryCreditApplyRecorditem } from 'src/app/shared/services/sinopac/account.models';
import { AccountService, AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-temp-cli-status',
    templateUrl: './temp-cli-status.component.html',
    styleUrls: ['./temp-cli-status.component.scss']
})
export class TempCliStatusComponent implements OnInit {
    private readonly app = new AppWrapper();
    public statusData: TemporaryCreditApplyRecorditem[];

    constructor(
        private accountService: AccountService,
    ) { }

    async ngOnInit(): Promise<void> {
        try {
            this.app.initHeaderBack('額度調整進度查詢');
            const res = await this.accountService.temporaryCreditApplyRecord({ ID: AuthHelper.CustomerId });
            if (ServiceHelper.ifSuccess(res, false)) {
                this.statusData = res.Result.Items;
            }
            else {
                AlertHelper.showErrorAndExitWebView(res.ResultMessage);
            }
        } catch (error) {
            console.log(error);
            this.statusData = [];
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    customerService() {
        this.app.showCustomerService();
    }

    exit() {
        this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
    }
}
