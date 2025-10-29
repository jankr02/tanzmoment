import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './shared/ui/button/button.component';

@Component({
  imports: [RouterModule, ButtonComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'web';
}
