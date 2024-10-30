// 線上預借現金申請 - 回應結果
export interface memberStatus {
    // 說明文字
    text: string;
    // 確定鍵文字內容
    check: string;
    // 取消件文字內容
    uncheck?: string;
    //事件ID
    ID: string;
}

export interface GetActivityRq {
    // 身分證
    ID: string;
}

export interface GetActivityRs {
    //活動清單
    Items: Array<GetActivityItem>;
}

export interface GetActivityItem {
    //活動名稱
    Title: string;
    //活動代碼
    Code: string;
    //登錄開始時間
    RegisterBeginTime: string;
    //登錄結束時間
    RegisterEndTime: string;
    //活動頁面連結
    SignUrl: string;
}

export interface QueryIVRActivityRq {
    // 身份證字號
    ID: string;
}

export interface QueryIVRActivityRs {
    // 活動登錄列表
    Items: Array<QueryIVRActivityItem>;
}

export interface QueryIVRActivityItem {
    // 活動名稱
    NAME: string;
    // 名單代碼
    ProjectId: string;
    // 登錄來源
    AddSource: string;
    // 登錄時間
    AddDateTime: string;
    // 登錄序號
    SNO: string;
    // 活動頁面連結
    SignUrl: string;
}

export interface SignActivityRq {
    // 活動代碼
    Code: string;
    // 身份證字號
    ID: string;
    // 會員身分
    Verify_Method: string;
    // 可登錄開始時間
	RegisterBeginTime: string;
    // 可登錄結束時間
	RegisterEndTime: string;
}

export interface SignActivityRs {
    // 登陸順序
    Seq: string;
}

/** 機場接送資格查詢 - 請求內容 */
export interface QueryAirportPickupRq {
	/** 身份證字號 */
	ID: string;
}

/** 機場接送資格查詢 - 回應結果 */
export interface QueryAirportPickupRs {
	/** 次數(剩餘可用次數) */
	LASTUSED_NUM: number;
	/** 群組(符合資格FLAG) */
	SYS_INS?: string;
	/** 備註 */
	MEMO?: string;
	/** 年消費 */
	YEARLY_SPENDING?: string;
}

/** 機場貴賓室資格查詢 - 請求內容 */
export interface QueryAirportVIPServiceRq {
	/** 身份證字號 */
	ID: string;
}

/** 機場貴賓室資格查詢 - 回應結果 */
export interface QueryAirportVIPServiceRs {
	/** 卡片中文名稱 */
	CardName?: string;
	/** 卡片可使用次數 */
	CanusedCNT?: number;
}

export interface QueryRoadsideAssistanceRq {
	/** 身份證字號 */
	ID: string;
}

export interface QueryRoadsideAssistanceRs {
	/** 專案別 */
	PRJ_TYPE?: string;
	/** 次數(數字或文字，0表無資格，'不限' 表不限次數 */
	CNT?: string;
}
