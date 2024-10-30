declare const sensors: any;

/**
 * 輪播Request Header
 */
export type RecommendBannerHeader = {
    /** 项目名称 */
    ['project-name']: string;
};
/**
 * 輪播Request Param
 */
export type RecommendBannerParam = {
    /** 組織ID */
    org_id: string;
    /** 校驗密鑰 */
    access_token: string;
};

/**
 * 輪播Request Body
 */
export type RecommendBannerRq = {
    /** 資源位 ID */
    section_id: string;
    /** 用戶唯一標識 */
    distinct_id: string;
    /** 請求唯一標識 */
    log_id: string;
    /** 請求用戶屬性傳參 */
    context_property?: string;
    /**
     * <列表資源位專用>
     * 請求結果是否包含置頂物品
     */
    need_sticky_item?: boolean;
    /**
     * <列表資源位專用>
     * 當前查詢頁碼
     */
    page_number?: number;
    /**
     * <列表資源位專用>
     * 每頁的推薦結果數量
     */
    page_size?: number;
};

export type BaseSensorStrackerRes<T> = {
    /**
     * 返回狀態碼
     * 如: 0
     */
    errcode: ErrCode;
    /**
     * 接口調用成功顯示success，失敗請參照狀態碼及消息說明表
     */
    errmsg: string;
    data: T;
};

export type Item = {
    /**
     * <列表資源位專用>推薦結果唯一標識
     * 如: 1
     */
    item_id: string;
    /**
     * <列表資源位專用>推薦結果類型
     * 如: video
     */
    item_type: string;
    /**
     * 推薦結果所屬選品組
     * 如: 1
     */
    origin_id: string;
    /**
     * <輪播資源位專用>
     * 實驗分流標識，當開啟了AB實驗時，該字段表示實驗組的名稱，用於後續埋點上報
     * 如：實驗組
     */
    experiment_name: string;
    /**
     * <列表資源位專用>
     * 由推薦規則中的排序規則所計算出來的用於物品排序的排序得分
     */
    score: number;
    /** 策略ID */
    strategy_id: string;
    /** 策略名稱 */
    strategy_name: string;
    /**
     * 策略類型
     * 如：TOP_ITEM表示置頂物品
     */
    strategy_type: string;
    /**
     * <輪播資源位專用>
     * 上線時間
     * 如：1593805689840
     */
    online_time: number;
    /**
     * <輪播資源位專用>
     * 下線時間
     * 如：1593805689840， 如果值等於0代表永不下線
     */
    offline_time: number;
    /**
     * <輪播資源位專用>
     * 輪播資源位策略對應位置
     * 如：2
     */
    rec_frame_site: number;
    /**
     * <輪播資源位專用>
     * 輪播資源位策略對應優先級
     * 如：1
     */
    priority: number;
    /**
     * <輪播資源位專用>
     * 物料元素信息
     */
    material_properties: { [key: string]: any };
};

/**
 * 輪播Response
 */
export type RecommendBannerRs = {
    log_id: string;
    section_id: string;
    total_count: number;
    user_properties: { [key: string]: any };
    section_properties: { [key: string]: any };
    items: Item[];
};

export enum ErrCode {
    /** 請求正常返回 */
    Success = 0,
    /** 服務內部異常 */
    ServerInternalError = 10001,
    /** 項目未綁定或不存在 */
    ProjectNotBindOrNotExist = 10002,
    /** 請求數據格式有誤 */
    InvalidHttpMessage = 10003,
    /** 指元數據錯誤 */
    MetadataNotExistOrInvalid = 20001,
    /** 項目未指定 */
    ProjectNameNotSpecified = 20003,
    /** 用戶標識未指定 */
    UserIdNotSpecified = 20004,
    /** 驗證失敗，請聯繫神策客服人員確認 */
    Unauthorized = 9000001,
}
