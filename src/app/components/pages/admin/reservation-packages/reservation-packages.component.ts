import { Component, OnInit } from '@angular/core';
import { ReservationPackage } from '../../../../models/reservationPackage';
import { ReservationPackageService } from '../../../../services/reservation-package.service';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { MyModalService } from '../../../../services/my-modal/my-modal.service';
import { NotificationsService } from 'angular2-notifications';
import { isNull } from 'util';
import { Membership } from '../../../../models/membership';
import { MembershipService } from '../../../../services/membership.service';

@Component({
  selector: 'app-reservation-packages',
  templateUrl: './reservation-packages.component.html',
  styleUrls: ['./reservation-packages.component.scss']
})
export class ReservationPackagesComponent implements OnInit {

  listReservationPackages: ReservationPackage[];
  listMemberships: Membership[] = [];
  listAdaptedReservationPackages: any[];

  reservationPackageForm: FormGroup;
  reservationPackageErrors: string[];
  selectedReservationPackageUrl: string;

  settings = {
    title: 'Forfaits',
    noDataText: 'Aucun forfait pour le moment',
    addButton: true,
    editButton: true,
    previous: false,
    next: false,
    numberOfPage: 0,
    page: 0,
    columns: [
      {
        name: 'name',
        title: 'Nom'
      },
      {
        name: 'price',
        title: 'Prix'
      },
      {
        name: 'reservations',
        title: 'Nombre de réservations'
      },
      {
        name: 'available',
        title: 'Disponible',
        type: 'boolean'
      }
    ]
  };

  constructor(private reservationPackageService: ReservationPackageService,
              private myModalService: MyModalService,
              private notificationService: NotificationsService,
              private formBuilder: FormBuilder,
              private membershipService: MembershipService) { }

  ngOnInit() {
    this.refreshReservationPackageList();
    this.refreshMembershipList();
  }

  initForm(membershipsSelected) {
    this.reservationPackageForm = this.formBuilder.group(
      {
        name: null,
        price: null,
        reservations: null,
        exclusive_memberships: this.formBuilder.array([]),
        available: null,
      }
    );

    const formArray = this.reservationPackageForm.get('exclusive_memberships') as FormArray;
    for (const level of this.listMemberships) {
      let value = false;
      if (membershipsSelected.indexOf(level.url) > -1) {
        value = true;
      }
      formArray.push(new FormControl(value));
    }
  }

  changePage(index: number) {
    this.refreshReservationPackageList(index);
  }

  refreshReservationPackageList(page = 1, limit = 20) {
    this.reservationPackageService.list(null, limit, limit * (page - 1)).subscribe(
      reservationPackages => {
        this.settings.numberOfPage = Math.ceil(reservationPackages.count / limit);
        this.settings.page = page;
        this.settings.previous = !isNull(reservationPackages.previous);
        this.settings.next = !isNull(reservationPackages.next);
        this.listReservationPackages = reservationPackages.results.map(o => new ReservationPackage(o));
        this.listAdaptedReservationPackages = [];
        for (const reservationPackage of this.listReservationPackages) {
          this.listAdaptedReservationPackages.push(this.reservationPackageAdapter(reservationPackage));
        }
      }
    );
  }

  refreshMembershipList() {
    this.membershipService.list().subscribe(
      memberships => {
        this.listMemberships = memberships.results.map(m => new Membership(m));
        this.initForm([]);
      }
    );
  }

  OpenModalCreateReservationPackage() {
    this.initForm([]);
    this.reservationPackageForm.reset();
    this.reservationPackageForm.controls['available'].setValue(false);
    this.selectedReservationPackageUrl = null;
    this.toogleModal('form_reservation_packages', 'Ajouter un forfait', 'Créer');
  }

  OpenModalEditReservationPackage(item) {
    for (const reservationPackage of this.listReservationPackages) {
      if (reservationPackage.id === item.id) {
        this.initForm(reservationPackage.exclusive_memberships);
        this.reservationPackageForm.controls['name'].setValue(reservationPackage.name);
        this.reservationPackageForm.controls['price'].setValue(reservationPackage.price);
        this.reservationPackageForm.controls['reservations'].setValue(reservationPackage.reservations);
        this.reservationPackageForm.controls['available'].setValue(reservationPackage.available);
        this.selectedReservationPackageUrl = item.url;
        this.toogleModal('form_reservation_packages', 'Éditer un forfait', 'Éditer');
      }
    }
  }

  submitReservationPackage() {
    if ( this.reservationPackageForm.valid ) {
      const reservationPackage = this.reservationPackageForm.value;
      const formArray = this.reservationPackageForm.get('exclusive_memberships') as FormArray;
      reservationPackage['exclusive_memberships'] = [];
      let index = 0;
      for (const control of formArray.controls) {
        if (control.value) {
          reservationPackage['exclusive_memberships'].push(this.listMemberships[index].url);
        }
        index++;
      }

      if (this.selectedReservationPackageUrl) {
        this.reservationPackageService.update(this.selectedReservationPackageUrl, reservationPackage).subscribe(
          data => {
            this.notificationService.success('Modifié');
            this.refreshReservationPackageList();
            this.toogleModal('form_reservation_packages');
          },
          err => {
            if (err.error.non_field_errors) {
              this.reservationPackageErrors = err.error.non_field_errors;
            }
            if (err.error.name) {
              this.reservationPackageForm.controls['name'].setErrors({
                apiError: err.error.name
              });
            }
            if (err.error.price) {
              this.reservationPackageForm.controls['price'].setErrors({
                apiError: err.error.price
              });
            }
            if (err.error.reservations) {
              this.reservationPackageForm.controls['reservations'].setErrors({
                apiError: err.error.reservations
              });
            }
            if (err.error.available) {
              this.reservationPackageForm.controls['available'].setErrors({
                apiError: err.error.available
              });
            }
          }
        );
      } else {
        this.reservationPackageService.create(reservationPackage).subscribe(
          data => {
            this.notificationService.success('Ajouté');
            this.refreshReservationPackageList();
            this.toogleModal('form_reservation_packages');
          },
          err => {
            if (err.error.non_field_errors) {
              this.reservationPackageErrors = err.error.non_field_errors;
            }
            if (err.error.name) {
              this.reservationPackageForm.controls['name'].setErrors({
                apiError: err.error.name
              });
            }
            if (err.error.price) {
              this.reservationPackageForm.controls['price'].setErrors({
                apiError: err.error.price
              });
            }
            if (err.error.reservations) {
              this.reservationPackageForm.controls['reservations'].setErrors({
                apiError: err.error.reservations
              });
            }
            if (err.error.available) {
              this.reservationPackageForm.controls['available'].setErrors({
                apiError: err.error.available
              });
            }
          }
        );
      }
    }
  }

  toogleModal(name, title = '', button2 = '') {
    const modal = this.myModalService.get(name);

    if (!modal) {
      console.error('No modal named %s', name);
      return;
    }

    modal.title = title;
    modal.button2Label = button2;
    modal.toggle();
  }

  reservationPackageAdapter(reservationPackage) {
    return {
      id: reservationPackage.id,
      url: reservationPackage.url,
      name: reservationPackage.name,
      price: reservationPackage.price,
      reservations: reservationPackage.reservations,
      available: reservationPackage.available,
    };
  }
}
