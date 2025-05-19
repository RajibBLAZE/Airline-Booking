import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register', 'saveToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mode', () => {
    const initial = component.isLogin;
    component.toggleMode();
    expect(component.isLogin).toBe(!initial);
  });

  it('should call login on submit when isLogin true and navigate on success', fakeAsync(() => {
    component.isLogin = true;
    component.authForm.setValue({
      username: 'user1',
      email: 'saivignesh@blazeautomation.com',
      password: 'pass123',
      phone: '1234567890',
      isStudent: false,
    });

    authServiceSpy.login.and.returnValue(of({ token: 'abcd' }));
    component.submit();
    tick(1500);

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(authServiceSpy.saveToken).toHaveBeenCalledWith('abcd');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/flight']);
    expect(component.message).toBe('Login Successful!');
  }));

  it('should call register on submit when isLogin false and navigate to verify-email', () => {
    component.isLogin = false;
    component.authForm.setValue({
      username: 'user1',
      email: 'saivignesh@blazeautomation.com',
      password: 'pass123',
      phone: '1234567890',
      isStudent: false,
    });

    authServiceSpy.register.and.returnValue(of({}));
    component.submit();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/verify-email']);
  });

  it('should set error message on login failure', () => {
    component.isLogin = true;
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Login failed' } })));
    component.submit();
    expect(component.error).toBe('Login failed');
  });
});
