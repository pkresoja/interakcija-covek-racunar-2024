import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { WebService } from '../../services/web.service';
import { UserOrderModel } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  public userService = UserService.getInstance()
  public webService = WebService.getInstance()

  public orders: UserOrderModel[] = []

  constructor(private router: Router, private route: ActivatedRoute) {
    if (!this.userService.hasActive()) {
      this.router.navigate(['/login'], { relativeTo: this.route })
      return
    }
    this.loadOrders()
  }

  private loadOrders() {
    try {
      this.orders = this.userService.getUserOrders()!
      if (this.orders.length == 0) return

      // Retrieve flights by id from orders
      this.webService.getFlightsByIds(this.orders.map(o => o.id))
        .subscribe(rsp => {
          this.orders.forEach(o => {
            o.flight = rsp.find(ro => ro.id === o.id)
          })
        })
    } catch (e) {
      this.userService.logout()
      this.router.navigate(['/login'], { relativeTo: this.route })
    }
  }

  public doResetPassword() {
    const input = prompt('Enter your new password')
    if (input == null) {
      alert('Password cannot be empty')
      return
    }

    this.userService.changePassword(input as string)
  }

  public details(id: number) {
    this.router.navigate([`/flight/${id}`], { relativeTo: this.route });
  }

  public pay(order: UserOrderModel) {
    this.userService.changeOrderStatus('paid', order)
    this.loadOrders()
  }

  public rate(order: UserOrderModel) {
    // TODO: Implemenitrati rating
  }

  public cancel(order: UserOrderModel) {
    this.userService.changeOrderStatus('canceled', order)
    this.loadOrders()
  }
}
