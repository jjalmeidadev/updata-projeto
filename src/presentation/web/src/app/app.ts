import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { inputMethodFormRouteAnimation } from './animations/input-method-form-route.animation';
import { ToastContainerComponent } from './components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [inputMethodFormRouteAnimation],
})
export class App {
  protected readonly title = signal('meu-app');

  protected prepareRouteAnimation(outlet: RouterOutlet): string {
    if (!outlet.isActivated) {
      return '';
    }
    const key = outlet.activatedRoute.snapshot.data['routeAnimation'];
    return typeof key === 'string' ? key : '';
  }
}
