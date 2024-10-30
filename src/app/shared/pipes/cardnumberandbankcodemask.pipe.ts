import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardnumberandbankcodemask'
})
export class CardNumberAndBankCodeMaskPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }
        const maskedPart = value.slice(0, -4).replace(/./g, '*');
        const visiblePart = value.slice(-4);
        return maskedPart + visiblePart;

    }

}
