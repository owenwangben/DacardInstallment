/** 最新消費資料 - 請求內容 */
export interface LatestTxRq {
    /** 身份證字號 */
    ID: string;
    /** 是否包含公司卡 */
    IsIncludeBusinessCard?: boolean;
}

// 最新消費資料 - 回應結果
export interface LatestTxRs {
    // 是否為公司戶
    isCompanyUser: boolean;
    /// 最新消費資料明細
    Items: Array<LatestTxItem>;
}

/** 最新消費記錄 */
export interface LatestTxItem {
    /** 正附卡註記 : 1 正卡;2 附卡 */
    cardFlag: string;
    /** 卡號 */
    CardNo: string;
    /** 卡號後四碼 */
    CardLast4: string;
    /** 卡片名稱 */
    CardName: string;
    /** 是否為手機信用卡 */
    IsMobileCard?: boolean;
    /** 授權日期 */
    AuthDate: string;
    /** 授權時間 */
    AuthTime?: string;
    /** 消費類別/商店名稱 */
    Memo: string;
    /** 授權金額 */
    AuthAmt: string;
    /** 授權金額描述 */
    AuthAmtDesc: string;
    /** 消費國別 */
    CountryCode: string;
    /** 授權結果 */
    AuthResult: string;
    /** 卡別索引(無卡片名稱歸類在同一個索引) */
    CardIdx: string
    /** 幣別代碼 */
    CurrencyCode: string
    /** 中文幣別 */
    CurrencyCName: string
    /** 英文幣別 */
    CurrencyEName: string
    /** 顯示用授權金額(僅html使用，非API回傳) */
    AuthAmtView: string;
}

// 取得帳單分期資料 - 請求內容
export interface StmtInstallmentDataRq {
    // 身分證字號
    ID: string;
}

// 取得帳單分期資料 - 回應結果
export interface StmtInstallmentDataRs {
    // 是否有設定分期總約
    IsSignedInstallmentAgreement: boolean;
    // 身分證字號
    PID: string;
    // 符合名單
    MFPCode: string;
    // 符合BASE
    BaseMFPcode: string;
    // 帳單截止日
    StmtDate: string;
    // 繳款截止日
    DueDate: string;
    // 本期應繳總金額
    StmtAmt: number;
    // 本期最低應繳金額
    StmtMinAmt: number;
    // 可分期金額
    InstallmentAmt: number;
    // 利率資料
    Rates: Array<StmtInstallmentRatesItem>;
}

// 取得帳單分期資料
export interface StmtInstallmentRatesItem {
    // 期數
    Period: number;
    // 利率
    Rate: number;
    // 手續費
    Fee: number;
    // BASE註記
    BaseFlag: string;
}

// 設定消費分期約定事項 - 請求內容
export interface InstallmentAgreementRq {
    // 身分證字號
    ID: string;
}

// 設定消費分期約定事項 - 回應結果
export interface InstallmentAgreementRs {
    // 是否成功
    Success: boolean;
}

// 取得試算表 - 請求內容
export interface EasyCashCalcCycleFeeRq {
    // 申貸本金
    LoanAmt: number;
    // 期數
    Period: number;
    // 年利率
    AnnRate: number;
    // 手續費
    ProcessFee: number;
}

// 取得試算表 - 回應結果
export interface EasyCashCalcCycleFeeRs {
    Items: Array<EasyCashCalcCycleFeeItem>;
}

// 取得試算表
export interface EasyCashCalcCycleFeeItem {
    // 期數
    SEQ: string;
    // 每月應付本息金額
    MonthPayment: string;
    // 利息
    Interest: string;
    // 本金
    PrincipalAmount: string;
    // 總費用年百分率
    IRR: string;
}

