/** 驗證是否為自動扣繳設定身份 - 請求內容 */
export interface AuthAutoDeductRq {
    /** 身分證 */
    ID: string;
}

/** 驗證是否為自動扣繳設定身份 - 回應結果 */
export interface AuthAutoDeductRs {
    /** 是否為首次申請 */
    FirstFlag: boolean;
}

/** 取得自動扣繳設定 - 請求內容 */
export interface GetAutoDeductRq {
    /** 身分證 */
    ID: string;

    /** 是否僅查詢自扣銀行代碼 */
    OnlyGetBacnkCode?: boolean;
}

/** 取得自動扣繳設定 - 回應結果 */
export interface GetAutoDeductRs {
    /**是否有自扣設定  Y:有 N:無 */
    Flag: string;

    /**銀行代號 */
    BankCode: string;

    /**銀行名稱 */
    BankName: string;

    /**銀行帳號 */
    AccountNo: string;

    /**銀行帳號名稱 */
    AccountName: string;

    /**扣款方式 1:最低 2: 全額 */
    PaymentType: string;

    /**本期應繳金額 */
    TotalAmt: string;

    /**本期最低應繳金額 */
    MinAmt: string;

    /**繳款截止日 */
    DueDate: string;

    /**生效日 */
    EffectDate: string;

    /**本期自扣金額 */
    StmtAmt: string;

    /**銀行代碼+自動扣繳帳號(僅前端使用) */
    BankCodeAndAccount: string;
}

/** 申請設定自動扣繳設定 - 請求內容 */
export interface ApplyAutoDeductRq {
    /**身分證字號 */
    ID: string;

    /**是否有自扣設定  Y:有 N:無 */
    Flag: string;

    /**銀行代號 */
    BankCode: string;

    /**銀行帳號 */
    Account: string;

    /**扣款方式 */
    PaymentType: string;

    /**新申請銀行代號 */
    NewBankCode: string;

    /**新申請銀行帳號 */
    NewAccount: string;

    /**新申請扣款方式 */
    NewPaymentType: string;
}

/** 申請設定自動扣繳設定 - 回應結果 */
export interface ApplyAutoDeductRs {
    /**生效日期 */
    EffectDate: string;
}

/** 設定自動扣繳方式 - 請求內容 */
export interface SetAutoDeductTypeRq {
    /**身分證字號 */
    ID: string;

    /**是否有自扣設定  Y:有 N:無 */
    Flag: string;

    /**銀行代號 */
    BankCode: string;

    /**銀行帳號 */
    Account: string;

    /**扣款方式 */
    PaymentType: string;

    /**新申請扣款方式 */
    NewPaymentType: string;
}

/** 設定自動扣繳方式 - 回應結果 */
export interface SetAutoDeductTypeRs {
    /**生效日期 */
    EffectDate: string;
}

/** 取得可以自動扣繳的帳號清單 - 請求內容 */
export interface GetAutoDeductAccountRq {
    /**身分證字號 */
    ID: string;
}

/** 取得可以自動扣繳的帳號清單 - 回應結果 */
export interface GetAutoDeductAccountRs {
    /**帳號清單 */
    Accounts: AutoDeductAccount[];
}

export interface AutoDeductAccount {
    /** 帳號 */
    AccountNo: string;

    /** 帳號名稱 */
    AccountName: string;

    /** 帳號編號(僅前端使用) */
    No: string;
}
