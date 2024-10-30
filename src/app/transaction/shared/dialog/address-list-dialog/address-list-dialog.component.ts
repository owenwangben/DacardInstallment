import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

export interface AddrListModel {
    // 標頭
    title: string;
    // 同現居地址
    AddrType1List: {
        name: string;
        value: string | number;
    }[];
    // 同戶籍地址
    AddrType2List: {
        name: string;
        value: string | number;
    }[];
    // 預設值
    value?: string;
}
@Component({
    selector: 'app-address-list-dialog',
    templateUrl: './address-list-dialog.component.html',
    styleUrls: ['./address-list-dialog.component.scss']
})
export class AddressListDialogComponent extends SimpleModalComponent<AddrListModel, string> implements OnInit {
    title: string;
    AddrType1List: {
        name: string;
        value: string | number;
    }[];
    AddrType2List: {
        name: string;
        value: string | number;
    }[];
    value?: string;

    constructor() {
        super();
    }

    ngOnInit(): void {
        if (this.value) {
            this.result = this.value;
        }
    }

    /** 取消 */
    cancel() {
        this.result = undefined;
        this.close();
    }
    /** 手動輸入地址 */
    public enterAddr() {
        this.result = '03';
        this.close();
    }
}