// 申請帳單分期 - 請求內容
export interface ApplyStmtInstallmentRq {
    // 身份證字號
    ID: string;
    // 符合名單
    MFPCode: string;
    // 符合BASE
    BaseMFPcode: string;
    // 帳單日
    StmtDate: string;
    // 繳款截止日
    DueDate: string;
    // 當期應繳總金額
    StmtAmt: number;
    // 當期最低應繳
    StmtMinAmt: number;
    // 首期應繳金額
    FirstPeriodAmt: number;
    // 可分期金額
    InstallmentAmt: number;
    // 期數
    Period: number;
    // 利率
    Rate: number;
    // 總費用年百分率
    IRR: number;
    // 手續費
    Fee: number;
    // 推薦人員編
    Referrer: string;
    // 驗證方式(MMA/OTP)，大咖沒有未登入情況，故都傳MMA
    Verify_Method: string;
}

// 申請帳單分期 - 回應結果
export interface ApplyStmtInstallmentRs {
    // 是否申請成功
    Success: boolean;
    // 交易編號
    RefNo: string;
}

// 取得可申請分期之已請款交易 - 請求內容
export interface GetInstallmentDataRq {
    // 身分證字號
    ID: string;
    // 消費類別
    TransactionType: number;
}

// 取得可申請分期之已請款交易 - 回應結果
export interface GetInstallmentDataRs {
    // 是否有設定分期總約
    IsSignedInstallmentAgreement: boolean;
    // 是否可做分期
    CanApplyInstallment: boolean;
    // 可分期資料
    Items: Array<GetInstallmentDataItem>;
}

// 取得可申請分期之已請款交易Item
export interface GetInstallmentDataItem {
    // 交易日期
    TransactionDate: string;
    // 是否入帳
    IsTCTD: boolean;
    // 入帳日期
    DeDate: string;
    // 交易金額
    Amount: string;
    // 交易明細
    Memo: string;
    // 是否已申請分期
    IsAlreadyInstallment: boolean;
    //
    AuthCode: string;
    // 信用卡卡號
    CardNumber: string;
    //
    MCC: string;
    //
    MerchNumber: string;
    // 是否首次分期
    FirstFlag: string;
    // 分期狀態
    InstallmentStatus: string;
    // 簽單編號
    SalRef: string;
    // 交易幣別
    TXCUR: string;
    // 消費地區
    MerchArea: string;
}

// 驗證分期資料並取得各期利率資料 - 請求內容
export interface InstallmentApplyCheckRq {
    // 身分證字號
    ID: string;
    // 信用卡卡號
    CardNumber: string;
    //
    AuthCode: string;
    // 交易日期
    TxDate: string;
    // 入帳日期
    DeDate: string;
    //
    MerchantNo: string;
    //
    MCC: string;
    // 交易金額
    Amount: number;
    // 交易明細
    Memo: string;
    // 是否首次分期
    FirstFlag: string;
    // 是否入帳
    IsTCTD: boolean;
}

// 驗證分期資料並取得各期利率資料 - 回應結果
export interface InstallmentApplyCheckRs {
    Items: Array<InstallmentApplyCheckItem>;
}

// 驗證分期資料並取得各期利率資料Item
export interface InstallmentApplyCheckItem {
    // 分期大類碼
    ProgramCode: string;
    // 分期產品代碼
    ProductCode: string;
    // 分期期數
    Period: number;
    // 利率
    Rate: number;
    // 開辦費
    FirstAmt: string;
    // 專案
    Program: string;
    // 說明
    Desc: string;
}

// 申請單筆分期 - 請求內容
export interface InstallmentApplyRq {
    // 身分證字號
    ID: string;
    // 是否入帳
    IsTCTD: boolean;
    // 交易金額
    Amount: number;
    // 信用卡卡號
    CardNumber: string;
    //
    AuthCode: string;
    // 交易日期
    TransactionDate: string;
    // 入帳日期
    DeDate: string;
    // 交易明細
    Memo: string;
    // 選擇的分期期數
    Period: string;
    // 選擇期數的專案代碼
    Program: string;
    // 選擇期數的分期產品代碼
    ProductCode: string;
    // 利率
    Rate: string;
    // 選擇期數的手續費
    FirstAmt: string;
    // 簽單編號
    SalRef: string;
    // 推薦人員編
    Referrer: string;
    // 驗證方式(MMA/OTP)，大咖沒有未登入情況，故都傳MMA
    Verify_Method: string;
    // 消費類型代碼
    MCC: string;
    // 交易幣別
    TXCUR: string;
    // 消費地區
    MerchArea: string;
}

