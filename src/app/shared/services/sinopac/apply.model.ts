// 線上開卡_未登 Request
export interface CardActivateRq {
    //信用卡號
    CardNo: string;
    // 出生年月日
    BOD_YYYYMMDD: string;
    // 卡片效期
    ValidDate_MMYY: string;
    /** 會員身分 */
    Verify_Method: string;
}

// 線上開卡_已登 Request
export interface CardActivateSsoRq {
    //信用卡號
    CardNo: string;
    // 出生年月日
    BOD_YYYYMMDD: string;
    // 卡片效期
    ValidDate_MMYY: string;
    // 身分證字號
    ID: string;
    /** 會員身分 */
    Verify_Method: string;
}

// 線上開卡 Response
export interface CardActivateRs {
    // 卡別
    CardType: string;
    // 是否為 LINE 點數卡
    IsLinePointCard: boolean;
}

export interface StatusInquiryRq {
    // 身分證字號
    ID: string;
    // 出生月日(MMDD)
    BIRTHDAY: string
}

export interface StatusInquirySsoRq {
    // 身分證字號
    ID: string;
}

export interface StatusInquiryRs {
    // 卡片申請狀態清單
    Items: Array<StatusInquiryItem>;
    // 是否可以催件
    CanApplyUrgentCase: boolean;
}

export interface StatusInquiryItem {
    // 卡別
    CARD_TYPE: string;
    // 狀態別
    STATUS: string;
    // 狀態日(欄位格式【YYYYMMDD】)
    STATUS_DATE: string;
    // 卡片狀態中文描述
    STATUS_DESC: string;
    // 卡面(3碼)
    EBOSSING_TYPE: string;
    // 出生月日
    BIRTHDAY: string;
    // 卡片名稱
    CARD_DESC: string;
    // 補件狀態
    DOC_STATUS: string[];
    // 客服訊息
    ServiceMessages: string[];
    // 缺補件訊息
    UploadFileMessages: string[];
    // 申請編號
    APPLNO: string;
    // 說明
    Memo: string;
    // 下載聲明書訊息
    DownloadFileMessages: string[];
    // 卡片圖檔路徑
    CardFaceURL: string;
    // 補件代號
    LetterCode: string;
}

export interface WorkflowRq {
    // 身分證字號
    ID: string;
    // 急需用卡描述 原因 + (說明)
    Description: string
}

export interface CompleteUploadRq {
    // 身分證字號
    ID: string;
    // 補件檔案識別碼
    FileIds: string[]
}

// 查詢優先啟用碼卡號資訊 - 請求內容
export interface QueryPriorActivateCardInfoRq {
    // 身份證字號
    ID: string;
    // 卡別
    typeFace: string;
}

// 查詢優先啟用碼卡號資訊 - 回應結果
export interface QueryPriorActivateCardInfoRs {
    // 卡片清單
    Items?: Array<PriorActivateCardInfo>;
}

// 優先啟用碼卡號資訊
export interface PriorActivateCardInfo {
    // 核卡日(YYYY/MM/DD)
    ApproveDate?: string;
    // 優先啟用碼失效日(YYYY/MM/DD)
    PriorActivateExpDate?: string;
    // 卡片名稱
    CardName?: string;
    // 國際組織/卡別
    CardTypeName?: string;
    // 卡號
    CardNo?: string;
    // 有效期限 - 欄位格式【MMYY】
    ExpDate?: string;
    // 信用卡安全碼
    CVV2?: string;
    // 中文姓名
    CName?: string;
    // 英文姓名
    EName?: string;
    // 卡人永久信用額度
    PermanentCreditLimit?: number;
    // 卡片目前額度
    CreditLimit?: number;
    // 是否已開卡
    IsActived?: boolean;
    // 卡片可用餘額
    CreditAvailable?: number;
    // 卡別
    ProductCode?: string;
    // 卡面
    CardFace?: string;
    // 電子郵件地址
    Email?: string;
    // 是否已優先啟用
    IsPriorActivated?: boolean;
    // 卡片圖檔路徑
    CardFaceURL: string;
}

// 虛實卡啟用(優先啟用碼) - 請求內容
export interface PriorActivateCardRq {
    // 身份證字號
    ID: string;
    // 卡別 (3碼數字)
    CARD_TYPE: string;
    // 卡樣 (3碼數字)
    CARD_FACE: string;
    // 卡號 (16碼)
    cardNo: string;
    /** 會員身分 */
    Verify_Method: string;
}

// 虛實卡啟用(優先啟用碼) - 回應結果
export interface PriorActivateCardRs {
}

// 查詢可掛失卡片清單 - 請求內容
export interface QueryLostCardsRq {
    // 身分證字號
    ID: string;
    // 卡別
    ProductCode: string;
    // CardFace
    CardFace: string;
}

// 查詢可掛失卡片清單 - 回應結果
export interface QueryLostCardsRs {
    // 是否為VIP
    IsVip: boolean;
    // 卡片清單
    Items: Array<LostCard>;
}

// 卡片清單
export interface LostCard {
    // 卡別
    ProductCode: string;
    // CardFace
    CardFace: string;
    // 卡片名稱
    Name: string;
    // 卡片類別
    CardBrand: string;
    // 卡片圖檔連結
    CardFaceURL: string;
    // 卡片明細
    Cards: Array<LostCardItem>;
}

