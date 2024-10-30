export interface MyDataLoginRequestModel {
    /**身分證字號 */
    ID: string;

    /**出生日期 */
    Birthday: string;

    /**功能代碼 */
    FunctionCode: number;

    /**是否為小網 */
    IsMobile: boolean;
}

/**MyData Login - 回應結果 */
export interface MyDataLoginResponseModel {
    /**應用平台代號 */
    BusinessNo: string;

    /**API版本 */
    ApiVersion: string;

    /**HashKey組別 */
    HashKeyNo: string;

    /**驗證編號 */
    VerifyNo: string;

    /**通行證 */
    Token: string;

    /**驗證碼 */
    IdentifyNo: string;

    /**台網身份識別中心 Portal URL (在 Internet 上的網址，給前端執行 DO 的網址) */
    TwidPortalUrl: string;
}

export interface MyDataDoRequestModel {
    /**驗證編號 */
    VerifyNo: string;
}

export enum AgreementCodes {
    // 信用卡消費分期付款功能申請書
    applyInstallmentAgreement = '信用卡消費分期付款功能申請書',
    // 信用卡帳單分期注意事項
    installmentNoticeAgreement = '信用卡帳單分期注意事項',
    // 信用卡單筆消費分期注意事項
    singleInstallmentNoticeAgreement = '信用卡單筆消費分期注意事項',
    // 信用卡掛失注意事項
    creditCardLoseAgreement = '信用卡掛失注意事項',
    // 預借現金注意事項
    cashAdvance = '申請預借現金注意事項',
}

export interface SuspendCheckRq {
    /**功能 */
    Url: string;
}

// CardManage Light Box Status
export interface LightBoxStatus {
    // 標題
    Title?: string;
    // 內文
    Content?: string;
    // 內文置中
    IsContentCenter?: boolean;
    // 燈箱類型
    LightBoxType?: string;
    // 是否顯示
    IsDisplay?: boolean;
    // 注意事項Url
    NoticeUrl?: string;
}

export interface RightMessage {
    /**圖片URL */
    imageUrl: string;
    /**埋點文字-標題 */
    logTitleOne: string;
    /**埋點文字-副標題 */
    logTitleTwo: string;
    /**按鈕文字 */
    buttonMsg: string;
}

export interface ActivityItem {
    /**分類名稱 */
    navTitle: string;
    /**圖片 */
    navImage: string;
    /**是否選取 */
    active: boolean;
    /**點擊更多活動的次數 */
    showMoreItemCount: number
}
