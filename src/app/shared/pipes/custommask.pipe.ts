import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'custommask'
})
export class CustomMaskPipe implements PipeTransform {
    // 無frontLen、endLen --> 隱碼4-9
    transform(str: string, frontLen?: number, endLen?: number): string {
        frontLen ? frontLen = frontLen : frontLen = 3;
        endLen ? endLen = endLen : endLen = str.length - frontLen - 6;
        let dot = '';
        let len = str.length - frontLen - endLen;
        if (str.length > frontLen) {
            for (let i = 0; i < len; i++) {
                dot += '●';
            }
            return (str.substring(0, frontLen) + dot + str.substring(str.length - endLen))
        } else {
            return str
        }
    }
}
