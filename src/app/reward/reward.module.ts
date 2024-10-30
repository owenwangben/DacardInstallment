import { NgModule } from "@angular/core";
import { RewardPointsManageModule } from "./rewardpoints-manage/rewardpoints-manage.module";
import { RewardPointsRecordModule } from "./rewardpoints-record/rewardpoints-record.module";
import { RewardPointsRdemptionModule } from "./rewardpoints-rdemption/rewardpoints-rdemption.module";

@NgModule({
    exports: [
        RewardPointsManageModule,
        RewardPointsRecordModule,
        RewardPointsRdemptionModule
    ]
})
export class RewardModule {
}
