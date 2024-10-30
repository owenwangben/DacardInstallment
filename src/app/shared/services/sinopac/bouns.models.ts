export const InquiryTypeOptions = [
    {
        Type: '6',
        Name: '幣倍卡現金回饋查詢'
    },
    {
        Type: '5',
        Name: '大戶卡現金回饋查詢'
    },
    {
        Type: '293301',
        Name: 'SPORT卡豐點回饋查詢'
    }
];

// 查詢回饋資料 - 請求內容
export interface QueryFeedbackRq {
    // 身份證字號
    ID: string;
    // 資料年月(YYYYMM)
    period: string;
    // 來源(1: MMA)
    source?: string;
}

// 查詢幣倍卡回饋資料 - 回應結果
export interface QueryFeedbackRs {
    // 回饋等級(懂匯、超匯、卡匯)
    level?: string;
    // 回饋金額 - 回饋項目的回饋金額小計
    Summary?: Array<FeedbackSummary>;
    // 總回饋金額
    TotalFeedbackAmt?: string;
    // 回饋的消費記錄
    DetailA?: Array<FeedbackDetailA>;
    // 幣倍卡回饋的消費記錄(加碼回饋/指定通路)
    DetailB?: Array<FeedbackDetailB>;
    // 新戶回饋截止日期 (QueryDawayFeedback)
    DeadLine?: string;
    // 當月發放 LINE Points (QueryDawayFeedback)
    TotalPoints?: string;
}

export interface QueryFeedbackList {
    // 日期
    date: string;
    // 回饋資料
    data?: QueryFeedbackRs;
}

// 各卡別回饋項目
export interface FeedbackSummary {
    // 回饋代碼
    Code: string;
    // 回饋說明
    Name: string;
    // 消費金額小計
    TotalAmt: string;
    // 回饋金額(豐點回饋)
    TotalFeedbackAmt: string;
    // 類型 1：基礎回饋, 2：活動加碼(QueryDawayFeedback)
    DESC?: string;
}

// 回饋的消費記錄
export interface FeedbackDetailA {
    // 回饋代碼
    Code?: string;
    // 回饋名稱
    Name?: string;
    // 消費記錄列表
    Items?: Array<FeedbackDetailItem>;
}

// 消費記錄列表
export interface FeedbackDetailItem {
    // 點數入點日(QueryDawayFeedback)
    DEDATE?: string;
    // 消費日
    TXDATE?: string;
    // 交易金額
    TX_AMT?: string;
    // 消費金額(台幣消費顯示此欄位)
    TW_AMT?: string;
    // 外幣消費金額(外幣消費顯示此欄位)
    DCUR_AMT?: string;
    // 約當台幣(外幣消費顯示此欄位)
    TTL_AMT?: string;
    // 消費說明
    MEMO?: string;
    // 幣別(台幣: 空白; 美元:840; 日圓:392; 歐元:978)
    ORG?: string;
    // 回饋點數(QueryDawayFeedback)
    POINT?: string;
}

// 幣倍卡回饋的消費記錄(加碼回饋/指定通路)
export interface FeedbackDetailB {
    // 回饋代碼
    Code?: string;
    // 回饋名稱
    Name?: string;
    // 依幣別群組的消費記錄
    CurrencyItems?: Array<DcurFeedbackDetailCurrencyItem>;
}

// 幣倍卡回饋(幣別的消費記錄)
export interface DcurFeedbackDetailCurrencyItem {
    // 幣別代碼
    CurrencyCode?: string;
    // 幣別名稱
    CurrencyName?: string;
    // 消費記錄列表
    Items?: Array<FeedbackDetailItem>;
}

// 查詢回饋類別 - 請求內容
export interface QueryCardFeedbackTypeRq {
}

// 查詢回饋類別 - 回應內容
// 12=虛擬卡、1=幣倍卡、2=大戶卡、3=運動卡、4=現金回饋卡、5=三井卡、13=大車隊卡
export interface QueryCardFeedbackTypeRs {
    // 回饋類別列表
    Items: Array<CardFeedBackItem>;
}

// 回饋類別項目
export interface CardFeedBackItem {
    // CardFaceId
    CardFaceId: number;
    // 回饋類型 (1:幣倍卡,2:大戶卡,3:運動卡,4:現金回饋卡,5:三井卡)
    FeedBackType:number;
}

/**台灣大車隊 T Point 回饋計畫: 累積查詢 - 回應結果 */
export interface TPointsQueryFeedbackRs {
	/**回饋項目總覽 */
	Summary?: TPointsFeedbackSummary[];

	/**當月發放 T Points */
	TotalPoints?: number;

	/**回饋項目的消費記錄 */
	Details?: TPointsFeedbackItem[];
}

/**回饋項目 */
export interface TPointsFeedbackSummary {
	/**回饋項目識別碼 */
	SummaryID: number;

