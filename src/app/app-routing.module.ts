import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './home/home.module';

const routes: Routes = [
	{ path: 'Account', loadChildren: () => import('./account/account.module').then(module => module.AccountModule) },
	{ path: 'Application', loadChildren: () => import('./application/application.module').then(module => module.ApplicationModule) },
	{ path: 'Transaction', loadChildren: () => import('./transaction/transaction.module').then(module => module.TransactionModule) },
    { path: 'Activity', loadChildren: () => import('./activity/activity.module').then(module => module.ActivityModule) },
    { path: 'Reward', loadChildren: () => import('./reward/reward.module').then(module => module.RewardModule) },
];

if (window['site_config']?.isTMode) {
    routes.push({ path: 'Home', component: HomeComponent });
    routes.push({ path: '**', redirectTo: 'Account/CardBill' });
}
else {
    routes.push({ path: '**', redirectTo: 'Account/CardBill' });
};

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
