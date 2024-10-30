import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
  export class SiteConfigService {
    private production: boolean = true; // production
    private isTMode: boolean = false; // test mode
    private home: string = 'Account/CardBill'; // default home page

    setProduction(production: boolean) {
      this.production = production;
    }

    getProduction() {
      return this.production;
    }

    setIsTMode(isTMode: boolean) {
      this.isTMode = isTMode;
    }

    getIsTMode() {
      return this.isTMode;
    }

    setHome(home: string) {
      this.home = home;
    }

    getHome() {
      return this.home;
    }
  }
