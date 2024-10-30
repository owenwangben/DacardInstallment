export interface QueryVerifiyRecordRq {
    /**裝置職別碼 */
    DeviceId: string;
    /**交易識別碼*/
    TractionId?: string;
}

export interface QueryVerifiyRecordRs {
    Items: VerifyRecord[];
}

export class VerifyRecord {
    /**交易識別碼*/
    TractionId: string;
    /**驗證類型：(購物中綁卡;網路交易OTP;驗證卡號;純綁卡) */
    Type: string;
    /**卡別(信用卡/儲值卡/簽帳金融卡)  */
    CardType?: string;
    /**	卡號末四碼 */
    CardNoLast4?: string;
    /**	支付金額 */
    Amt: string;
    /**	幣別名稱(中文) */
    CurrencyName?: string;
    /**幣別代碼 */
    CurrencyCode?: string;
    /**驗證時間 */
    VerifyTime: string;
    /**驗證結果*/
    VerifyResult: string;
    /**none */
    ClientIP: string;
    /** 資料建立的分鐘數 , debug 用 */
    Minutes?: number;
    /** 是否已超過可驗證的時效 */
    IsTimeout?: boolean;
    /** 是否為本人 */
    AuthType?: string;
}

export interface VerifiyCompleteRq {
    /**裝置職別碼 */
    DeviceId: string;
    /**驗證結果(1:成功; 2:失敗; 3:取消) */
    VerifyResult: number;
    /**交易識別碼 */
    TractionId: string;
    /**交易確認類型(1:本人; 2:非本人) */
    ConfirmType: number ;
}

export interface VerifiyCompleteRs {}
