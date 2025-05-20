import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BoardingPassComponent } from './boarding-pass.component';

describe('BoardingPassComponent', () => {
  let component: BoardingPassComponent;
  let fixture: ComponentFixture<BoardingPassComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoardingPassComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '123' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardingPassComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Note: DO NOT call fixture.detectChanges() here to avoid auto-triggering HTTP call
  });

  afterEach(() => {
    httpMock.verify(); // verify no unmatched requests remain
  });

  it('should fetch boarding passes on init', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit and schedules setTimeout

    tick(1500); // fast-forward timer to trigger fetchBoardingPass

    const req = httpMock.expectOne('http://localhost:3005/api/flight/boarding-pass/123');
    expect(req.request.method).toBe('GET');

    const mockData = [
      {
        name: 'John Doe',
        booking: {
          flightNumber: 123,
          from: 'NYC',
          to: 'LAX',
          departureTime: '10:00',
          arrivalTime: '13:00',
          duration: '3h',
          date: '2025-05-19',
          class: 'Economy',
          fareType: 'Regular',
          seat: '12A',
          gate: 'G5',
          ticketNumber: 'T123456',
        },
      },
    ];
    req.flush(mockData);

    expect(component.boardingPasses.length).toBe(1);
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('');
  }));

  it('should handle error when fetching boarding passes', fakeAsync(() => {
    fixture.detectChanges();

    tick(1500);

    const req = httpMock.expectOne('http://localhost:3005/api/flight/boarding-pass/123');
    req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage).toBe('Error');
    expect(component.loading).toBeFalse();
    expect(component.boardingPasses.length).toBe(0);
  }));
});
