import { Injectable } from "@angular/core";
import { BaseResponse } from '../webapi.service';
import {
    ApplyCashAdvanceRq, ApplyCashAdvanceRs, ApplyStmtInstallmentRq, ApplyStmtInstallmentRs,
    ApplyTemporaryCreditRq, ApplyTemporaryCreditRs, EasyCashCalcCycleFeeRq, EasyCashCalcCycleFeeRs,
    GetCashAdvanceApplyInfoRq, GetCashAdvanceApplyInfoRs, GetInstallmentDataRq, GetInstallmentDataRs,
    GetPermanentCreditInfoRq, GetPermanentCreditInfoRs, GetTemporaryCreditInfoRq, GetTemporaryCreditInfoRs,
    InstallmentAgreementRq, InstallmentAgreementRs, InstallmentApplyCheckRq, InstallmentApplyCheckRs,
    InstallmentApplyRq, InstallmentApplyRs, LatestTxRq, LatestTxRs,
    PermanentAdjustApplyRecordRq, PermanentAdjustApplyRecordRs, StmtInstallmentDataRq, StmtInstallmentDataRs,
    TemporaryCreditApplyRecordRq, TemporaryCreditApplyRecordRs, TransferAccountsRq, TransferAccountsRs,
    UploadPermanentCreditAttachmentRq, UploadPermanentCreditAttachmentRs, PermanentAdjustApplyRs, PermanentAdjustApplyRq, getDebitLatestTxRs, getDebitLatestTxRq, getDebitStatementInquiryRq, getDebitStatementInquiryRs, RecentBillRs, RecentBillRq, OutstandingDetailRq, OutstandingDetailRs, PaymentRecordsRq, PaymentRecordsRs,
} from "./account.models";
import { BaseService } from './base.service';

@Injectable()
export class AccountService extends BaseService {
    private readonly URL = {
        getLatestTx: 'api/Account/LatestTx',
        getStmtInstallmentData: 'api/Account/GetStmtInstallmentData',
        setInstallmentAgreement: 'api/Account/SetInstallmentAgreement',
        easyCashCalcCycleFee: 'api/Account/EasyCashCalcCycleFee',
        applyStmtInstallment: 'api/Account/ApplyStmtInstallment',
        getInstallmentData: 'api/Account/GetInstallmentData',
        installmentApplyCheck: 'api/Account/InstallmentApplyCheck',
        installmentApply: 'api/Account/InstallmentApply',
        getTemporaryCreditInfo: 'api/Account/GetTemporaryCreditInfo',
        applyTemporaryCredit: 'api/Account/ApplyTemporaryCredit',
        getCashAdvanceApplyInfo: 'api/Account/GetCashAdvanceApplyInfo',
        transferAccounts: 'api/Account/TransferAccounts',
        temporaryCreditApplyRecord: 'api/Account/TemporaryCreditApplyRecord',
        PermanentAdjustApplyRecord: 'api/Account/PermanentAdjustApplyRecord',
        applyCashAdvance: 'api/Account/ApplyCashAdvance',
        getPermanentCreditInfo: 'api/Account/GetPermanentCreditInfo',
        uploadPermanentCreditAttachment: 'api/Account/UploadPermanentCreditAttachment',
        PermanentAdjustApply: 'api/Account/PermanentAdjustApply',
        GetDebitCardLatestTx: 'api/DebitCard/GetDebitCardLatestTx',
        GetDebitCardStatementInquiry: 'api/DebitCard/GetDebitCardStatementInquiry',
        RecentBill: 'api/Account/RecentBill',
        OutstandingDetail: 'api/Account/OutstandingDetail',
        PaymentRecords: 'api/Account/PaymentRecords',
    }

    public test(model: TestRq): Promise<BaseResponse<TestRs>> {
        return this.post('api/account/test', model);
    }

    public getLatestTx(model: LatestTxRq): Promise<BaseResponse<LatestTxRs>> {
        return this.post(this.URL.getLatestTx, model);
    }

    public GetDebitCardLatestTx(model: getDebitLatestTxRq): Promise<BaseResponse<getDebitLatestTxRs>> {
        return this.post(this.URL.GetDebitCardLatestTx, model);
    }

    public GetDebitCardStatementInquiry(model: getDebitStatementInquiryRq): Promise<BaseResponse<getDebitStatementInquiryRs>> {
        return this.post(this.URL.GetDebitCardStatementInquiry, model);
    }

