import { Component } from '@angular/core';
import { CrimeAlert } from '../../../interfaces/crime-alert';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-alerts',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.css'
})
export class AlertsComponent {
    crimeAlerts: CrimeAlert[] = [];
    private sub!: Subscription;

    constructor(private alertService: AlertService) {}
    
    ngOnInit(): void {
        this.sub = this.alertService.alerts$.subscribe((alerts) => {
        this.crimeAlerts = alerts.slice(-5);
        this.crimeAlerts.forEach(async alert => {
            alert.address = await this.reverseGeocode(alert.lat, alert.lng);
        });
        });
    }

    private async reverseGeocode(lat: number, lng: number): Promise<string> {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        return data.display_name || 'Unknown location';
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    removeAlert(timestamp: string) {
        this.alertService.removeAlert(timestamp);
    }

    
}
