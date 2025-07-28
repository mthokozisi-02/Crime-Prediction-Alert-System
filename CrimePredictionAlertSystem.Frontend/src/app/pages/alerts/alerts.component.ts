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
        this.crimeAlerts = alerts;
        console.log('Updated Alerts:', alerts);
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}
