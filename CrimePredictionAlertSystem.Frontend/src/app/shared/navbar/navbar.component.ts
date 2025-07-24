import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  active: any = '#home';

  
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
