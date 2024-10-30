import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CompleteComponent } from './components/complete/complete.component';
import { MyDataResolver } from './services/mydata-resolver';
import { RelayComponent } from './components/relay/relay.component';

const routes: Routes = [{
	path: 'MyDataComplete/:type',
	component: CompleteComponent,
	canActivate: [AuthGuard],
	resolve: { data: MyDataResolver },
	data: { step: 0 }
},{
	path: 'MyDataRelay',
	component: RelayComponent
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		CompleteComponent,
        RelayComponent
	],
	entryComponents: [
		CompleteComponent,
        RelayComponent
	],
	providers: [
        MyDataResolver
    ]
})
export class MyDataModule { }
