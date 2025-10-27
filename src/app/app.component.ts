import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/notifications/toast-container.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastContainerComponent, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tp-angular-events';
  constructor(public router: Router) {}
  get showLayout(): boolean {
    const url = this.router.url;
    return !(url.includes('login') || url.includes('register'));
  }
}