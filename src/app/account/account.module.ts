import { NgModule } from "@angular/core";
import { CardManageModule } from "./card-manage/card-manage.module";
import { CardOrderModule } from './card-order/card-order.module';
import { CardBundleModule } from "./card-bundle/card-bundle.module";
import { InstallmentModule } from "./installment/installment.module";
import { SingleInstallmentModule } from "./single-installment/single-installment.module";
import { DebitCardModule } from "./debit-card/debit-card.module";
import { CardBillModule } from "./card-bill/card-bill.module";
import { CardRecordPaid6monsModule } from "./card-record-paid6mons/card-record-paid6mons.module";
import { InstallmentRecordModule } from "./installment-record/installment-record.module";
import { CardBenefitsModule } from "./card-benefits/card-benefits.module";

@NgModule({
    exports: [
        CardManageModule,
        CardOrderModule,
        CardBundleModule,
        InstallmentModule,
        SingleInstallmentModule,
        DebitCardModule,
        CardBillModule,
        CardRecordPaid6monsModule,
        InstallmentRecordModule,
        CardBenefitsModule
    ],
    declarations: [


  ]
})
export class AccountModule {
}
