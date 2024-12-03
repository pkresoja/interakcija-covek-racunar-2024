import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FlightModel } from '../../models/flight.model';
import { WebService } from '../../services/web.service';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SafePipe } from '../../services/safe.pipe';

@Component({
  selector: 'app-flight',
  standalone: true,
  imports: [HttpClientModule, RouterLink, NgIf, SafePipe],
  templateUrl: './flight.component.html',
  styleUrl: './flight.component.css'
})
export class FlightComponent {

  public webService: WebService
  public flight: FlightModel | null = null;

  constructor(private route: ActivatedRoute) {
    this.webService = WebService.getInstance()
    route.params.subscribe(params => {
      // Preuzimamo variajble iz putanje
      const id = params['id']

      // Preuzimamo JSON objekat leta za ID
      this.webService.getFlightById(id)
        .subscribe(rsp => this.flight = rsp)
    })
  }

  public getMapUrl(): string {
    return `https://www.google.com/maps?output=embed&q=${this.flight?.destination}`
  }
}
