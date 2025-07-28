import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';
import { ToastrService } from 'ngx-toastr';
import { CrimeAlert } from '../../../interfaces/crime-alert';
import { AlertService } from '../../../services/alert.service';


// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
    selector: 'app-crime-map',
    standalone: true,
    imports: [
        CommonModule,
    ],
    templateUrl: './crime-map.component.html',
    styleUrls: ['./crime-map.component.css']
})
export class CrimeMapComponent {

  alerts: CrimeAlert[] = [];

  private map!: L.Map;
  private heatLayer!: L.Layer;
  private watchId: number | null = null;
  
  lat_: any
  long_: any
  private hasAlerted = false;
  audio = new Audio('assets/sounds/beep.mp3'); // 🔊 Preload outside the handler

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private alertService: AlertService
  ) {}

ngAfterViewInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
        console.log('first:', center)
        this.initMap(center);
        this.watchUserLocation();
      },
      (error) => {
        console.warn('Geolocation error. Cannot determine current location.', error);

        // Optional fallback (e.g., center of city or world)
        const fallback: L.LatLngExpression = [0, 0]; // You could use any meaningful default here
        this.initMap(fallback);
      }
    );
  }
}


  initMap(center: L.LatLngExpression) {
    this.map = L.map('map-container').setView(center, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const [lat, lng] = center as [number, number];
    [this.lat_, this.long_] = [lat, lng];

    const heatData: [number, number, number?][] = [
      [lat, lng, 10.0],
      [lat + 0.002, lng + 0.002, 8.0],
      [lat - 0.002, lng - 0.002, 15.0]
    ];

    this.heatLayer = (L as any).heatLayer(heatData, {
      radius: 40,
      blur: 15,
      maxZoom: 17
    }).addTo(this.map);
  }

watchUserLocation() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const marker = L.marker([lat, lng], {
          title: 'Your Location'
        }).addTo(this.map);

        // 💥 Check if user is in a danger zone
      if (this.isInDangerZone(lat, lng)) {
        if (!this.hasAlerted) {
          this.hasAlerted = true;

          this.alertService.addAlert({
            lat,
            lng,
            timestamp: new Date().toISOString()
          });// 🔴 Save alert to local storage

          // ✅ Play the beep first
          const audio = new Audio('assets/sounds/beep.mp3');

          // 🔐 Ensure user interacted with the page (so sound will play)
          if (document.readyState === 'complete') {
            audio.play().then(() => {
              // ✅ After beep, show the toast (optional delay)
              setTimeout(() => {
                this.toastr.warning('You have entered a high-risk crime zone!', 'Crime Alert ⚠️');
              }, 500); // ⏱️ wait 0.5 sec for beep to finish
            }).catch((err) => {
              console.warn('Audio play failed:', err);
              // fallback: show toast immediately
              this.toastr.warning('You have entered a high-risk crime zone!', 'Crime Alert ⚠️');
            });
          }
        }
      } else {
        this.hasAlerted = false;
      }

        marker.bindPopup('You are here').openPopup();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  isInDangerZone(userLat: number, userLng: number): boolean {
  const dangerRadiusMeters = 200; // match your heatmap radius approx
  console.log('second:', this.lat_,'...', this.long_)
  
    const [lat, lng] = [this.lat_, this.long_];
    const distance = this.getDistanceFromLatLng(userLat, userLng, lat, lng);
    if (distance <= dangerRadiusMeters) {
      return true;
  }

  return false;
}

private getDistanceFromLatLng(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = this.deg2rad(lat2 - lat1);
  const dLng = this.deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

private storeCrimeAlert(lat: number, lng: number): void {
  const alerts: CrimeAlert[] = JSON.parse(localStorage.getItem('crimeAlerts') || '[]');

  alerts.push({
    lat,
    lng,
    timestamp: new Date().toISOString()
  });

  // ✅ Keep only the latest 10 alerts
  const latestAlerts = alerts.slice(-10);

  localStorage.setItem('crimeAlerts', JSON.stringify(latestAlerts));
}


}