import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as dayjs from 'dayjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { VerifyRecord } from 'src/app/shared/services/sinopac/fido.models';
import {
    AuthHelper,
    FidoService,
    ServiceHelper,
} from 'src/app/shared/shared.module';

export interface VerifyRecords {
    /**序號*/
    SerialID: number;
    /**交易識別碼*/
    TractionId: string;
    /**驗證類型：(購物中綁卡;網路交易OTP;驗證卡號;純綁卡) */
    Type: string;
    /**卡別(信用卡/儲值卡/簽帳金融卡)  */
    CardType?: string;
    /**	卡號末四碼 */
    CardNoLast4?: string;
    /**	支付金額 */
    Amt: string;
    /**	幣別名稱(中文) */
    CurrencyName?: string;
    /**幣別代碼 */
    CurrencyCode?: string;
    /**驗證時間 */
    VerifyTime: string;
    /**驗證結果 */
    VerifyResult: string;
    /**用戶端 IP */
    ClientIP: string;
}

@Component({
    selector: 'app-fido-verify-record',
    templateUrl: './fido-verify-record.component.html',
    styleUrls: ['./fido-verify-record.component.scss']
})
export class FidoVerifyRecordComponent implements OnInit {
    app = new AppWrapper();
    /** 月份區間 */
    monArea: string[];
    /** 選擇月份 */
    selectMon: string = '';
    /** 顯示紀錄 */
    Items: VerifyRecords[] = [];
    /** 驗證紀錄 */
    verifyRecord: VerifyRecord[] = [];
    /** 顯示明細 */
    item: VerifyRecords;

    public constructor(private fidoService: FidoService,private router: Router) {}

    ngOnInit() {
        this.app.initHeaderBackWithCustomerService('3D刷卡FIDO驗證紀錄');
        this.getData();
    }

    async getData() {
        const currentMonth = dayjs().startOf('month');
        this.monArea = Array.from({ length: 3 }, (_, index) =>
            currentMonth.subtract(index, 'month').format('YYYY / M')
        );
        this.selectMon = currentMonth.subtract(0, 'month').format('YYYY/MM');
        const response = await this.fidoService.QueryVerifiyRecord({
            DeviceId: ServiceHelper.SessionId,
        });
        if (ServiceHelper.ifSuccess(response, false)) {
            //新到舊排序
            this.verifyRecord = response.Result.Items.sort((a, b) => a.VerifyTime > b.VerifyTime ? -1 : 1);
            this.filterData();
        }
    }

    changeMon(value) {
        //移除空白
        this.selectMon = value.replace(/\s/g, '');
        this.filterData();
    }

    filterData() {
        const data = this.verifyRecord.filter((item) => {
            return (
                dayjs(item.VerifyTime).format('YYYY/MM') ===
                dayjs(this.selectMon).format('YYYY/MM')
            );
        });
        this.Items = data.map((item, index) => ({
            ...item,
            SerialID: index + 1,
            VerifyTime: dayjs(item.VerifyTime).format('YYYY-MM-DD HH:mm:ss'),
        }));
    }

    /** 開啟明細 */
    openDetail(id: number) {
        this.router.navigate(['/Application/FidoVerifyRecord-Detail'], {
            state: {
                SerialID: id,
                Items: this.Items,
            }
        });
    }

    /** 聯絡客服 */
    goCustomerService() {
        this.app.showCustomerService();
    }

    /** 信用卡頁 */
    goCard() {
        //辦卡頁(信用卡總覽)
        this.app.routeByBillID({
            billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753',
            closeWeb: true,
        });
    }

    /** APP首頁 */
    goApp() {
        this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }
}
