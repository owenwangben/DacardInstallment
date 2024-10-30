import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { LostCardItem } from 'src/app/shared/services/sinopac/apply.model';
import { ApplyService, ServiceHelper } from 'src/app/shared/shared.module';
import { reissueType } from '../card-reissue.model';


@Injectable()
export class CardReissueService {
    private readonly app = new AppWrapper();

    public constructor(
        private router: Router,
        private applyService: ApplyService,
    ) { }

    /**
     * 檢查換補發申請次數限制
     * @param customerid user id
     * @param cardInfo 欲查詢卡片資料
     * @param applyType 換補發型別 Loss、Damag
     * @returns true => 重複申請, false=> 未申請
     */
    async checkRepeatApply(customerid: string, cardInfo: LostCardItem[], applyType: string, situation?: string): Promise<boolean> {
        const response = await this.applyService.CardReissueCheck({
            ID: customerid,
            ProductCode: cardInfo[0].ProductCode,
            CardFace: cardInfo[0].CardFace,
            CardTypeCode: cardInfo.some(i => i.CardTypeCode !== 'NP') ? cardInfo[0].CardTypeCode : "NP",
            ReissueType: reissueType.Loss === applyType ? '1' : '2'
        });
        if (ServiceHelper.ifSuccess(response, false)) {//判斷是否重複申請
            this.router.navigate(['/Application/CardReissue'], {
                state: {
                    items: cardInfo,
                    switchPage: applyType,
                    Situation: situation
                }
            });
            return false;
        } else if (response.ResultCode === '01') { // 7天內已申請過換補發
            this.app.showMsgSelDialog({
                id: 'RepeatApply', title: '已重複申請',
                msg: '此卡7天內已申請過補發卡片，無法重複申請，若有問題請聯繫客服。',
                btnOK: '確定', btnNO: '聯繫客服'
            });
            return true;
        } else if (response.ResultCode === '02') { //一個月內已申請過3次換補發
            this.app.showMsgSelDialog({
                id: 'RepeatApply', title: '已重複申請',
                msg: '已達申請上限三次(30天內)，若有問題請聯繫客服。', btnOK: '確定', btnNO: '聯繫客服'
            });
            return true;
        } else if (response.ResultCode === '03') { // 毀補後4天內不可以做掛補
            this.app.showMsgSelDialog({
                id: 'RepeatApply', title: '已重複申請',
                msg: '此卡4天內已申請過補發卡片，無法重複申請，若有問題請聯繫客服(02)2528-7776。', btnOK: '確定', btnNO: '聯繫客服'
            });
            return true;
        } else { //系統錯誤
            this.app.showMsgSelDialog({
                id: 'SystemError', title: '系統錯誤',
                msg: response.ResultMessage, btnOK: '確定', btnNO: '聯繫客服'
            });
            return true;
        }
    }
}
