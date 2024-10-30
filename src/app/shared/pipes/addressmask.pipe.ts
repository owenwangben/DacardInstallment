import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'addressmask'
})
export class AddressMaskPipe implements PipeTransform {

    transform(value: string): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }
        const chiStartIdx = value.search('[\u4e00-\u9fff]');
        return value.slice(0, chiStartIdx + 6) + '●●●●●●●●●●●';//返回固定長度●
        // return value.slice(0, chineseIdx + 6) + value.slice(chineseIdx + 6, value.length).replace(/./g, '●');//返回動態長度●
    }

}
