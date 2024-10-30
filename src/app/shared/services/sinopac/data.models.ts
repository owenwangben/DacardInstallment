// 檢查是否為假日 - 請求內容
export interface CheckIsHolidayRq {
    // 查詢日期
    QueryDate: Date;
}

// 檢查是否為假日 - 回應結果
export interface CheckIsHolidayRs {
    // 是否為假日
    IsHoliday: boolean;
}

// 取得銀行清單(所有機構別) - 回應結果
export interface GetBankListRs {
    // 是否為假日
    Items: BankItem[];
}

export interface BankItem {
    // 機構別
    Type: string;
    // 銀行代碼
    BankCode: string;
    // 銀行名稱
    BankName: string;
    // 帳號長度
    BankLong: string;
}

//取得銀行分行清單 -回應結果
export interface GetBranchListRs {
    // 是否為假日
    Items: BranchItem[];
}

export interface BranchItem {
    // 分行代號
    BranchCode: string;
    // 分行名稱
    FullName: string;
}

//取得銀行分行清單 -請求內容
export interface GetBranchListRq {
    //分行代號
    BankCode: string;
}

/** 取得台灣3碼郵遞區號資訊 - 請求內容 */
export interface TWZip3CodeRq {
}

/** 取得台灣3碼郵遞區號資訊 - 回應結果 */
export interface TWZip3CodeRs {
	/** 台灣3碼郵遞區號清單 */
	Items?: Array<Address2>;
}

/** 台灣3碼郵遞區號清單 */
export interface Address2 {
	/** 縣市 */
	City?: string;
	/** 區域 */
	Area?: string;
	/** 3碼郵遞區號 */
	ZipCode?: string;
}
