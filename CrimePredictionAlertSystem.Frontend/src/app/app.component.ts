import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { HomeComponent } from './pages/home/home.component';
import { AlertsComponent } from './pages/alerts/alerts.component';  
import { CrimeMapComponent } from './pages/crime-map/crime-map.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ReportIncidentComponent } from './pages/report-incident/report-incident.component';
import { SafetyTipsComponent } from './pages/safety-tips/safety-tips.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';

@Component({
    selector: 'app-root',
    imports: [HomeComponent, AlertsComponent, CrimeMapComponent, NavbarComponent,
       ReportIncidentComponent, SafetyTipsComponent, ContactUsComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CrimePredictionAlertSystem.Frontend';
  
  audio = new Audio('assets/sounds/beep.mp3');

  ngOnInit(): void {
    initFlowbite();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.audio.play()
    }
  }
}
