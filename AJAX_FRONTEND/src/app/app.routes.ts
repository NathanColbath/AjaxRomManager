import { Routes } from '@angular/router';
import {RomsComponent} from './roms/roms.component';
import {SystemsManagmentComponent} from './systems-managment/systems-managment.component';
import {SystemsAddComponent} from './systems-add/systems-add.component';
import {SystemsEditComponent} from './systems-edit/systems-edit.component';
import {SettingsComponent} from './settings/settings.component';
import {PlatformRomsComponent} from './platform-roms/platform-roms.component';
import {TestNotificationsComponent} from './test-notifications/test-notifications.component';
import {ScanningComponent} from './scanning/scanning.component';
import {RomsUploadComponent} from './roms-upload/roms-upload.component';


export const routes: Routes = [
  { path: '', redirectTo: '/roms', pathMatch: 'full' },
  { path: 'roms', component: RomsComponent },
  { path: 'roms/platform/:platformId', component: PlatformRomsComponent },
  { path: 'roms/upload', component: RomsUploadComponent },
  { path: 'systems-managment', component: SystemsManagmentComponent },
  { path: 'systems-add', component: SystemsAddComponent },
  { path: 'systems-edit/:id', component: SystemsEditComponent },
  { path: 'scanning', component: ScanningComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'test-notifications', component: TestNotificationsComponent },
];
