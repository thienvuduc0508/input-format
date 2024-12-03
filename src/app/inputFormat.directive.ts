import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: true
})
export class DecimalLimitDirective {
  @Input() fractionDigits: number = 0; // Số chữ số phần thập phân
  @Input() maxLength: number | null = null; // Số chữ số phần nguyên (không tính dấu phẩy)

  constructor(private el: ElementRef) {}

  private formatCurrency(value: string): string {
    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = value.split('.');
    // Thêm dấu phẩy vào phần nguyên
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  private cleanValue(value: string): string {
    // Loại bỏ dấu phẩy để xử lý logic
    return value.replace(/,/g, '');
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0; // Lưu vị trí con trỏ trước khi xử lý
    const previousValue = input.value; // Lưu giá trị cũ
    const cleanValue = this.cleanValue(previousValue); // Xóa dấu phẩy để xử lý

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = cleanValue.split('.');

    // Giới hạn số chữ số phần nguyên
    let newIntegerPart = integerPart;
    if (this.maxLength !== null && integerPart.length > this.maxLength) {
      newIntegerPart = integerPart.slice(0, this.maxLength);
    }

    // Giới hạn số chữ số phần thập phân
    let newDecimalPart = decimalPart;
    if (this.fractionDigits > 0 && decimalPart !== undefined && decimalPart.length > this.fractionDigits) {
      newDecimalPart = decimalPart.slice(0, this.fractionDigits);
    }

    // Kết hợp lại giá trị
    const newValue = this.formatCurrency(
      `${newIntegerPart}${newDecimalPart !== undefined ? '.' + newDecimalPart : ''}`
    );

    // Cập nhật giá trị input
    input.value = newValue;

    // Đặt lại vị trí con trỏ
    const diff = newValue.length - previousValue.length; // Sự thay đổi độ dài sau định dạng
    input.selectionStart = input.selectionEnd = cursorPosition + diff;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', '.'];
    const isNumber = /[0-9]/.test(event.key);
    const isDot = event.key === '.';

    const input = event.target as HTMLInputElement;
    const currentValue = this.cleanValue(input.value); // Giá trị hiện tại không có dấu phẩy
    const [integerPart, decimalPart] = currentValue.split('.');

    // Không cho phép nhập ký tự không hợp lệ
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

    // Giới hạn phần nguyên
    if (this.maxLength !== null && integerPart.length >= this.maxLength && !currentValue.includes('.')) {
      // Nếu đã có dấu chấm, cho phép nhập phần thập phân
      if (!isDot && event.key !== 'Backspace') {
        event.preventDefault();
      }
    }

    // Giới hạn phần thập phân
    if (decimalPart !== undefined && decimalPart.length >= this.fractionDigits) {
      // Cho phép nhập thêm phần nguyên nếu con trỏ ở trước dấu chấm
      if (currentValue.includes('.') && isNumber && input.selectionStart! <= integerPart.length) {
        return;
      }
      if (isNumber) {
        event.preventDefault();
      }
    }
  }
}
