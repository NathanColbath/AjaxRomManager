import { Routes } from '@angular/router';
import {RomsComponent} from './roms/roms.component';
import {SystemsManagmentComponent} from './systems-managment/systems-managment.component';
import {SystemsAddComponent} from './systems-add/systems-add.component';
import {SystemsEditComponent} from './systems-edit/systems-edit.component';
import {SettingsComponent} from './settings/settings.component';
import {PlatformRomsComponent} from './platform-roms/platform-roms.component';
import {TestNotificationsComponent} from './test-notifications/test-notifications.component';


export const routes: Routes = [
  { path: '', redirectTo: '/roms', pathMatch: 'full' },
  { path: 'roms', component: RomsComponent },
  { path: 'roms/platform/:platformId', component: PlatformRomsComponent },
  { path: 'systems-managment', component: SystemsManagmentComponent },
  { path: 'systems-add', component: SystemsAddComponent },
  { path: 'systems-edit/:id', component: SystemsEditComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'test-notifications', component: TestNotificationsComponent },
];
