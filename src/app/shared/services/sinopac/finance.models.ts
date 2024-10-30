export interface UnsettledInstallmentRecordRq {
    // 身分證
    ID: string;
}

export interface UnsettledInstallmentRecordRs {
    /**分期未到期總額 */
    TotalAmount: number;

    /**未到期清單 */
    Items: UnsettledInstallmentRecordItem[];
}

export interface UnsettledInstallmentRecordItem {
    /**項目說明 */
    ITEM: string;

    /**交易日/帳單日 (YYYYMMDD) */
    TXDATE: string;

    /**卡別 */
    CARD_DESC: string;

    /**應繳金額 */
    AMT: number;

    /**未到期本期金餘額 */
    INST_AMT: number;

    /**備註 */
    MEMO: string;
}

export interface StmtInstallmentApplyRecordRq {
    /**身分證字號 */
    ID: string;

    /**查詢起日 */
    BeginDate: string;

    /**查詢迄日 */
    EndDate: string;
}

export interface StmtInstallmentApplyRecordRs {
    Items: StmtInstallmentApplyRecord_ITEM[];
}

export interface StmtInstallmentApplyRecord_ITEM {
    /**主卡人ID */
    PID: string;
    /**申請日期 */
    ApplyDate: Date | string;
    /**申請方式 */
    Channel: string;
    /**帳單總應繳金額 */
    StmtAmt: number;
    /**帳單最低應繳金額 */
    StmtMinAmt: number;
    /**可分期金額 */
    InstallmentAmt: number;
    /**分期利率 */
    Rate: number;
    /**手續費 */
    Fee: number;
    /**首期月付金 */
    FirstPeriodAmt: number;
    /**分期期數 */
    Period: number;
    /**訂單狀態(【0, 1, 2】：處理中,【5】：已完成,【6】：申請失敗) */
    Status: string;
    /**訂單狀態對應圖示URL (僅前端使用) */
    StatusUrl: string;
}
