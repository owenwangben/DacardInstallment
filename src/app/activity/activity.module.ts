import { NgModule } from "@angular/core";
import { RegisterModule } from "./register/register.module";
import { RightModule } from "./right/right.module";
import { DailyActivityModule } from "./daily-activity/daily-activity.module";

@NgModule({
    exports: [
        RegisterModule,
        RightModule,
        DailyActivityModule
    ]
})
export class ActivityModule {
}
