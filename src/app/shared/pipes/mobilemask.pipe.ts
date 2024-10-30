import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mobilemask'
})
export class MobileMaskPipe implements PipeTransform {
    // silcelen:隱碼預設後3碼
    transform(value: string, symbol: string, silcelen?: number): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }
        let visibleSectionF = value.slice(0, silcelen ? silcelen : 7);
        let maskedSection = value.slice(silcelen ? silcelen : 7, value.length);
        return visibleSectionF + maskedSection.replace(/./g, symbol);
    }

}
