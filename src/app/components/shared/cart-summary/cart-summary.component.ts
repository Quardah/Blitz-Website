import {Component, Input, OnInit} from '@angular/core';
import {MyCartService} from '../../../services/my-cart/my-cart.service';
import {Cart} from '../../../models/cart';
import {Coupon} from '../../../models/coupon';
import {AppliedCoupon} from '../../../models/appliedCoupon';
import {AuthenticationService} from '../../../services/authentication.service';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss']
})
export class CartSummaryComponent implements OnInit {

  @Input() cart: Cart;
  @Input() displayPrice = true;
  @Input() displayTitle = true;
  @Input() displayCoupon = true;

  constructor(private cartService: MyCartService,
              private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  removeMembershipFromCart(membership) {
    this.cartService.removeMembership(membership.id);
  }

  removeRetreatFromCart(retreat) {
    this.cartService.removeRetreat(retreat.id);
  }

  removeReservationPackageFromCart(reservationPackage) {
    this.cartService.removeReservationPackage(reservationPackage.id);
  }

  removeTimeslotFromCart(timeslot) {
    this.cartService.removeTimeslot(timeslot.id);
  }

  removeCouponFromCart(coupon) {
    this.cartService.removeCoupon();
  }

  getAppliedCoupon(coupon: Coupon) {
    for (const appliedCoupon of this.cart.getAppliedCoupons()) {
      if ( appliedCoupon.coupon.code === coupon.code ) {
        return appliedCoupon;
      }
    }
  }

  isCouponDisabled(coupon) {
    const appliedCoupon = this.getAppliedCoupon(coupon);
    if (appliedCoupon) {
      return appliedCoupon.reason;
    } else {
      return false;
    }
  }

  getActualTotalTicket() {
    const user = this.authenticationService.getProfile();
    if (user) {
      return user.tickets;
    } else {
      return null;
    }
  }

  getNewTotalTicket() {
    const total = this.getActualTotalTicket();
    if (total) {
      return total + this.cartService.getDifferenceOfTicket();
    } else {
      return null;
    }
  }
}
