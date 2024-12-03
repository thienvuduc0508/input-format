import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: true
})
export class DecimalLimitDirective {
  @Input() fractionDigits: number = 0;
  @Input() maxLength: number | null = null; // Giới hạn số chữ số phần nguyên

  constructor(private el: ElementRef) {}

  private formatCurrency(value: string): string {
    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = value.split('.');
    // Thêm dấu phẩy vào phần nguyên
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  private cleanValue(value: string): string {
    // Loại bỏ tất cả dấu phẩy để xử lý logic
    return value.replace(/,/g, '');
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = this.cleanValue(input.value); // Xóa dấu phẩy để xử lý

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = value.split('.');

    // Giới hạn số chữ số phần nguyên
    if (this.maxLength !== null && integerPart.length > this.maxLength) {
      value = integerPart.slice(0, this.maxLength) + (decimalPart !== undefined ? '.' + decimalPart : '');
    }

    // Giới hạn số chữ số phần thập phân
    if (this.fractionDigits > 0 && decimalPart !== undefined && decimalPart.length > this.fractionDigits) {
      value = integerPart + '.' + decimalPart.slice(0, this.fractionDigits);
    }

    // Định dạng lại giá trị
    input.value = this.formatCurrency(value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '.'];
    const isNumber = /[0-9]/.test(event.key);
    const isDot = event.key === '.';

    const input = event.target as HTMLInputElement;
    const currentValue = this.cleanValue(input.value); // Giá trị hiện tại không có dấu phẩy
    const [integerPart, decimalPart] = currentValue.split('.');

    // Chỉ cho phép nhập số và các phím điều khiển
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }

    // Không cho phép nhập dấu chấm nếu fractionDigits = 0
    if (isDot && this.fractionDigits === 0) {
      event.preventDefault();
    }

    // Không cho phép nhập thêm dấu chấm nếu đã tồn tại
    if (isDot && currentValue.includes('.')) {
      event.preventDefault();
    }

    // Giới hạn số chữ số phần nguyên
    if (this.maxLength !== null && integerPart.length >= this.maxLength && !currentValue.includes('.')) {
      if (!isDot && event.key !== 'Backspace') {
        event.preventDefault();
      }
    }

    // Giới hạn số chữ số phần thập phân
    if (decimalPart !== undefined && decimalPart.length >= this.fractionDigits && isNumber) {
      event.preventDefault();
    }
  }
}
