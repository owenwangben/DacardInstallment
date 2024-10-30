import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pricemask'
})
export class PriceMaskPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }
        const amount = Number(value.replace(/[^0-9]/g, ''));
        const hiddenAmount = '*'.repeat(amount.toString().length);
        return hiddenAmount;

    }

}
