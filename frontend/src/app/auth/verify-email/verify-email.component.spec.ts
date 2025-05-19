import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['verifyCode']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            // Mock queryParams as observable - adjust if component uses params instead
            queryParams: of({ code: 'mockCodeFromQueryParam', email: 'test@example.com' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show error if no email in localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.verify();
    expect(component.error).toBe('No email found for verification.');
  });

  it('should verify code and navigate on success', () => {
    spyOn(localStorage, 'getItem').and.returnValue('saivignesh@blazeautomation.com');
    authServiceSpy.verifyCode.and.returnValue(of({}));

    component.code = '123456';
    component.verify();

    expect(authServiceSpy.verifyCode).toHaveBeenCalledWith('saivignesh@blazeautomation.com', '123456');
    expect(component.message).toBe('Email verified successfully. Please log in.');
  });

  it('should set error on verification failure', () => {
    spyOn(localStorage, 'getItem').and.returnValue('saivignesh@blazeautomation.com');
    authServiceSpy.verifyCode.and.returnValue(throwError(() => ({ error: { message: 'Fail' } })));

    component.code = 'wrongcode';
    component.verify();

    expect(component.error).toBe('Fail');
  });
});
