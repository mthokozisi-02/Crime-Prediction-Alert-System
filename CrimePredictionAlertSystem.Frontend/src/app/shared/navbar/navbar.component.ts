import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../services/alert.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [AsyncPipe],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  count$!: Observable<number>;

  active: any = '#home';

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.count$ = this.alertService.alertsCount();
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