	/**回饋名稱 */
	Name: string;

	/**消費金額小計 */
	TotalAmt: string;

	/**T Points */
	TPoints: number;

	/**消費記錄種類 (1:台灣大車隊APP綁卡回饋; 2:一般消費基本回饋; 3:專案回饋) */
	DataType: number;
}

/**消費記錄 */
export interface TPointsFeedback {
	/**消費紀錄名稱 */
	DetailName: string;

	/**回饋項目的消費記錄 */
	Details: TPointsFeedbackItem[];
}

/**消費記錄-細節 */
export interface TPointsFeedbackItem {
	/**回饋項目識別碼 */
	SummaryID: number;

	/**入點日 */
	DE_DATE: string;

	/**消費日 */
	TX_DATE: string;

	/**消費金額 */
	TX_AMT: string;

	/**消費項目/消費紀錄/回饋項目 */
	MEMO: string;

	/**等級 */
	LEVEL: string;

	/**回饋率 */
	FEEDBACK_RATE: string;

	/**回饋點數 */
	POINT: string;

    DataType: number;
}

/**消費記錄 */
export interface TPointsFeedbackDetailModel {
	/**回饋項目識別碼 */
	SummaryID: number;

	/**記錄分類代碼 */
	DataType;

	/**記錄分類名稱 */
	DataName;

	/**消費紀錄 */
	Items: TPointsFeedbackItem[];
}

/**台灣大車隊 T Point 回饋計畫: 兌換紀錄 - 回應結果 */
export interface TPointsRedemptionRecordsResultModel {
	/**目前剩餘點數 (T Points)  */
	AvailablePoints: number;

	/**到期日(YYYY/MM/DD) */
	ExpiryDate: string;

	/**是否折抵信用卡帳單 */
	IsRedeemSpecificChannels: boolean;

	/**台灣大車隊 T Point 回饋計畫: 兌換紀錄清單 */
	Items: TPointsRedemptionRecord[];
}

/**台灣大車隊 T Point 回饋計畫: 兌換紀錄 */
export interface TPointsRedemptionRecord {
	/**兌換日期 */
	DE_DATE: string;

	/**兌換T Points */
	POINT: string;

	/**兌換項目 */
	MEMO: string;
}

// 取得紅利點數資訊 - 請求內容
export interface PointRq {
    // 身分證字號
    ID: string;
}

// 取得紅利點數資訊 - 回應內容
export interface PointRs {
    /** 目前可用點數 = 今年 + 去年 + 前年 */
	Point: number;
	/** 到期點數 = 去年點數*/
	ExpiringPoint: number;
	/** 到期時間 = 今年12月31*/
	ExpireOn: string;
}

// 取得贈點紀錄資訊 - 請求內容
export interface ExchangeRecordRq {
    /** 身分證字號 */
    ID: string;
    /** 回饋代碼，空白:兌換,ADD:活動贈點 */
    QTYPE?: string;
    /** 查詢年度、西元年度4碼 */
    QYear?: string;
    /** 查詢近X年的資料(此欄位友值時以此欄位為準，QYear帶空值) */
    NearlyYEAR: number;
}

// 取得贈點紀錄資訊 - 回應內容
export interface ExchangeRecordRs {
    /** 紅利兌換/贈點紀錄 */
	Items: Array<ExchangeRecordItems>;
}

// 取得贈點紀錄資訊 - 回應內容
export interface ExchangeRecordItems {
    /** 日期 */
	DE_DATE?: string;
    /** 新增紅利積點 */
	ADD_POINT?: string;
    /** 兌換總點數 */
	TRA_POINT_TTL?: string;
    /** 產品名稱 */
	MEMO?: string;
}

// 取得紅利商品總覽資訊 - 請求內容
export interface GiftsRq {
    /** 是否為預覽模式 */
    IsPreview: boolean;
}

// 取得紅利商品總覽資訊 - 回應內容
export interface GiftsRs {
    /** 商品識別碼 */
	MainCategories: Array<MainCategories>;
	/** 商品名稱 */
	Gifts: Array<Gifts>;

}

// 取得紅利商品總覽資訊 - 主類別清單
export interface MainCategories {
    /** 主類別代碼 */
	ID: number;
	/** 主類別名稱 */
	Name?: string;
}

// 取得紅利商品總覽資訊 - 商品清單
export interface Gifts {
    /** 商品識別碼 */
	ID: number;
	/** 商品名稱 */
	Name?: string;
	/** 產品描述 */
	Description?: string;
	/** 商品小圖片 URL */
	SmallImagePath?: string;
	/** 商品大圖片 URL */
	BigImagePath?: string;
	/** 兌換期限 */
	EndTime?: string;
	/** 點數 */
	Point: number;
	/** 自付金額 */
	SelfPayment?: number;
	/** 主類別代碼 */
	MainCategoryId: number;
	/** 主類別名稱 */
	MainCategoryName?: string;
	/** 子類別Id */
	SubGiftCategoryId?: number;
	/** 子類別名稱 */
	SubCategoryName?: string;
	/** 商品編號 */
	GiftNo?: string;
	/** 專案代碼 */
	ProjectNo?: string;
	/** 優先順序 */
	Priority: number;
    /** 寄送方式; M:貨運寄送, T:電話簡訊 (例如: 家樂福手機簡訊兌換券); */
    SendType: string;
}

