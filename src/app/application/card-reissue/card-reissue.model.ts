export enum reissueType {
    Loss = 'Loss',
    Damag = 'Damag',
}

//部分成功頁面顯示用model
export interface ReissueCardModel {
    // 卡號
    CardNo: string;
    // 卡片名稱
    Name: string;
    // 卡別(M、V、J、A)
    CardBrand: string;
    // 持卡人姓名
    CardHolderName: string;
    //是否申請成功
    IsSuccess: boolean;
}
