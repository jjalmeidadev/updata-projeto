import { animate, group, query, style, transition, trigger } from '@angular/animations';

const duration = '280ms';
const easing = 'ease-out';

/**
 * Route transition only between input-method ↔ form (see routeAnimation data on routes).
 * Uses opacity + transform only.
 */
export const inputMethodFormRouteAnimation = trigger('inputMethodFormRoute', [
  transition('inputMethod => form, form => inputMethod', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate(
          `${duration} ${easing}`,
          style({ opacity: 0, transform: 'translateY(-8px)' }),
        ),
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(
          `${duration} ${easing}`,
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ], { optional: true }),
    ]),
  ]),
]);
