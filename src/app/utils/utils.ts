import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../Services/utils';

@Component({
  selector: 'app-utils',
  imports: [CommonModule],
  templateUrl: './utils.html',
  styleUrls: ['./utils.css']
})
export class Utils {
  utilsService = inject(UtilsService);
}