// 卡片資訊
export interface LostCardItem {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // 卡別
    ProductCode: string;
    // CardFace
    CardFace: string;
    // 卡片類別
    CardBrand: string;
    // 持卡人姓名
    CardHolderName: string;
    /** 有效日期 */
    ExpDate: string
}

// 申請信用卡掛失 - 請求內容
export interface ApplyLostCardsRq {
    // 身分證字號
    ID: string;
    // 掛失卡號清單
    Cards: Array<string>;
}

// 申請信用卡掛失 - 回應結果
export interface ApplyLostCardsRs {
    // 申請日期
    ApplyDate: string;
    // 卡片名稱
    Name: string;
    // 卡別
    CardBrand: string;
    // 掛失卡片清單
    Cards: Array<LostCardList>;
    // 是否免手續費
    NoHandlingFee: boolean;
    // 24小時內是否有交易紀錄
    HasTransactionHistory: boolean;
}
// 掛失卡片清單
export interface LostCardList {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // 卡別
    ProductCode: string;
    // CardFace
    CardFace: string;
    // 卡別
    CardBrand: string;
    // 持卡人姓名
    CardHolderName: string;
    /** 有效期限 */
    ExpDate: string;
    // 是否申請成功
    IsSuccess: boolean;
    IsValid: boolean;
}

// 查詢卡片交易設定狀態 - 請求內容
export interface QueryCardDealSettingInfoRq {
    // 信用卡卡號
    CardNo: string;
    // 卡別
    CARD_TYPE: string;
}

// 查詢卡片交易設定狀態 - 回應內容
export interface QueryCardDealSettingInfoRs {
    // 暫停所有交易
    BLOCK_ALL: string;
    // 國內實體交易
    BLOCK_L_P: string;
    // 國內線上交易
    BLOCK_L_O: string;
    // 國外實體交易
    BLOCK_F_P: string;
    // 國外線上交易
    BLOCK_F_O: string;
    // 單筆交易額度
    LIMIT_AMT: number;
}

// 設定卡片交易設定狀態 - 請求內容
export interface CardDealSettingRq {
    // 身分證字號
    ID: string;
    // 信用卡卡號
    CardNo: string;
    // 卡別
    CARD_TYPE: string;
    // 暫停所有交易
    BLOCK_ALL: string;
    // 國內實體交易
    BLOCK_L_P: string;
    // 國內線上交易
    BLOCK_L_O: string;
    // 國外實體交易
    BLOCK_F_P: string;
    // 國外線上交易
    BLOCK_F_O: string;
    // 單筆交易額度
    LIMIT_AMT: number;
}

// 設定卡片交易設定狀態 - 回應內容
export interface CardDealSettingRs {

}

// 取得換發資訊 - 請求內容
export interface QueryCardReissueRq {
    // 身分證字號
    ID: string;
    // 換發原因 1：掛補；2：毀補
    Type: string;
    // 卡別
    ProductCode: string;
    //Card Face
    CardFace: string;
}

// 取得換發資訊 - 回應結果
export interface QueryCardReissueRs {
    //現居地址
    HomeAddress: string;
    //公司地址
    CompanyAddress: string;
    //戶籍地址
    ResidentAddress: string;
    //補發卡片清單
    Items: Array<ReissueCard>
}
// 補發-卡片清單
export interface ReissueCard {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    //正附卡代碼
    CardTypeCode: string;
    //正卡或附卡
    CardTypeDesc: string;
    //卡別
    ProductCode: string;
    //Card Face
    CardFace: string;
    //卡別(M、V、J、A)
    CardBrand: string;
    //持卡人姓名
    CardHolderName: string;
    /** 有效期限 */
    ExpDate: string;
}

// 申請換發資訊 - 請求內容
export interface ApplyCardReissueRq {
    // 身分證字號
    ID: string;
    // 換發原因 1：掛補；2：毀補
    Type: string;
    //卡別
    ProductCode: string;
    //Card Face
    CardFace: string;
    // 換發原因(毀補)1：個人因素 2：卡片毀損 3：卡片脫模 4：晶片毀損
    ReasonCode: string;
    //寄送地址 1:現居 2:公司 3: 戶籍
    AddressType: string;
    //補發卡片清單 掛補:傳入所有要補發的正附卡 毀補:傳入該張卡
    Cards: { CardNo: string, ExpDate: string, CardTypeCode: string }[]
}

// 申請換發資訊 - 回應結果
export interface ApplyCardReissueRs {
    //申請日期
    ApplyDate: string;
    //寄送地址
    Address: string;
    //卡片清單(包含正附卡)
    Items: Array<ApplyReissueCard>;
}

//申請補發- 卡片清單狀況回傳
export interface ApplyReissueCard {
    // 卡號
    CardNo: string;
    // 主附卡代碼
    CardTypeCode: string;
    //是否申請成功
    IsSuccess: boolean;
}

//檢查換補發申請次數限制 -請求內容
export interface CardReissueCheckRq {
    // 身分證字號
    ID: string;
    // 卡別
    ProductCode: string;
    //Card Face
    CardFace: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 換補發類型 1：掛補；2：毀補
    ReissueType: string;
}

//檢查換補發申請次數限制 -回應結果
export interface CardReissueCheckRs {

}
