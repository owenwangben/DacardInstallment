import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { VerifyRecords } from '../fido-verify-record.component';

@Component({
    selector: 'app-fido-verify-record-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
})
export class FidoVerifyRecordDetailComponent implements OnInit {
    app = new AppWrapper();
    /** 顯示紀錄 */
    Items: VerifyRecords[] = [];
    detail: VerifyRecords;
    SerialID: number;

    public constructor(private route: ActivatedRoute) {}

    /**
     * Input 刷新觸發
     * @param changes
     */
    ngOnInit() {
        this.app.initHeaderBackWithCustomerService('3D刷卡FIDO驗證紀錄');
        this.Items = history.state.Items;
        this.SerialID = history.state.SerialID;
        this.detail = this.Items.find((x) => x.SerialID === this.SerialID);
    }

    /** 上一筆 */
    last(){
        this.SerialID = this.SerialID > 1? (this.SerialID - 1) : this.SerialID;
        this.detail = this.Items?.find((x) => x.SerialID === this.SerialID);
    }

    /** 下一筆 */
    next(){
        this.SerialID = this.SerialID < this.Items?.length ? (this.SerialID + 1) : this.SerialID;
        this.detail = this.Items?.find((x) => x.SerialID === this.SerialID);
    }

    /** 回首頁 */
    close() {
        this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }
}
