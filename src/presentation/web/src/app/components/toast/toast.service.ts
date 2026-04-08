import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string, duration = 3200): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4200): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3200): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toasts.update((items) => items.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
    this.toasts.set([]);
  }

  private show(message: string, type: ToastType, duration: number): void {
    const id = this.nextId++;
    this.toasts.update((items) => [...items, { id, message, type }]);

    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }
}