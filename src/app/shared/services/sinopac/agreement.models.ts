// 取得條款資訊 - 請求內容
export interface GetAgreementInfoRq {
    // 條款名稱
    Title: string;
    // 來源程式名稱 ex.CAWHO
    Source: string;
}

// 取得條款資訊 - 回應結果
export interface GetAgreementInfoRs {
    // 條款名稱
    Title: string;
    // 條款版本
    Version: string;
    // 條款類型 - 1:Url, 2:內文 #找不到資料不會回傳此欄位
    Type: number;
    // 條款 Url / 內文 #找不到資料不會回傳此欄位
    Content: string;
}
// 新增同意條款紀錄 - 請求內容
export interface InsertAgreementRecordRq {
    // 身分證字號
    ID:string;
    // 條款名稱
    Title: string;
    // 條款版本
    Version: string;
    // 來源程式名稱 ex.CAWHO
    Source: string;
}

// 新增同意條款紀錄 - 回應結果
export interface InsertAgreementRecordRs {
    // 是否新增成功
    Success: boolean;
}
