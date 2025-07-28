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

  private map!: L.Map;
  private heatLayer!: L.Layer;
  private watchId: number | null = null;
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

        marker.bindPopup('You are here').openPopup();

      });
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

}