// 取得永調資訊 - 請求內容
export interface GetPermanentCreditInfoRq {
    // 身份證字號
    ID: string;
    //簡訊邀請種類 初始值：0,免財力版：1,財力版：2
    SmsType: number;
}

// 取得永調資訊 - 回應結果
export interface GetPermanentCreditInfoRs {
    // 客戶姓名
    Name: string;
    // 生日(用於MyData)
    Birthday: string;
    // 原始信用額度
    OriginalCredit: number;
    // 永久可用額度
    PermanentAvailableCredit: number;
    // 現居地址
    HomeAddress: string;
    // 戶籍地址
    ResidentAddress: string;
    // 是否為簡訊邀請名單
    IsSmsList: boolean;
    // 是否需要財力證明(簡訊邀請專用。false: 免財力版；true: 財力版)
    IsRequireFinancialProof?: boolean;
    // 預設的申請增加額度(簡訊邀請名單提供的預設值)
    DefaultIncreaseCredit?: number;
}

// 信用卡永久信用額度調整 - 申請永調
export interface PermanentAdjustApplyRs {
    // 身份證字號
    ID: string;
    // 原始信用額度(以千元為單位)
    OriginalCredit: string;
    // 申請調整後額度(以千元為單位)
    AdjustLimit: string;
    // 原因碼（值為 "01" ~ "06"）
    ReasonCode: string;
    // 其他原因說明
    ReasonDesc: string;
    // 目前服務機構名稱
    Company: string;
    // 是否為永豐銀行理財客戶
    IsFinancialCustomer: boolean;
    // 附件參考序號
    AttachmentRefs: string[];
    //簡訊邀請種類 初始值：0,免財力版：1,財力版：2
    SmsType: number;
    // 財力證明種類 永豐銀行理財客戶：1,財力或其他證明文件：2,不動產謄本：3,MyData：4
    FinancialProofType: number;
    //不動產謄本地址別 同現居地：1,同戶籍地：2,其他：3
    LandRegisterAddressType: number;
    // 不動產謄本地址
    LandRegisterAddress: string;
}

// 信用卡永久信用額度調整 - 申請永調 狀態回傳
export interface PermanentAdjustApplyRq {
    // 交易編號
    RefNo: string;
}



// 申請單筆分期 - 回應結果
export interface InstallmentApplyRs {
    // 交易編號
    RefNo: string;
    // 核身Session Key
    AuthKeys: Array<string>;
    // 是否清除核身資料
    IsClearAuthData: boolean;
}

// 取得信用卡臨時額度調整資料 - 請求內容
export interface GetTemporaryCreditInfoRq {
    // 身分證字號
    ID: string;
}

// 取得信用卡臨時額度調整資料 - 回應結果
export interface GetTemporaryCreditInfoRs {
    // 行動電話
    ContactMobile: string;
    // 原始信用額度
    OriginalCredit: string;
    // 目前可用餘額
    AvailableCredit: string;
    // 最早的申請起日，非國定假日
    BeginDate: string;
    // 申請迄日，最晚的且非國定假日
    EndDate: string;
    // 取得使用者所有卡片資料
    ApplyCards: Array<ApplyCardsInfo>;
    /** 預設申請迄日 */
	DefaultEndDate?: string;
}

export interface ApplyCardsInfo {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // CardFace
    CardFace: string;
    // 卡別
    ProductCode: string;
    // 有效期限-欄位格式【MMYY】
    ExpDate: string;
    // 卡別(M、V、J、A)
    CardBrand: string;
}

// 申請信用卡臨時額度調整 - 請求內容
export interface ApplyTemporaryCreditRq {
    // 身分證字號
    ID: string;
    // 卡號清單
    CardNoList: string[];
    // 臨調區域
    RegionCode: string;
    // 臨調理由碼（值為 "01" ~ "06"）
    ReasonCode: string;
    // 臨調理由說明
    ReasonDesc: string;
    // 臨調金額
    AdjutLimit: string;
    // 臨調起日 DateTime
    EffDate: Date;
    // 臨調迄日 DateTime
    ExpDate: Date;
    // 聯絡電話
    Tel: string;
    /** 增加額度 */
    AddCredits:  string;
    /** 卡號、卡別清單 */
    CardTypeList: {CardNo:string,CardTyp:string}[];
}

