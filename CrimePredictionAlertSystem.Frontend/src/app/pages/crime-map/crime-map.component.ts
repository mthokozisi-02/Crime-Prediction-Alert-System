import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';

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

  center: L.LatLngExpression = [-17.8292, 31.0522];
  private map!: L.Map;
  private heatLayer!: L.Layer;
  private watchId: number | null = null;
  private defaultCenter: L.LatLngExpression = [-17.8292, 31.0522];
  zoom = 13;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.geolocation.getCurrentPosition(
      (position) => {
        const center: L.LatLngExpression = [position.coords.latitude, position.coords.longitude];
          this.initMap(center);
          this.cdr.detectChanges();
          this.watchUserLocation();
      },
      (error) => {
        console.warn('Geolocation error. Falling back to default location.', error);
        this.initMap(this.defaultCenter);
      }
      );
    }
  }

   initMap(center: L.LatLngExpression) {
    this.map = L.map('map-container').setView(center, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const heatData: [number, number, number?][] = [
      [-17.8292, 31.0522, 10.0], // higher weights
      [-17.8321, 31.0600, 8.0],
      [-17.8300, 31.0550, 15.0]
    ];

    (L as any).heatLayer(heatData, {
      radius: 40,
      blur: 15,
      maxZoom: 17
    }).addTo(this.map);

    setTimeout(() => {
    this.map.invalidateSize(); // <-- key fix
  }, 100);
  }

watchUserLocation() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const marker = L.marker([lat, lng], {
          title: 'Your Location'
        }).addTo(this.map);

        this.map.setView([lat, lng]);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

}