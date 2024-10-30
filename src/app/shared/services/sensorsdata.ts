declare var sensors: any;

/**
神策數據：事件追踪(信用卡分期-一般流程)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 * @param payable_principle 應付本金(單分、帳分)
 * @param payable_interest 應付利息(單分、帳分)
 */

export function CreditCardSensorsTrack(event_name: string, is_success?: boolean, payable_principle?: number, payable_interest?: number) {
    const data = {
        is_success,
        payable_principle,
        payable_interest
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}
/**
神策數據：事件追踪(信用卡分期-申請結果)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 * @param staging_principle 分期本金
 * @param staging_number 選擇期數
 * @param annual_interest_rate 年利率
 * @param handling_fee 手續費
 * @param first_payable_principle 首期應繳本金
 * @param first_payable_interest 首期應繳利息
 */

export function CreditCardResultSensorsTrack(event_name: string, is_success?: boolean, staging_principle?: number, staging_number?: number,
    annual_interest_rate?: number, handling_fee?: number, first_payable_principle?: number, first_payable_interest?: number) {
    const data = {
        is_success,
        staging_principle,
        staging_number,
        annual_interest_rate,
        handling_fee,
        first_payable_principle,
        first_payable_interest
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(交易設定)
 * @param event_name 事件名稱
 * @param suspend_all_transaction 暫停所有交易
 * @param domestic_physical_transaction 國內實體交易
 * @param domestic_online_transaction 國內線上交易
 * @param foreign_physical_transaction 國外實體交易
 * @param foreign_online_transaction 國外線上交
 * @param single_transaction_quota_setting 單筆交易額度設定
 * @param card_type 卡片種類
 */

export function CardTransactionSettingSensorsTrack(event_name: string, suspend_all_transaction: string, domestic_physical_transaction: string, domestic_online_transaction: string,
    foreign_physical_transaction: string, foreign_online_transaction: string, single_transaction_quota_setting: number, card_type: string) {
    const data = {
        suspend_all_transaction,
        domestic_physical_transaction,
        domestic_online_transaction,
        foreign_physical_transaction,
        foreign_online_transaction,
        single_transaction_quota_setting,
        card_type
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(預借現金)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 * @param loan_amount 借款金額
 */

export function CashAdvanceSensorsTrack(event_name: string, is_success?: boolean, loan_amount?: number) {
    const data = {
        is_success,
        loan_amount
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(開卡流程)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 */

export function GeneralSensorsTrack(event_name: string, is_success?: boolean) {
    const data = {
        is_success,
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(活動登錄-搶登錄)
 * @param event_name 事件名稱
 * @param activity_name 活動名稱
 * @param activity_code 活動代碼
 */

export function SignActivity(event_name: string, activity_name: string, activity_code: string) {
    const data = {
        activity_name,
        activity_code
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(活動登錄-搶登錄)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 * @param attend_sequence 登錄序號(失敗回0)
 * @param activity_name 活動名稱
 * @param activity_code 活動代碼
 * @param failure_reason 失敗原因
 */

export function SignActivityResult(event_name: string, is_success: boolean, attend_sequence: string,
    activity_name: string, activity_code: string, failure_reason: string) {
    const data = {
        is_success,
        attend_sequence,
        activity_name,
        activity_code,
        failure_reason
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(紅利點數)
 * @param event_name 事件名稱
 * @param exchange_name 兌換品項
 * @param exchange_amount 兌換數量
 * @param is_success 是否成功
 */

export function RewardPointSensorsTrack(event_name: string, data?: any) {
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
 * 神策數據：事件追踪
 * @param event_name 事件名稱
 * @param data 事件資料
 */
export function SensorsTrack(event_name: string, data) {
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-Banner曝光)
 * @param event_name 事件名稱
 * @param section_id 資源位ID
 * @param priority 優先權
 * @param strategy_id 資源位的策略ID
 * @param strategy_name 資源位的策略名稱
 * @param rec_frame_site Banner序號
 * @param log_id 請求ID
 * @param $sf_plan_strategy_id 實驗組ID (取神策回傳的 experiment_name)
 * @param material_type 資源位類型
 */

export function BannerShow(event_name: string, section_id: string, priority: string, strategy_id: string, strategy_name: string, rec_frame_site: number, log_id: string, $sf_plan_strategy_id: string, material_type: string) {
    const data = {
        section_id,
        priority,
        strategy_id,
        strategy_name,
        rec_frame_site,
        log_id,
        $sf_plan_strategy_id,
        material_type
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-Banner點擊)
 * @param event_name 事件名稱
 * @param section_id 資源位ID
 * @param priority 優先權
 * @param strategy_id 資源位的策略ID
 * @param strategy_name 資源位的策略名稱
 * @param rec_frame_site Banner序號
 * @param log_id 請求ID
 * @param $sf_plan_strategy_id 實驗組ID (取神策回傳的 experiment_name)
 * @param target_url 跳轉連結
 * @param material_type 資源位類型
 */

export function BannerClick(event_name: string, section_id: string, priority: string, strategy_id: string, strategy_name: string, rec_frame_site: number, log_id: string, $sf_plan_strategy_id: string, target_url: string, material_type: string) {
    const data = {
        section_id,
        priority,
        strategy_id,
        strategy_name,
        rec_frame_site,
        log_id,
        $sf_plan_strategy_id,
        target_url,
        material_type
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-卡友權益/辦卡引導曝光)
 * @param event_name 事件名稱
 * @param right_title 權益標題
 * @param right_subtitle 權益副標題
 * @param button_subtitle 按鈕標題
 */

export function RightShow(event_name: string, right_title: string, right_subtitle: string, button_subtitle: string) {
    const data = {
        right_title,
        right_subtitle,
        button_subtitle
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-卡友權益/辦卡引導點擊)
 * @param event_name 事件名稱
 * @param right_title 權益標題
 * @param right_subtitle 權益副標題
 * @param button_subtitle 按鈕標題
 * @param element_target_url 元素連結網址
 */

export function RightClick(event_name: string, right_title: string, right_subtitle: string, button_subtitle: string, element_target_url: string) {
    const data = {
        right_title,
        right_subtitle,
        button_subtitle,
        element_target_url
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-活動列表點擊)
 * @param event_name 事件名稱
 * @param activity_title 活動標題
 * @param activity_subtitle 活動副標題
 */

export function ActivityClick(event_name: string, activity_title: string, activity_subtitle: string) {
    const data = {
        activity_title,
        activity_subtitle,
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-信用卡活動點擊)
 * @param event_name 事件名稱
 * @param activity_title 活動標題
 * @param activity_subtitle 活動副標題
 * @param activity_date 活動日期
 */

export function DailyActivityClick(event_name: string, activity_title: string, activity_subtitle: string, activity_date: string) {
    const data = {
        activity_title,
        activity_subtitle,
        activity_date
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-辦卡引導點擊)
 * @param event_name 事件名稱
 * @param right_title 權益標題
 * @param right_subtitle 權益副標題
 * @param button_subtitle 按鈕標題
 * @param activity_date 活動日期
 */

export function DailyRightClick(event_name: string, right_title: string, right_subtitle: string, button_subtitle: string, activity_date: string) {
    const data = {
        right_title,
        right_subtitle,
        button_subtitle,
        activity_date,
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}


/**
神策數據：事件追踪(信用卡優惠-搶登錄-活動列表)
 * @param event_name 事件名稱
 * @param activity_name 活動名稱
 * @param activity_code 活動代碼
 * @param activity_date 活動日期
 */

export function DailyActivityList(event_name: string, activity_name: string, activity_code: string, activity_date: string) {
    const data = {
        activity_name,
        activity_code,
        activity_date,
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}


/**
神策數據：事件追踪(信用卡優惠-搶登錄-立即登錄)
 * @param event_name 事件名稱
 * @param activity_name 活動名稱
 * @param activity_code 活動代碼
 * @param activity_date 活動日期
 */

export function DailyActivityLogin(event_name: string, activity_name: string, activity_code: string, activity_date: string) {
    const data = {
        activity_name,
        activity_code,
        activity_date,
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}

/**
神策數據：事件追踪(信用卡優惠-搶登錄-登錄結果)
 * @param event_name 事件名稱
 * @param is_success 是否成功
 * @param activity_name 活動名稱
 * @param activity_code 活動代碼
 * @param activity_date 活動日期
 * @param attend_sequence 登錄序號
 * @param failure_reason 失敗原因
 */

export function DailyActivityResult(event_name: string, is_success: boolean, activity_name: string, activity_code: string, activity_date: string, attend_sequence: number, failure_reason: string) {
    const data = {
        is_success,
        activity_name,
        activity_code,
        activity_date,
        attend_sequence,
        failure_reason
    };
    if (sensors.para.show_log) {
        console.log('[SensorsTrack]\nevent_name: ', event_name, '\ndata:', data);
    }
    sensors.track(event_name, data);
}
