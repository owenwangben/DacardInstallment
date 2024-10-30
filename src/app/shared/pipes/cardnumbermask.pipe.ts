import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cardnumbermask'
})
export class CardNumberMaskPipe implements PipeTransform {

    transform(value: string, symbol: string): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }
        const visibleDigits = 5;
        let visibleSectionF = value.slice(0, 7);
        let maskedSection = value.slice(7, -visibleDigits);
        let visibleSectionB = value.slice(-visibleDigits);
        return visibleSectionF + maskedSection.replace(/./g, symbol) + visibleSectionB;
    }

}
