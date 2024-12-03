import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalLimitDirective } from '../inputFormat.directive';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [FormsModule, DecimalLimitDirective ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss'
})
export class FormInputComponent {

}
