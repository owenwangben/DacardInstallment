import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseResponse } from './webapi.service';

@Injectable()
export class LoaderService {
	private status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private counter = 0;

	public get Status(): BehaviorSubject<boolean> {
		return this.status;
	}

	public display(value: boolean) {
		if (value || this.counter <= 0) {
			this.status.next(value);
		}
	}

	public toggle() {
		this.status.next(!this.status.value);
	}

	public async run<T>(fn: () => Promise<BaseResponse<T>>, minSeconds = 2000): Promise<BaseResponse<T>> {
		const timer = setTimeout(() => this.display(true), minSeconds);
		try {
			this.counter++;
			return await fn();
		} finally {
			clearTimeout(timer);
			if (--this.counter <= 0) {
				this.display(false);
			}
		}
	}
}
