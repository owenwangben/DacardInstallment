export interface AllCardsRq {
    // 身分證字號
    UID: string;
    // 是否排除公司卡
    IsExcludeBusinessCard?: Boolean
    // 是否查詢 Debit Card
    IsQueryDebitCard?: Boolean
    // 是否包含 Debit Card 卡片資料。若要查詢信用卡及 Debit Card 卡片資料，請傳 true，預設值為 false。
    IsContainDebitCard?: Boolean;
    // 是否取得卡種資料
    IsGetCardBrand?: Boolean;
}

export interface AllCardsRs {
    Items: Array<CardItem>;
}

export interface CardItem {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // 卡面代碼
    CardFace: string;
    // 卡別
    ProductCode: string;
    // 有效期限 - 欄位格式【MMYY】
    ExpDate: string;
    // 卡別(M、V、J、A)
    CardBrand: string;
}

export interface CardStatusRq {
    //身分證字號
    ID: string;
    //是否包含Debit卡
    IsIncludeDebitCard?: boolean;
}

export interface CardStatusRs {
    //卡片清單
    Items: Array<CardStatusItem>;
}

export interface CardStatusItem {
    // 排序索引
    OrderIndex: number
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // TYPE，主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // EMBOSSING_TYPE
    CardFace: string;
    // PROD_CODE，卡別
    ProductCode: string;
    // 有效期限 - 欄位格式【MMYY】
    ExpDate: string;
    // 卡別(M、V、J、A
    CardBrand: string;
    // 是否已製卡 true:已製卡 ; false:未製卡
    IsEmbossed?: boolean;
    // 是否已開卡 true:已開卡 ; false:未卡開
    IsActivated?: boolean;
    // 啟用註記 空白:無 1.已啟用 2.啟用日已過期
    VCard?: string;
    // 是否為虛實卡(1碼，空白:否; 1:是)
    VIREAL?: string;
    // 顯示啟用按鈕 true:顯示按鈕 ; false:隱藏按鈕 當VCard= 1 || 2 隱藏
    showVCardBtn?: boolean,
    // 是否已啟用 true:已啟用 當VCard = 1 = true ; false:未啟用
    IsVCard?: boolean;
    // 是否是可以啟用的虛實卡
    IsVIREAL?: boolean;
    // 申請編號
    ApplyNo: string;
    // 申請狀態 狀態甲內卡片申辦進度訊息
    StatusDesc: string;
    // 申請進度說明
    StatusMemo: string;
    // 申請進度狀態碼
    StatusCode: string;
    // 申請進度狀態日
    StatusDate: string;
    // 補件狀態碼
    DocStatus: Array<string>;
    // 客服訊息
    ServiceMessages: Array<string>;
    // 缺補件訊息
    UploadFileMessages: Array<string>;
    // 下載聲明書訊息 有值時顯示狀態甲線上補件按鈕
    DownloadFileMessages: Array<string>;
    //
    ProductType: string;
    // 卡片圖檔名稱
    CardFaceURL: string;
    // ApplePay加卡狀態 (iphone) true:已加卡 false:未加卡
    IsApplePay_iphone?: boolean;
    // ApplePay加卡資訊 (iphone)
    ApplePayItem_iphone?: ApplePayWalletItem;
    // ApplePay加卡狀態 (Apple Watch) true:已加卡 false:未加卡
    IsApplePay_watch?: boolean;
    // ApplePay加卡資訊 (Apple Watch)
    ApplePayItem_watch?: ApplePayWalletItem;
    // 卡別 當卡片為 幣倍卡 = dcur、大戶卡 = dawho、sport卡 = sport
    cardtype: string;
}

export interface CardStatus2Rs {
    //卡片清單
    Items: Array<CardStatus2Item>;
}

export interface CardStatus2Item {
    // 排序索引
    OrderIndex: number
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // TYPE，主附卡代碼
    CardTypeCode: string;
    // 主卡或附卡
    CardTypeDesc: string;
    // EMBOSSING_TYPE
    CardFace: string;
    // PROD_CODE，卡別
    ProductCode: string;
    // 有效期限 - 欄位格式【MMYY】
    ExpDate: string;
    // 卡別(M、V、J、A
    CardBrand: string;
    // 是否已製卡 true:已製卡 ; false:未製卡
    IsEmbossed?: boolean;
    // 是否已開卡 true:已開卡 ; false:未卡開
    IsActivated?: boolean;
    // 啟用註記 空白:無 1.已啟用 2.啟用日已過期
    VCard?: string;
    // 是否為虛實卡(1碼，空白:否; 1:是)
    VIREAL?: string;
    // 顯示啟用按鈕 true:顯示按鈕 ; false:隱藏按鈕 當VCard= 1 || 2 隱藏
    showVCardBtn?: boolean,
    // 是否已啟用 true:已啟用 當VCard = 1 = true ; false:未啟用
    IsVCard?: boolean;
    // 是否是可以啟用的虛實卡
    IsVIREAL?: boolean;
    // 申請編號
    ApplyNo: string;
    // 申請狀態 狀態甲內卡片申辦進度訊息
    StatusDesc: string;
    // 申請進度說明
    StatusMemo: string;
    // 申請進度狀態碼
    StatusCode: string;
    // 申請進度狀態日
    StatusDate: string;
    // 補件狀態碼
    DocStatus: Array<string>;
    // 客服訊息
    ServiceMessages: Array<string>;
    // 缺補件訊息
    UploadFileMessages: Array<string>;
    // 下載聲明書訊息 有值時顯示狀態甲線上補件按鈕
    DownloadFileMessages: Array<string>;
    //
    ProductType: string;
    // 卡片圖檔名稱
    CardFaceURL: string;
    // ApplePay加卡狀態 (iphone) true:已加卡 false:未加卡
    IsApplePay_iphone?: boolean;
    // ApplePay加卡資訊 (iphone)
    ApplePayItem_iphone?: ApplePayWalletItem;
    // ApplePay加卡狀態 (Apple Watch) true:已加卡 false:未加卡
    IsApplePay_watch?: boolean;
    // ApplePay加卡資訊 (Apple Watch)
    ApplePayItem_watch?: ApplePayWalletItem;
    // 卡別 當卡片為 幣倍卡 = dcur、大戶卡 = dawho、sport卡 = sport、現金回饋卡 = cash、三井卡 = mitsui
    cardtype: string;
    // 掛失註記, "Y": 掛失30天內
    XferFlag: string;
    // 手機變更註記, "Y": 手機變更30天內
    MobileFlag: string;
    // 是否可申請急需用卡
    CanApplyUrgentCase: boolean;
    // 補件代碼
    LetterCode: string;
    //地址異動註記, "Y"：地址異動30天內
    AddrMaint: string;
    //(空白:無限制 1:不可掛補 2:不可毀補 3:不可掛補及毀補)
    Reissue: string;
    /** 開卡狀態 - 1：新卡未開卡 2：舊卡開/新卡未開 3：新舊卡皆未開 4：無開卡檔 */
    Spac: string;
    //是否為Debit卡
    IsDebitCard: boolean;
}