    public getStmtInstallmentData(model: StmtInstallmentDataRq): Promise<BaseResponse<StmtInstallmentDataRs>> {
        return this.post(this.URL.getStmtInstallmentData, model);
    }

    public setInstallmentAgreement(model: InstallmentAgreementRq): Promise<BaseResponse<InstallmentAgreementRs>> {
        return this.post(this.URL.setInstallmentAgreement, model);
    }

    public easyCashCalcCycleFee(model: EasyCashCalcCycleFeeRq): Promise<BaseResponse<EasyCashCalcCycleFeeRs>> {
        return this.post(this.URL.easyCashCalcCycleFee, model);
    }

    public applyStmtInstallment(model: ApplyStmtInstallmentRq): Promise<BaseResponse<ApplyStmtInstallmentRs>> {
        return this.post(this.URL.applyStmtInstallment, model);
    }

    public getInstallmentData(model: GetInstallmentDataRq): Promise<BaseResponse<GetInstallmentDataRs>> {
        return this.post(this.URL.getInstallmentData, model);
    }

    public installmentApplyCheck(model: InstallmentApplyCheckRq): Promise<BaseResponse<InstallmentApplyCheckRs>> {
        return this.post(this.URL.installmentApplyCheck, model);
    }

    public installmentApply(model: InstallmentApplyRq): Promise<BaseResponse<InstallmentApplyRs>> {
        return this.post(this.URL.installmentApply, model);
    }

    public getTemporaryCreditInfo(model: GetTemporaryCreditInfoRq): Promise<BaseResponse<GetTemporaryCreditInfoRs>> {
        return this.post(this.URL.getTemporaryCreditInfo, model)
    }

    public applyTemporaryCredit(model: ApplyTemporaryCreditRq): Promise<BaseResponse<ApplyTemporaryCreditRs>> {
        return this.post(this.URL.applyTemporaryCredit, model)
    }

    public temporaryCreditApplyRecord(model: TemporaryCreditApplyRecordRq): Promise<BaseResponse<TemporaryCreditApplyRecordRs>> {
        return this.post(this.URL.temporaryCreditApplyRecord, model)
    }

    public permanentAdjustApplyRecord(model: PermanentAdjustApplyRecordRq): Promise<BaseResponse<PermanentAdjustApplyRecordRs>> {
        return this.post(this.URL.PermanentAdjustApplyRecord, model)
    }

    public getCashAdvanceApplyInfo(model: GetCashAdvanceApplyInfoRq): Promise<BaseResponse<GetCashAdvanceApplyInfoRs>> {
        return this.post(this.URL.getCashAdvanceApplyInfo, model)
    }

    public transferAccounts(model: TransferAccountsRq): Promise<BaseResponse<TransferAccountsRs>> {
        return this.post(this.URL.transferAccounts, model)
    }

    public applyCashAdvance(model: ApplyCashAdvanceRq): Promise<BaseResponse<ApplyCashAdvanceRs>> {
        return this.post(this.URL.applyCashAdvance, model)
    }

    public getPermanentCreditInfo(model: GetPermanentCreditInfoRq): Promise<BaseResponse<GetPermanentCreditInfoRs>> {
        return this.post(this.URL.getPermanentCreditInfo, model);
    }

    public uploadPermanentCreditAttachment(model: UploadPermanentCreditAttachmentRq): Promise<BaseResponse<UploadPermanentCreditAttachmentRs>> {
        return this.post(this.URL.uploadPermanentCreditAttachment, model)
    }

    public PermanentAdjustApply(model: PermanentAdjustApplyRs): Promise<BaseResponse<PermanentAdjustApplyRq>> {
        return this.post(this.URL.PermanentAdjustApply, model)
    }

    public RecentBill(model: RecentBillRq): Promise<BaseResponse<RecentBillRs>> {
        return this.post(this.URL.RecentBill, model);
    }

    public OutstandingDetail(model: OutstandingDetailRq): Promise<BaseResponse<OutstandingDetailRs>> {
        return this.post(this.URL.OutstandingDetail, model);
    }

    public PaymentRecords(model: PaymentRecordsRq): Promise<BaseResponse<PaymentRecordsRs>> {
        return this.post(this.URL.PaymentRecords, model);
    }
}

export interface TestRq {
    Input: string;
}

export interface TestRs {
    Output: string;
}
