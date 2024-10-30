import { query } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

export interface RadioboxModel{
    // 標頭
    title: string;
    // 選項
    list: {
        name: string;
        value: string | number;
        comment?: string;
    }[];
    // 搜尋功能
    filter?: boolean;
    // 預設值
    value?: string | number;
}

@Component({
  selector: 'app-radiobox-dialog',
  templateUrl: './radiobox-dialog.component.html',
  styleUrls: ['./radiobox-dialog.component.scss']
})
export class RadioboxDialogComponent extends SimpleModalComponent<RadioboxModel, string | number> implements OnInit {
    title: string;
    list: {
        name: string;
        value: string | number;
        comment?: string;
    }[];
    filterList:{
        name: string;
        value: string | number;
        comment?: string;
    }[];
    filter?: boolean;
    value?: string | number;
    // 搜尋文字
    query = '';

  constructor() {
      super();
  }

  ngOnInit(): void {
    // 淺copy
    this.filterList = [...this.list];
    if(this.value){
        this.result = this.value;
    }
  }

  /** 取消 */
  cancel(){
    this.result = undefined;
    this.close();
  }

  /** 搜尋功能 */
  search(){
    this.filterList = this.list.filter(a=> a.name.includes(this.query) || a.comment?.includes(this.query));
  }

}
