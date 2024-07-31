import { Component } from '@angular/core';
import { HomeComponent } from '../home.component';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'aside[app-sidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  appName = environment.projectName;
  constructor(private router: Router,
    private homeComponent: HomeComponent) { }


  ngAfterViewInit() {
    const menu = document.getElementsByName('mainParent')[0];
    const targets = menu.getElementsByTagName('a');
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].pathname === this.router.url) {
        this.homeComponent.AddClass(targets[i] as HTMLElement);
        break;
      }
    }
  }

  public SetActive(event: MouseEvent) {
    let targetElement = event.target as HTMLElement;
    if (targetElement.nodeName !== 'A') {
      targetElement = targetElement.parentElement!;
    }
    this.homeComponent.SetActive(targetElement);
  }

}
