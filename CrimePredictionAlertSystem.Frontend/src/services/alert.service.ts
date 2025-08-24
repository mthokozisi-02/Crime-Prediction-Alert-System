import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CrimeAlert } from '../interfaces/crime-alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private readonly STORAGE_KEY = 'crimeAlerts';

  private alertSubject = new BehaviorSubject<CrimeAlert[]>(this.getStoredAlerts());
  alerts$ = this.alertSubject.asObservable();

  private getStoredAlerts(): CrimeAlert[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  addAlert(newAlert: CrimeAlert) {
    const alerts = this.getStoredAlerts();
    alerts.push(newAlert);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(alerts));

    this.alertSubject.next(alerts); // 🔔 Notify subscribers
  }

  removeAlert(timestamp: string){
    const alerts = this.getStoredAlerts();
    const updatedAlerts = alerts.filter(alert => alert.timestamp !== timestamp);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedAlerts));
    this.alertSubject.next(updatedAlerts); // 🔔 Notify subscribers
  }

  alertsCount(): Observable<number> {
    return this.alerts$.pipe(map((alerts: any) => alerts.length));
  }
}
