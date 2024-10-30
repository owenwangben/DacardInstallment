export interface PaymentToolQueryRq {
    // 查詢類別: 請帶C(信用卡)
    query_type: string;
}

export interface PaymentToolQueryRs {
    // 收款工具類型: SC:本行卡SA:本行帳戶 CA:常用帳戶 CC:常用信用卡
    acct_type: string;
    // 收款工具銀行代碼
    acct_bank_id: string;
    // 帳戶/卡號
    acct_num: string;
    // 帳戶/卡片名稱
    acct_name: string;
    // 是否綁定
    bound: boolean;
    // 是否為預設卡
    is_default: boolean;
    // 是否為debit card
    is_debit_card: boolean;
}

export interface BindCreditCardRq {
    // 信用卡卡號(BASE 64 Encode字串)
    creditcard_no: string;
    // 信用卡效期(MMYY，BASE 64 Encode字串)
    expire_date: string;
    // 綁定或解綁，不設定傳null
    bound: boolean;
    // 是否設為預設，不設定傳null
    is_default: boolean;
}

export interface BindCreditCardRS {

}
