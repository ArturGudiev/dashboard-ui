import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [MatButton, MatFormField, MatInput, MatLabel, ReactiveFormsModule, FormField],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly submitting = signal(false);

  loginModel = signal({
    username: '',
    password: '',
  });

  loginForm = form(this.loginModel, (path) => {
    required(path.username);
    required(path.password);
  });

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.submitting()) {
      return;
    }

    const model = this.loginModel();
    this.submitting.set(true);

    this.authService.login(model.username, model.password).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.submitting.set(false);
        const message = error?.error?.error ?? 'Login failed';
        this.alertService.showAlert(message);
      },
    });
  }
}
