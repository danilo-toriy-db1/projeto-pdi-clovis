import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AtrasoService {
  aguardar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
