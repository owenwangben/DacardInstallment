import { CardReissueModule } from './card-reissue/card-reissue.module';
import { NgModule } from "@angular/core";
import { CardActivateModule } from "./card-activate/card-activate.module";
import { CardAddDocModule } from "./card-add-doc/card-add-doc.module";
import { CardEnableModule } from "./card-enable/card-enable.module";
import { CardLoseModule } from './card-lose/card-lose.module';
import { CardQueryModule } from "./card-query/card-query.module";
import { CardInfoModule } from "./card-info/card-info.module";
import { MyDataModule } from "./mydata/mydata.module";
import { CardAutoWithholdingModule } from './card-auto-withholding/card-auto-withholding.module';
import { FidoVerifyModule } from './fido-verify/fido-verify.module';
import { FidoVerifyRecordModule } from './fido-verify-record/fido-verify-record.module';

@NgModule({
	exports: [
        CardActivateModule,
        CardAddDocModule,
        CardEnableModule,
        CardLoseModule,
        CardQueryModule,
        CardInfoModule,
        MyDataModule,
        CardReissueModule,
        CardAutoWithholdingModule,
        FidoVerifyModule,
        FidoVerifyRecordModule
	],
	declarations: [

	]
})
export class ApplicationModule { }
