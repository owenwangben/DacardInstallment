export interface PocActivityRs {
    /** 活動名稱(燈箱標題) */
    ActivityTitle: string;
    /** 文字一 */
    TextOne: string;
    /** 文字二 */
    TextTwo: string;
    /** 活動圖片 文件的URL*/
    ActivityImage: string;
    /** 活動開始時間 */
    StartTime: string;
    /** 活動結束時間 */
    EndTime: string;
    /** 燈箱內容 */
    Content: string;
    /** 按鍵一文字 */
    ButtonOneText: string;
    /** 按鍵一連結 連結網址*/
    ButtonOneLink: string;
    /** 按鍵二文字 */
    ButtonTwoText: string;
    /** 按鍵二連結 連結網址*/
    ButtonTwoLink: string;
    /** 是否顯示行事曆 */
    ShowCalendar: boolean;
    /** 是否顯示活動列表 */
    ShowActivityList: boolean;
    /** 活動顯示區間 起*/
    DisplayPeriodS: string;
    /** 活動顯示區間 迄*/
    DisplayPeriodE: string;
    /** 活動分類 */
    ActivityCategory: string[];
    /** 排序 */
    SortOrder: number;
    /** 建立時間 */
    CreateTime: string;
}

export interface PocBannerList {
    /** 資源位ID */
    Section_id: string,
    /** 優先權 */
    Priority: number,
    /** 資源位的策略ID */
    Strategy_id: string,
    /** 資源位的策略名稱 */
    Strategy_name: string,
    /** Banner序號 */
    Rec_frame_site: number,
    /** 請求ID */
    Log_id: string,
    /** 實驗組ID */
    Sf_plan_strategy_id: string,
    /** 資源位類型 */
    Material_type: string,
    /** Banner 顯示內容 */
    data: BannerContent
}
export interface BannerContent {
    /** 活動名稱 */
    ActivityName: string;
    /** 樣式 ex.blue、linen、rose、gold、teal */
    Style: string;
    /** 標題 */
    Title: string;
    /** 副標題 */
    Subtitle: string;
    /** 活動時間 起 */
    ActivityTimeS?: string;
    /** 活動時間 迄*/
    ActivityTimeE?: string;
    /** 圖片 */
    Image: string;
    /** 連結 */
    Link: string;
}

export interface PocCalendarItems {
    week: string;
    item: PocCalendarItem[];
}

export interface PocCalendarItem {
    weekDay: string;
    month: string;
    date: string;
    isToday: boolean;
    anyAcivityBeginToday: boolean;
    fullDate: string;
}
