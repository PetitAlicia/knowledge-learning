import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CoursesComponent } from './courses/courses.component';
import { AuthGuard } from './auth.guard';
import { LessonPageComponent } from './lesson-page/lesson-page.component';
import { RegisterComponent } from './register/register.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { CertificationsComponent } from './certifications/certifications.component';
import { HomeComponent } from './home/home.component';
import { Page404Component } from './page-404/page-404.component';
import { LegalNoticesComponent } from './legal-notices/legal-notices.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { AccessibilityComponent } from './accessibility/accessibility.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CookieManagementComponent } from './cookie-management/cookie-management.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate/:token', component: ActivateAccountComponent },
  { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard] },
  { path: 'lesson/:id', component: LessonPageComponent },
  { path: 'certifications', component: CertificationsComponent },
  { path: 'legal-notices', component: LegalNoticesComponent },
  { path: 'personal-data', component: PersonalDataComponent },
  { path: 'accessibility', component: AccessibilityComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'cookie-management', component: CookieManagementComponent },
  { path: "**", component: Page404Component }
];
