import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonDataComponent } from './non-data/non-data.component';
import { NumberListDialogComponent } from './dialog/number-list-dialog/number-list-dialog.component';
import { RadioboxDialogComponent } from './dialog/radiobox-dialog/radiobox-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule } from '@angular/forms';
import { AddressListDialogComponent } from './dialog/address-list-dialog/address-list-dialog.component';

@NgModule({
    declarations: [
        NonDataComponent,
        NumberListDialogComponent,
        RadioboxDialogComponent,
        AddressListDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        NgxMaskModule.forRoot(),
    ],
    exports: [
        NonDataComponent
    ],
})
export class tranSharedModule { }
