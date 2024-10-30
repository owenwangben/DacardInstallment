export interface UnauthorizedConfirmRq {
    /**身分證字號 */
    ID: string;
    /**決策/事件編號 */
    EventID: string;
    /**決策授權碼 */
    DecisionAuthorizationCode: string;
    /**是否為本人交易 */
    SelfTradeConfirm: boolean;
}

export interface UnauthorizedConfirmRs {
    /**回應代碼; 00:成功, N1: 無此編號，異動失敗, N2: 此編號已處理完成, N3: 回覆訊息不正確, N4: 傳入資料不完整 */
    ResponseCode: string;
}

export interface QueryUnauthorizedRq {
    /**身分證字號 */
    ID: string;
}

export interface QueryUnauthorizedRs {
    Items: QueryUnauthorized_ITEM[];
}

export class QueryUnauthorized_ITEM {
    /**決策授權碼 */
    DecisionAuthorizationCode: string;
    /**金額 */
    Amount: number;
    /**授權時間 */
    AuthorizationTime: string;
    /**卡片說明 */
    CardDescription: string;
    /**狀態 0:待處理,1:本人交易,2:非本人交易,3:於其他裝置已回覆 */
    Status: number;
    /**決策/事件編號 */
    EventID: string;
    /**展開狀態 */
    ExpandStatus: boolean = false;
}