// 申請信用卡臨時額度調整 - 回應結果
export interface ApplyTemporaryCreditRs {
    // 是否成功
    Success: boolean;
    // 交易編號
    RefNo: string;
    // 執行結果
    ResultMessage: string;
}

// 取得預借現金資訊 - 請求內容
export interface GetCashAdvanceApplyInfoRq {
    // 身分證字號
    ID: string;
    // 銀行代號 卡網未使用，API文件為null
    BankCode?: string;
}
// 取得預借現金資訊 - 回應結果
export interface GetCashAdvanceApplyInfoRs {
    // 預現信用額度
    CashLimit: number;
    // 預現可用額度
    CashAvailable: number;
    // 卡片信用額度
    CreditCardLimit: number;
    // 卡片可用餘額
    CreditAvailable: number;
    // 已授權未請款
    AuthAmount: number;
    // 卡片清單
    CardList: CashAdvanceCardInfo[];
    // 他行帳號清單
    BankList: CashAdvanceCardBankInfo[];
    // 最近是否變更手機號碼
    IsChangeMobileNo: boolean;
}
export interface CashAdvanceCardInfo {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // Card Face
    CardFace: string;
    // 卡別
    ProductCode: string;
    // 有效期限-欄位格式【MMYY】
    ExpDate: string;
    // 卡別(M、V、J、A)
    CardBrand: string;
}
export interface CashAdvanceCardBankInfo {
    Id: string;
    Name: string;
    AccountLength: string;
}
// 取得本行可轉帳的帳號清單 - 請求內容
export interface TransferAccountsRq {
    // 身分證字號
    ID: string;
    /**是否為限制特定會員的功能(Ex:大咖預借現金) */
    IsLimitFunction: boolean
}

// 取得本行可轉帳的帳號清單 - 回應結果
export interface TransferAccountsRs {
    Items: TransferAccounts[];
}
export interface TransferAccounts {
    AccountNo: string;
    AccountName: string;
}

/**信用卡臨時額度調整進度查詢 - 請求內容 */
export interface TemporaryCreditApplyRecordRq {
    /**身份證字號 */
    ID: string;
}

/**信用卡臨時額度調整進度查詢 - 回應結果 */
export interface TemporaryCreditApplyRecordRs {
    Items: Array<TemporaryCreditApplyRecorditem>;
}

export interface TemporaryCreditApplyRecorditem {
    /**記錄 */
    RecordID: string;
    /**卡號清單 */
    CardNoList: string[];
    /**臨調區域 */
    RegionCode: string;
    /**臨調理由碼 */
    ReasonCode: string;
    /**臨調理由說明 */
    ReasonDesc: string;
    /**申請金額 */
    TCLimit: string;
    /**臨調起日 */
    EffDate: string;
    /**調額期限(臨調迄日) */
    ExpDate: string;
    /**聯絡電話 */
    Tel: string;
    /**申請狀態 */
    Status: string;
    /**申請日期 */
    ApplyDate: string;
}

// 上傳財力證明 - 請求內容
export interface UploadPermanentCreditAttachmentRq {
    // 身分證字號
    ID: string;
    // 補件檔案識別碼
    FileIds: string[];
}
// 上傳財力證明 - 請求內容
export interface UploadPermanentCreditAttachmentRs {
    // 交易是否成功
    Success: boolean;
    // 交易參考序號
    ReferenceNo: string;
}

/**信用卡永久額度調整進度查詢 - 請求內容*/
export class PermanentAdjustApplyRecordRq {
    /**身份證字號 */
    ID: string;
}
/**信用卡永久額度調整進度查詢 - 回應結果*/
export interface PermanentAdjustApplyRecordRs {
    Items: Array<PermanentAdjustApplyRecorditem>;
}
export interface PermanentAdjustApplyRecorditem {
    /**申請日期 */
    ApplyDate: string;
    /**調整後額度(單位千元) */
    NewLine: number;
    /**調整前額度(單位千元) */
    Line: number;
    /**申請狀態 */
    Status: string;
}

