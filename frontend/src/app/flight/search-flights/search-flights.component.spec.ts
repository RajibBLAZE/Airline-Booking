import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SearchFlightsComponent } from './search-flights.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

describe('SearchFlightsComponent', () => {
  let component: SearchFlightsComponent;
  let fixture: ComponentFixture<SearchFlightsComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const validFormData = {
    from: 'NYC',
    to: 'LAX',
    date: '2025-05-20',
    classType: 'economy',
    fareType: 'regular',
    airline: '',
    minPrice: 0,
    maxPrice: 10000,
    timeSlot: '',
    passengers: 1,
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getToken',
      'getUserIdFromToken',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SearchFlightsComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFlightsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Initially trigger ngOnInit and form setup
    fixture.detectChanges();

    // Flush the cities GET request so cities are loaded for all tests
    const req = httpMock.expectOne('http://localhost:3005/api/flight/cities');
    expect(req.request.method).toBe('GET');
    req.flush(['NYC', 'LAX', 'SFO']);
    fixture.detectChanges(); // update after async data load
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have cities loaded on init', () => {
    expect(component.cities).toEqual(['NYC', 'LAX', 'SFO']);
  });

  it('form invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('form valid when all required fields are set', () => {
    component.form.setValue(validFormData);
    expect(component.form.valid).toBeTrue();
  });

  it('should not search if form invalid', () => {
    component.form.controls['from'].setValue('');
    component.onSearch();
    expect(component.submitted).toBeTrue();
    expect(component.flights.length).toBe(0);
  });

  it('should search flights on valid form submission', fakeAsync(() => {
    const mockFlights = [
      { id: 1, airline: 'AirTest', price: 300 },
      { id: 2, airline: 'FlyMock', price: 250 },
    ];

    component.form.setValue(validFormData);
    component.onSearch();

    const req = httpMock.expectOne('http://localhost:3005/api/flight/search');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(validFormData);

    req.flush(mockFlights);
    tick();
    fixture.detectChanges();

    expect(component.flights).toEqual(mockFlights);
    expect(component.showFilters).toBeTrue();
  }));

  describe('bookFlight', () => {
    const flight = { id: 123 };

    it('should navigate to auth if no token', () => {
      authServiceSpy.getToken.and.returnValue(null);
      component.bookFlight(flight);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should alert and not book if userId missing', () => {
      authServiceSpy.getToken.and.returnValue('token123');
      authServiceSpy.getUserIdFromToken.and.returnValue(null);

      spyOn(window, 'alert');

      component.bookFlight(flight);

      expect(window.alert).toHaveBeenCalledWith(
        'You must be logged in to book a flight.'
      );
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should not book flight if passengers is zero or invalid', () => {
      authServiceSpy.getToken.and.returnValue('token123');
      authServiceSpy.getUserIdFromToken.and.returnValue('user456');

      component.form.setValue({ ...validFormData, passengers: 0 });

      spyOn(window, 'alert');
      const dummyFlight = { id: 123 };

      component.form.controls['passengers'].setValue(0);
      component.bookFlight(dummyFlight); // pass a dummy flight object as argument

      expect(window.alert).toHaveBeenCalledWith(
        'Number of passengers must be at least 1.'
      );
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should book flight and navigate on success', fakeAsync(() => {
      authServiceSpy.getToken.and.returnValue('token123');
      authServiceSpy.getUserIdFromToken.and.returnValue('user456');

      component.form.setValue({ ...validFormData, passengers: 2 });

      component.bookFlight(flight);

      const req = httpMock.expectOne('http://localhost:3005/api/flight/book');
      expect(req.request.method).toBe('POST');

      expect(req.request.body).toEqual({
        user_id: 'user456',
        flight_id: flight.id,
        passengers: 2,
        travel_class: component.form.value.classType,
        round_trip: false,
        return_date: null,
      });

      req.flush({ success: true }); // mock success response
      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith([
        '/boarding-pass/user456',
      ]);
    }));

    it('should handle booking error and alert', () => {
      authServiceSpy.getToken.and.returnValue('token123');
      authServiceSpy.getUserIdFromToken.and.returnValue('user456');

      spyOn(window, 'alert');

      component.bookFlight(flight);

      const req = httpMock.expectOne('http://localhost:3005/api/flight/book');
      req.flush(
        { message: 'Error' },
        { status: 500, statusText: 'Server Error' }
      );

      expect(component.loading).toBeFalse();
      expect(window.alert).toHaveBeenCalledWith('Booking failed');
    });
  });
});
