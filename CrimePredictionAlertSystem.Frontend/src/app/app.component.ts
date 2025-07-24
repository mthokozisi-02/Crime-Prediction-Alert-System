import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { HomeComponent } from "./pages/home/home.component";
import { ReportIncidentComponent } from './pages/report-incident/report-incident.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { CrimeMapComponent } from './pages/crime-map/crime-map.component';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HomeComponent, ReportIncidentComponent, NavbarComponent, AlertsComponent, CrimeMapComponent,GoogleMapsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CrimePredictionAlertSystem.Frontend';
  active: any = '#home';
  currentRoute: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.currentRoute = true;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.windowScroll, true);
      initFlowbite();
    }
    
  }

  windowScroll() {
    const navbar = document.getElementById("navbar");
    if (navbar != null) {
      if (
        document.body.scrollTop >= 50 ||
        document.documentElement.scrollTop >= 50
      ) {
        navbar.classList.add("is-sticky");
      } else {
        navbar.classList.remove("is-sticky");
      }
    }
  }

  ScrollIntoView(elem: string) {
    this.active = elem;
    let ele = document.querySelector(elem) as any;
    ele.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