// 線上預借現金申請 - 請求內容
export interface ApplyCashAdvanceRq {
    // 身分證字號
    ID: string;
    // 卡號
    CardNo: string;
    // 有效期限 - 欄位格式【MMYY】
    ExpiryDate: string;
    // 預借現金密碼orOTP
    PIN: string;
    // 轉入行庫代號
    TransBankCode: string;
    // 轉入行庫帳號
    TransAccount: string;
    // 預現金額
    Amount: number;
    // 預借現金密碼類型(1:預借現金密碼; 2:OTP)
    PinType: number;
}

// 線上預借現金申請 - 回應結果
export interface ApplyCashAdvanceRs {
    // 是否成功
    Success: boolean;
    // 交易編號
    RefNo: string;
    // 本行預現：第一段電文(WB22)的結果碼
    ResultCode: string;
    // 本行預現：第一段電文(WB22)的結果訊息
    ResultMessage: string;
    // 本行預現：第二段電文(TRANSAD)的結果碼
    ResultCode2: string;
    // 本行預現：第二段電文(TRANSAD)的結果訊息
    ReusltMessage2: string;
    // 是否為預現密碼或簡訊動態密碼錯誤
    IsPinError: boolean;
}

// 最新消費資料 - 請求內容
export interface getDebitLatestTxRq {
    // 身份證字號
    ID: string;
}

// 最新消費資料 - 回應結果
export interface getDebitLatestTxRs {
    // 卡片資訊
    Cards: Array<DebitLatestTxCard>;

    // 最新消費資料明細
    Items: Array<LatestTxItem>;
}

// Debit卡片資訊
export interface DebitLatestTxCard {
    // 卡片名稱
    CardName: string;
    // 卡號末四碼
    CardLast4: string;
    // 卡別索引(無卡片名稱歸類在同一個索引)
    CardIdx: string;
    // 筆數
    Count: number;
    // 金額小計
    SubTotalAmt: string;
}

// Debit卡片即時消費資訊 - 請求內容
export interface getDebitStatementInquiryRq {
    // 身份證字號
    ID: string;
    // 查詢年月(YYYYMM)
    QueryMonth: string;
}

// Debit卡片即時消費資訊
export interface getDebitStatementInquiryRs {
    // 卡片資訊
    Cards: Array<DebitLatestTxCard>;

    // 最新消費資料明細
    Items: Array<DebitCardStatementInquiryItem>;
}

// Debit卡未扣款金額紀錄
export interface specialRecordViewItem {
    /** 是否顯示 */
    active: boolean;
    /** 卡號 */
    cardNumber: string;
    /** 累積未扣款金額 */
    CumulativeUndebitedAmount: string;
    /** 本期未扣款金額 */
    AmountUndebiteInThisPeriod: string;
}

// Debit卡近期交易資料
export interface DebitCardStatementInquiryItem {
    // 消費日
    TXDATE: string;
    // 扣款日
    DEDATE: string;
    // 卡號末四碼
    CARDNO: string;
    // 卡片名稱
    CARDNAME: string;
    // 卡別索引(無卡片名稱歸類在同一個索引)
    CardIdx: string;
    // 存款帳號(完整帳號)
    ACCOUNT: string;
    // 交易明細說明
    MEMO: string;
    // 臺幣金額
    AMT: string;
    // 外幣折算日
    CURDATE: string;
    // 原幣金額
    TXAMT: string;
    // 未扣款金額
    NOT_DE_AMT: string;
    // 幣別代碼
    CurrencyCode: string;
    // 中文幣別
    CurrencyCName: string;
    // 英文幣別
    CurrencyEName: string;
    // 消費地
    CountryCode: string;
}

// 近期帳單 - 請求內容
export interface RecentBillRq {
    // 身份證字號
    ID: string;
    // 帳單年月(YYYYMM)
    BillDateYYYYMM: string;
    //是否為DACARD APP使用 (愈設為true)
    IsDACARD: boolean;
}

