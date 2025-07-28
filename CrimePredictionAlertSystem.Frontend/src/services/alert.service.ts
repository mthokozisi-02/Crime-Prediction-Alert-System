import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CrimeAlert } from '../interfaces/crime-alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<CrimeAlert[]>(this.getStoredAlerts());
  alerts$ = this.alertSubject.asObservable();

  private getStoredAlerts(): CrimeAlert[] {
    return JSON.parse(localStorage.getItem('crimeAlerts') || '[]');
  }

  addAlert(newAlert: CrimeAlert) {
    const alerts = this.getStoredAlerts();
    alerts.push(newAlert);

    const latest = alerts.slice(-5); // keep only last 10
    localStorage.setItem('crimeAlerts', JSON.stringify(latest));

    this.alertSubject.next(latest); // 🔔 Notify subscribers
  }
}