// 取得紅利商品資訊 - 請求內容
export interface GiftRq {
    /** 是否為預覽模式 */
    GiftId: number;
    /** 是否為預覽模式 */
    IsPreview: boolean;
}

// 取得紅利商品資訊 - 回應內容
export interface GiftRs {
    /** 商品識別碼 */
	ID: number;
	/** 商品名稱 */
	Name?: string;
	/** 產品描述 */
	Description?: string;
	/** 商品小圖片 URL */
	SmallImagePath?: string;
	/** 商品大圖片 URL */
	BigImagePath?: string;
	/** 兌換期限 */
	EndTime?: string;
	/** 點數 */
	Point: number;
	/** 自付金額 */
	SelfPayment?: number;
	/** 主類別代碼 */
	MainCategoryId: number;
	/** 主類別名稱 */
	MainCategoryName?: string;
	/** 子類別Id */
	SubGiftCategoryId?: number;
	/** 子類別名稱 */
	SubCategoryName?: string;
	/** 商品編號 */
	GiftNo?: string;
	/** 專案代碼 */
	ProjectNo?: string;
	/** 優先順序 */
	Priority: number;
}

// 取得兌換商品資訊 - 請求內容
export interface GiftExchangeRq {
    /** 身分證字號 */
    ID: string;
    /** 商品 */
    Items: Array<GiftExchangeItem>;
    /** 地址 */
    Address?: string;
}

// 取得兌換商品資訊-商品結果 - 回應內容
export interface GiftExchangeItems {
    /** 商品資訊 */
	Item?: GiftExchangeItem;
	/** 錯誤訊息 */
	ErrorMessage?: string;
	/** 兌換是否成功 */
	IsExchangeSuccess: boolean;
	/**  */
	IsExchangeable: boolean;
}

// 取得兌換商品資訊 - 回應內容
export interface GiftExchangeRs {
    /** 兌換結果 */
   Items: Array<GiftExchangeItems>;
}

// 取得兌換商品資訊-商品資訊 - 回應內容
export interface GiftExchangeItem {
    /** 專案代碼 */
	ProjCode?: string;
	/** 商品代碼，GiftNo */
	ProdCode?: string;
	/** 數量 */
	Quantity: number;
    /**  */
	EndTime?: string;
    /**  */
	Description?: string;
    /**  */
	TotalPoints: number;
    /** 寄送方式; M:貨運寄送, T:電話簡訊 (例如: 家樂福手機簡訊兌換券); */
    SendType: string;
}

// 紅利商品清單
export interface GiftItem {
    /** 商品識別碼 */
	ID: number;
	/** 商品名稱 */
	Name?: string;
	/** 產品描述 */
	Description?: string;
	/** 商品小圖片 URL */
	SmallImagePath?: string;
	/** 商品大圖片 URL */
	BigImagePath?: string;
	/** 兌換期限 */
	EndTime?: string;
	/** 點數 */
	Point: number;
	/** 自付金額 */
	SelfPayment?: number;
	/** 主類別代碼 */
	MainCategoryId: number;
	/** 主類別名稱 */
	MainCategoryName?: string;
	/** 子類別Id */
	SubGiftCategoryId?: number;
	/** 子類別名稱 */
	SubCategoryName?: string;
	/** 商品編號 */
	GiftNo?: string;
	/** 專案代碼 */
	ProjectNo?: string;
	/** 優先順序 */
	Priority: number;
    /** 數量 */
	qty?: number;
    /** 寄送方式; M:貨運寄送, T:電話簡訊 (例如: 家樂福手機簡訊兌換券); */
    SendType: string;
}

// 兌換結果
export interface Result {
    /** 商品資訊 */
	Item?: ResultItem;
	/** 錯誤訊息 */
	ErrorMessage?: string;
	/** 兌換是否成功 */
	IsExchangeSuccess: boolean;
	/**  */
	IsExchangeable: boolean;
}

// 兌換商品結果
export interface ResultItem {
    /** 專案代碼 */
	ProjCode?: string;
	/** 商品代碼，GiftNo */
	ProdCode?: string;
	/** 數量 */
	Quantity: number;
    /**  */
	EndTime?: string;
    /**  */
	Description?: string;
    /**  */
	TotalPoints?: number;
    /** 商品名稱 */
	Name?: string;
}