// 近期帳單 - 回應結果
export interface RecentBillRs {
    // 帳單基本資料
    BaseData: BaseData;
    // 帳單金額
    BillAmounts: Array<BillAmounts>;
    //卡片資訊
    Cards: Array<Cards>;
    //自扣訊息
    BillDeductMsgs: Array<string>;
    //紅利點數
    Reward: Reward;
    //消費紀錄
    BillRecords: Array<BillRecords>;
    //預借現金額度
    CashAdvanceInfo: Array<CashAdvanceInfo>;
    //不對稱分期資訊
    AsymmetricInstallmentInfo: Array<AsymmetricInstallmentInfo>;
    //是否為公司戶
    IsCompanyUser: boolean;
    //帳單類別(0:實體訂單,1:電子帳單,2:行動帳單)
    BillType: boolean;
    //是否自扣(Y:是,N:不是)
    DD_FLAG: string;
    //是否符合帳單分期申請資格
    StatementInstallmentApplyCheck: boolean;
    //台幣自扣資訊
    TwdAutoDeductMsg: string;
}

// 近期帳單 - 帳單基本資料
export interface BaseData {
    // 帳單年月(YYYYMM)
    BillDate: string;
    // 結帳日(YYYY/MM//DD)
    STMTDATE: string;
    // 繳款截止日(YYYY/MM/DD)
    DUEDATE: string;
    //是否含保留款
    IsLineCR: boolean;
    //循環利率
    IntRate: string;
    //差跌利率適用截止年月
    IntDate: string;
}

// 近期帳單 - 帳單金額
export interface BillAmounts {
    // 幣別代碼(numeric code)(台幣: 空白; 美元:840; 日圓:392; 歐元:978)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //上期應繳金額
    PREVBAL: string;
    //已繳款繳金額(含保留款)
    PREVPAYAMT: string;
    //本期新增款項
    NEWADDAMT: string;
    //循環利息
    FINCHARGE: string;
    //違約金
    LATECHARGE: string;
    //本期應繳總金額
    CURRBAL: string;
    //本期最低應繳總金額
    CUEAMT: string;
    //預定扣款金額
    DDAMT: string;
    //扣款銀行
    DDBANK: string;
    //扣款帳號
    DDAcountNo: string;
    //
    ACT_LINE_CR: string;
    //最近一次繳款日期
    LastPaymentDate: string;
    //循環利率
    IntRate: number;
    //差別利率適用截止年月
    IntDate: string;
    //最近一次繳款金額
    LastPaymenyAmt: string;
    //本期累計已繳金額(只有台幣才有)
    TotalPaymentAmt: string;
    //繳款記錄
    PaymentRecords:Array<PaymentRecords>
}

// 近期帳單 - 繳款記錄
export interface PaymentRecords {
    //幣別代碼(數字)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //交易日期
    TXDATE: string;
    //入賬日期
    DEDATE: string;
    //消費說明
    MEMO: string;
    //金額
    AMT: number;
}

// 近期帳單 - 卡片資訊
export interface Cards {
    //幣別代碼(數字)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //卡片名稱
    CardName: string;
    //卡號末四碼
    CardLast4: string;
    //卡別索引(無卡片名稱歸類在同一索引)
    CardIdx: string;
    //筆數
    Count: number;
    //金額小計
    SubTotalAmt: string;
}

// 近期帳單 - 紅利點數
export interface Reward {
    // 本期費消費新增點數
    AddPoint: string;
    // 活動調整點數
    AdjustPoint: string;
    // 本期兌換點數
    ExchangePoint: string;
    // 累計可用點數
    TotalPoint: string;
    // 本年度到期點數
    ExpriringPoint: string;
}

// 近期帳單 - 消費紀錄
export interface BillRecords {
    //幣別代碼(數字)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //交易日期
    TXDATE: string;
    //入賬日期
    DEDATE: string;
    //卡號
    CardNo: string;
    //卡片名稱
    CardName: string;
    //卡號末四碼
    CardLast4: string;
    //卡別索引(無卡片名稱歸類在同一索引)
    CardIdx: string;
    //消費說明
    MEMO: string;
    //信用卡幣別(CurrencyCode)的金額
    AMT: string;
    //原始交易幣別的金額
    TXAMT: string;
    //原始交易幣別
    TXCUR: string;
    //外幣折算日
    CURDATE: string;
    //總費用年百分率
    INST_RATE: string;
    //分期未到期金額
    INST_AMT: string;
    //消費地
    COUNTRY: string;
    //TXCode
    TXCode: string;
    //CARD TYPE，3碼
    PROD: string;
    //CARD FACE，3碼
    EMBOSSING_TYPE: string;
    //是否有不對稱分期資料(Y:是)
    AsyInstlInd: string;
}

