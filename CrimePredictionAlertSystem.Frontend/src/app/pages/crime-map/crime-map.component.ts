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
  center: google.maps.LatLngLiteral = { lat: -17.8292, lng: 31.0522 };
  watchId: number | null = null; // store watch ID so you can stop it later
  zoom = 13;

  heatmap: google.maps.visualization.HeatmapLayer | undefined;
  mapInstance: google.maps.Map | undefined;
  userMarkerElement: google.maps.marker.AdvancedMarkerElement | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setUserLocation();
    }
  }

  onMapReady(map: google.maps.Map) {
    this.mapInstance = map;

    // Initialize heatmap
    const heatmapData = [
      new google.maps.LatLng(-20.181369, 28.6045371),
      new google.maps.LatLng(-17.8321, 31.0600),
      new google.maps.LatLng(-17.8300, 31.0550)
    ];

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map
    });

    this.heatmap.set('radius', 30);
    this.heatmap.set('opacity', 0.6);
  }

 setUserLocation() {
  if (navigator.geolocation) {
    this.watchId = navigator.geolocation.watchPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.center = { lat, lng };

        if (this.mapInstance && google.maps.marker) {
          const { AdvancedMarkerElement } = google.maps.marker;

          if (!this.userMarkerElement) {
            // First time: create the marker
            const customDiv = document.createElement('div');
            customDiv.innerHTML = `
              <div style="
                width: 20px;
                height: 20px;
                background-color: #3b82f6;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(0,0,0,0.3);
              "></div>
            `;

            this.userMarkerElement = new AdvancedMarkerElement({
              map: this.mapInstance,
              position: { lat, lng },
              title: 'Your Location',
            });
          } else {
            // Update position if marker already exists
            this.userMarkerElement.position = { lat, lng };
          }
        }

        this.cdr.detectChanges();
      },
      error => {
        console.warn('Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  } else {
    console.warn('Geolocation is not supported by this browser.');
  }
}

}
