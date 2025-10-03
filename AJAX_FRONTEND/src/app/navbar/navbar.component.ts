import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  
  constructor(private router: Router) {}
  
  onNavClick(event: Event) {
    console.log('Nav clicked:', event.target);
    console.log('Event type:', event.type);
    console.log('Current URL:', this.router.url);
    
    // Prevent default to test if click is being registered
    event.preventDefault();
    
    // Manually navigate to test routing
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (link) {
      const href = link.getAttribute('routerLink');
      if (href) {
        console.log('Navigating to:', href);
        this.router.navigate([href]);
      }
    }
  }
}
