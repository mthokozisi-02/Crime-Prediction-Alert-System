import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-crime-map',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  templateUrl: './crime-map.component.html',
  styleUrl: './crime-map.component.css'
})
export class CrimeMapComponent {
  center: google.maps.LatLngLiteral = { lat: -17.8292, lng: 31.0522 }; // default fallback
  zoom = 13;

  userMarker: google.maps.LatLngLiteral | null = null; // 👈 Marker position
  heatmap: google.maps.visualization.HeatmapLayer | undefined;
  mapInstance: google.maps.Map | undefined;
  currentRoute: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.currentRoute = true;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setUserLocation(); // move this up BEFORE heatmap radius/opacity
    }
  }

  onMapReady(map: google.maps.Map) {
    this.mapInstance = map;

    const heatmapData = [
      new google.maps.LatLng(-20.181369, 28.6045371),
      new google.maps.LatLng(-17.8321, 31.0600),
      new google.maps.LatLng(-17.8300, 31.0550)
      // Replace with actual reports
    ];

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map
    });

    // Apply heatmap options
    this.heatmap.set('radius', 30);
    this.heatmap.set('opacity', 0.6);
  }

  setUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('position:',position.coords.accuracy)

          this.center = { lat, lng };
          this.userMarker = { lat, lng }; // 👈 Save marker location
          this.cdr.detectChanges();
        },
        error => {
          console.warn('Geolocation not available or denied. Using default location.', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  }
}