export interface ApplePayWalletItem {
    // ApplePay加卡虛擬卡後4碼
    DANS: string;
    // ApplePay加卡裝置來源
    APDevice: string;
}

// 更新卡片排序列表 - 請求內容
export interface UpdateOrderedCardListRq {
    // 身分證字號
    ID: string;
    // 卡片清單
    cards: Array<OrderedCard>;
}

// 排序的卡片
export interface OrderedCard {
    // 排序索引
    orderIndex: number;
    // 卡號
    cardNo: string;
}

// 更新卡片排序列表 - 回應結果
export interface UpdateOrderedCardListRs {
}

// 查詢手機號碼 - 請求內容
export interface QueryMobileRq {
    // 身分證字號
    ID: string;
}

// 查詢手機號碼 - 回應結果
export interface QueryMobileRs {
    // 手機號碼
    Mobile: string;
    // 手機號碼 Hash 值
    SessionKey: string;
}

// 產生動態密碼 - 請求內容
export interface GenerateOTPRq {
    // 身份證字號
    ID: string;
    // 手機號碼
    mobile: string;
    // 功能代碼
    // 卡片綁定：101
    // 卡片啟用：22
    functionCode: number;
    /**
     * 是否需要先檢查 OTP 是否已過期
     */
    RequireCheckTimeout: boolean;
    // 手機號碼 Hash 值
    SessionKey: string;
}

// 產生動態密碼 - 回應結果
export interface GenerateOTPRs {
}

// 驗證動態密碼 - 請求內容
export interface VerifyOTPRq {
    // 功能代碼
    // 卡片綁定：101
    // 卡片啟用：22
    functionCode: number;
    // 身份證字號
    ID: string;
    // 動態密碼
    otp: string;
}

// 驗證動態密碼 - 回應結果
export interface VerifyOTPRs {
    // 驗證失敗次數
    VerifyFailCount?: number;
    // 是否已達錯誤次數上限
    HasReachedMaxTries?: boolean;
}

// 取得卡片上英文姓名 - 請求內容
export interface GetEnglishNameRq {
    // 卡片 (卡號)
    CARD: string;
}

// 取得卡片上英文姓名 - 回應結果
export interface GetEnglishNameRs {
    // 英文姓名
    EName: string;
}

// 取得卡片資訊 - 請求內容
export interface QueryCardInfoRq {
    // 卡號
    CardNo: string;
    // 身分證字號
    ID: string;
}

// 取得卡片資訊 - 回應內容
export interface QueryCardInfoRs {
    // 信用卡安全碼
    CVV2: string;

    /**持卡人中文姓名 */
    CardHolderCName: string;

    /**持卡人英文姓名 */
    CardHolderEName: string;

    /**電子票證 */
    ElectronicTicketName: string;

    /**電子票證號碼 */
    ElectronicTicketNo: string;
}

// 取得帳單地址與電話資訊 - 請求內容
export interface GetContactInfoRq {
    // 身分證字號
    ID: string;
}

// 取得帳單地址與電話資訊 - 回應內容
export interface GetContactInfoRs {
    /** 手機號碼 */
	Mobile?: string;
	/** 家中電話 */
	HomeTel?: string;
	/** 公司電話 */
	CompanyTel?: string;
	/** 戶籍電話 */
	ResidenceTel?: string;
	/** 帳單寄送指示 1：家中　2：公司　3：戶籍 */
	AddrInd?: string;
	/** 家中郵遞區號 */
	HomeZip?: string;
	/** 公司郵遞區號 */
	CompanyZip?: string;
	/** 戶籍郵遞區號 */
	ResidenceZip?: string;
	/** 家中地址 */
	HomeAddress?: string;
	/** 公司地址 */
	CompanyAddress?: string;
	/** 戶籍地址 */
	ResidenceAddress?: string;
	/** 公司名稱 */
	CompanyName?: string;
}
