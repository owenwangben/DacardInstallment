import { Injectable } from '@angular/core';
import { BaseRequest } from '../webapi.service';
import { LoaderService } from '../loader.service';
import { WebApiService } from '../webapi.service';
import { ServiceHelper } from '../../shared.module';

@Injectable()
export abstract class BaseService {
	public constructor(
		private webapi: WebApiService,
		private loader: LoaderService
	) {}

	private createRequest(model: any): BaseRequest {
		return {
            Header: {
                ApplicationName: ServiceHelper.ApplicationName,
                SessionID: ServiceHelper.SessionId,
                ClientIP: ServiceHelper.ClientIp,
                UserAgent: window.navigator.userAgent,
                ClientRefNo: this.uuidv4(),
                ClientTimestamp: new Date()
            },
            Content : model
        };
	}

    protected post(apiUrl: string, model: any, headers?: { [key: string]: string }): Promise<any> {
		return this.loader.run(() => this.webapi.post(apiUrl, this.createRequest(model), headers));
    }

    protected assignCardFaceUrl(items: Array<any>, fieldOfCardType: string, fieldOfCardFace: string) {
        for (let item of items) {
            item['CardFaceURL'] = "mma8/card/images/card-lost/" + item[fieldOfCardType] + item[fieldOfCardFace] + ".png";
        }
    }

    public uuidv4(): string {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
			// tslint:disable-next-line: no-bitwise
			const r = Math.random() * 16 | 0;
			// tslint:disable-next-line: no-bitwise
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}
