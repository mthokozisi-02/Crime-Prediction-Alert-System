import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';
import { ToastrService } from 'ngx-toastr';
import { CrimeAlert } from '../../../interfaces/crime-alert';
import { AlertService } from '../../../services/alert.service';

// Fix Leaflet's default icon paths (important for proper marker display)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-crime-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crime-map.component.html',
  styleUrls: ['./crime-map.component.css']
})
export class CrimeMapComponent implements AfterViewInit, OnDestroy {
  alerts: CrimeAlert[] = [];

  active: any;

  private map!: L.Map;
  private heatLayer!: L.Layer;
  private watchId: number | null = null;
  private hasAlerted = false;
  private userLat!: number;
  private userLng!: number;

  private readonly alertRadiusMeters = 200;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private alertService: AlertService
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const center: L.LatLngExpression = [coords.latitude, coords.longitude];
        this.userLat = coords.latitude;
        this.userLng = coords.longitude;

        this.initMap(center);
        this.watchUserLocation();
      },
      (error) => {
        console.warn('Geolocation error:', error);
        const fallbackCenter: L.LatLngExpression = [0, 0];
        this.initMap(fallbackCenter);
      }
    );
  }

  private initMap(center: L.LatLngExpression): void {
    this.map = L.map('map-container').setView(center, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.addHeatmapLayer(center);
  }

  private addHeatmapLayer(center: L.LatLngExpression): void {
    const [lat, lng] = center as [number, number];
    const heatData: [number, number, number][] = [
      [lat, lng, 10],
      [lat + 0.002, lng + 0.002, 8],
      [lat - 0.002, lng - 0.002, 15]
    ];

    this.heatLayer = (L as any).heatLayer(heatData, {
      radius: 40,
      blur: 15,
      maxZoom: 17
    }).addTo(this.map);
  }

  private watchUserLocation(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported.');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      ({ coords }) => this.handleUserPosition(coords.latitude, coords.longitude),
      (err) => console.error('Error watching position:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }

  private async handleUserPosition(lat: number, lng: number): Promise<void> {
    const address = await this.reverseGeocode(lat, lng)
    console.log('moving to:', address);
    // Remove previous user markers if needed - optional improvement
    // Could keep a reference to the marker and update position instead of adding new marker every time

    // Add/update marker for current user location
    L.marker([lat, lng], { title: 'Your Location' })
      .addTo(this.map)
      .bindPopup('You are here')
      .openPopup();

    if (this.isInDangerZone(lat, lng)) {
      if (!this.hasAlerted) {
        this.hasAlerted = true;
        this.triggerAlert(lat, lng);
      }
    } else {
      this.hasAlerted = false;
    }
  }

  private isInDangerZone(lat: number, lng: number): boolean {
    const distance = this.getDistanceBetweenCoords(lat, lng, this.userLat, this.userLng);
    return distance <= this.alertRadiusMeters;
  }

  private triggerAlert(lat: number, lng: number): void {
    // Save alert locally and via service
    this.alertService.addAlert({ lat, lng, timestamp: new Date().toISOString() });
    this.ScrollIntoView('#safety-tips')

    const audio = new Audio('assets/sounds/beep.mp3');
    if (document.readyState === 'complete') {
      audio.play()
        .then(() => {
          setTimeout(() => {
            this.toastr.warning('You have entered a high-risk crime zone!', 'Crime Alert ⚠️');
          }, 500);
        })
        .catch(err => {
          console.warn('Audio playback failed:', err);
          this.toastr.warning('You have entered a high-risk crime zone!', 'Crime Alert ⚠️');
        });
    } else {
      this.toastr.warning('You have entered a high-risk crime zone!', 'Crime Alert ⚠️');
    }
  }

  private getDistanceBetweenCoords(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
              Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }


  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
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

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || 'Unknown location';
  }

}
