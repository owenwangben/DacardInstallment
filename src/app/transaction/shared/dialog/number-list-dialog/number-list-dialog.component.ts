import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

export interface NumberListModel {
    // 標頭
    title: string;
    // 選項
    list: {
        name: string;
        value: string;
    }[];
    /** 是否隱碼 */
    mask: boolean;
    /** 隱碼格式
     * card:信用卡號(0000-00●●●●●00-00)
     * custom:銀行帳號(隱碼4~9)
    */
    maskType?: string;
    // 預設值
    value?: string;
}
@Component({
    selector: 'app-number-list-dialog',
    templateUrl: './number-list-dialog.component.html',
    styleUrls: ['./number-list-dialog.component.scss']
})
export class NumberListDialogComponent extends SimpleModalComponent<NumberListModel, string> implements OnInit {
    readonly type = maskType;
    title: string;
    list: {
        name: string;
        value: string;
    }[];
    /** 是否隱碼 */
    mask: boolean;
    /** 隱碼格式
     * card:信用卡號(0000-00●●●●●00-00)
     * custom:銀行帳號(隱碼4~9)
    */
    maskType?: string = maskType.card;
    value?: string;
    constructor() {
        super();
    }

    ngOnInit(): void {
        if (this.value) {
            this.result = this.value;
        }
    }

    cancel() {
        this.result = undefined;
        this.close();
    }

}
export enum maskType {
    card = 'card',
    custom = 'custom'
}
