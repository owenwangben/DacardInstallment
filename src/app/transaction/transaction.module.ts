
import { NgModule } from '@angular/core';
import { CashAdvanceModule } from './cash-advance/cash-advance.module';
import { PermCliStatusModule } from './perm-cli-status/perm-cli-status.module';
import { PermCliModule } from './perm-cli/perm-cli.module';
import { TempCliStatusModule } from './temp-cli-status/temp-cli-status.module';
import { TempCliModule } from './temp-cli/temp-cli.module';
import { UnauthorizedTxnModule } from './unauthorized-txn/unauthorized-txn.module';

@NgModule({
    exports: [
        CashAdvanceModule,
        PermCliModule,
        PermCliStatusModule,
        TempCliModule,
        TempCliStatusModule,
        UnauthorizedTxnModule
    ]
})
export class TransactionModule { }
