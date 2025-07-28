import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';

@Component({
    selector: 'app-crime-map',
    imports: [
        CommonModule,
        GoogleMap
    ],
    templateUrl: './crime-map.component.html',
    styleUrls: ['./crime-map.component.css']
})
export class CrimeMapComponent {
  map!: google.maps.Map;

  center: google.maps.LatLngLiteral = { lat: -17.8292, lng: 31.0522 };
  watchId: number | null = null; // store watch ID so you can stop it later
  zoom = 13;

  mapInstance: google.maps.Map | undefined;
  userMarkerElement: google.maps.marker.AdvancedMarkerElement | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      navigator.geolocation.getCurrentPosition(
      (position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.loadMap(); // Load map only when location is ready
        this.watchUserLocation(); // Start watching position after map is loaded
      },
      (error) => {
        console.warn('Geolocation error. Falling back to default location.', error);
        this.loadMap(); // Still load map with default center
      }
    );
  }

  loadMap() {
    const map = new google.maps.Map(document.getElementById('map-container') as HTMLElement, {
      center: this.center,
      zoom: 18,
      mapId: '4d4d3badd596bb40ec9ef0a6'
    });

    this.map = map;
    this.mapInstance = map;

    this.loadHeatmapLayer(map);
  }

async loadHeatmapLayer(map: google.maps.Map) {

    const { GoogleMapsOverlay } = await import('@deck.gl/google-maps');
    const { HeatmapLayer } = await import('@deck.gl/aggregation-layers');


  const overlay = new GoogleMapsOverlay({
    layers: [
      new HeatmapLayer({
        id: 'crime-heatmap',
        data: [
          { position: [-17.8292, 31.0522], weight: 1 },
          { position: [-17.8321, 31.0600], weight: 0.5 },
          { position: [-17.8300, 31.0550], weight: 1.2 }
        ],
        getPosition: d => [d.position[1], d.position[0]], // [lng, lat]
        getWeight: d => d.weight,
        radiusPixels: 60
      })
    ]
  });

  overlay.setMap(map);
}


 watchUserLocation() {
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