// 近期帳單 - 預借現金額度
export interface CashAdvanceInfo {
    //您的信用額度
    CredirCardLimit: string;
    //可用金額額度
    CreditAvailable: string;
    //預借金額額度
    CashLimit: string;
    //可用預借金額額度(MMA網站預借現金額度)
    CashAvailable: string;
    //以刷卡為請款金額
    AuthAmount: string;
}

// 近期帳單 - 不對稱分期資訊
export interface AsymmetricInstallmentInfo {
    //消費日
    TXDATE: string;
    // 帳單說明
    MEMO: string;
    //總金額
    AMT: string;
    //分期金額說明
    INSAMT_MEMO: string;
    //繳款金額說明
    PAYAMT_MEMO: string;
}

// 未結帳消費明細 - 請求內容
export interface OutstandingDetailRq {
    // 身份證字號
    ID: string;
    // 是否扣除已繳款金額(預設為true)
    IsExcludePaidUp: boolean;
}

// 未結帳消費明細 - 回應結果
export interface OutstandingDetailRs {
    // 明細
    Detail: Array<Detail>;
    // 小計
    SubTotal:Array<SubTotal>;
    // 卡片資訊
    Cards:Array<Cards>;
    //是否為公司戶
    IsCompanyUser: boolean;
    //是否以扣除已繳款金額
    IsExcluPaidUp: boolean;
    //您的信用額度
    CreditCardLimit: string;
    //可用金額額度
    CreditAvailable: string;
    //結帳日(DD)
    STMTDATE: string;
}

// 未結帳消費明細 - 明細
export interface Detail {
    //幣別代碼(數字)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //身分證字號
    PID: string;
    //CARD_TYPE
    CARD_TYPE: string;
    //卡號
    CardNo: string;
    //卡片名稱
    CardName: string;
    //卡號末四碼
    CardLast4: string;
    //卡別索引(無卡片名稱歸類在同一索引)
    CardIdx: string;
    //交易日期
    TXDATE: string;
    //入賬日期
    DEDATE: string;
    //
    TXCODE: string;
    //消費說明
    MEMO: string;
    //信用卡幣別(CurrencyCode)的金額
    AMT: string;
    //原始交易幣別的金額
    TXAMT: string;
    //原始交易幣別
    TXCUR: string;
    //CARD TYPE，3碼
    PROD: string;
    //CARD FACE，3碼
    EMBOSSING_TYPE: string;
}

// 未結帳消費明細 - 小計
export interface SubTotal {
    //幣別代碼(數字)(台幣: 空白; 美元:840; 日圓:392; 歐元:978)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    // 筆數
    Count: number;
    //累計金額(SubTotalAmt)=AMT欄位職加總。若為台幣(ORG=="000")，則不顯示小數，否則顯示兩位小數
    SubTotalAmt: string;
}

// 繳費紀錄 - 請求內容
export interface PaymentRecordsRq {
    // 身份證字號
    ID: string;
    //近幾個月的繳費紀錄
    LastMonths: number;
}

// 繳費紀錄 - 回應結果
export interface PaymentRecordsRs {
    // 繳費明細
    Items: Array<PaymentRecordsItems>;
}

// 繳費紀錄 - 繳費明細
export interface PaymentRecordsItems {
    //幣別代碼(數字)
    CurrencyCode: string;
    // 幣別名稱
    CurrencyName: string;
    //英文幣別代碼
    CurrencyAlphaCode: string;
    //交易日期
    TXDATE: string;
    //入賬日期
    DEDATE: string;
    //消費說明
    MEMO: string;
    //金額
    AMT: number;
}
