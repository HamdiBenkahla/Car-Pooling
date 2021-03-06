import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RideService } from 'src/app/services/ride.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import {FeedbackService} from 'src/app/services/feedback.service';
import {NgForm} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-passenger-profile',
  templateUrl: './passenger-profile.component.html',
  styleUrls: ['./passenger-profile.component.scss'],
 
  
})

export class PassengerProfileComponent implements OnInit {
  obj={message :"", driverId : 0, rideId : 0, passengerId : 0, sender : 'passenger', rating : 0}
  passenger: any;
  headElements = ['Departure', 'Destination', 'Date', 'Time', 'Status'];
  rides: any[];
  feedBack:any;
  now = Date.now() / 1000 / 3600;
  hasRides: boolean = false;
  file: File = null;
  constructor(private tokenStorage: TokenStorageService,
     private router: Router,
     private feedbackService: FeedbackService,
      private rideService: RideService, private authService: AuthService) { }

  ngOnInit(): void {   
      this.passenger = this.tokenStorage.getUser();
      this.rideService.getPassengerRides(this.passenger.id).subscribe((rides:any[]) => {
        for(var i = 0; i < rides.length; i++) {
          let time = rides[i].time.split(':').reduce((acc,time) => (60 * acc) + +time);
          rides[i].Date = ((Date.parse(rides[i].date) / 1000) + time) / 3600;
          console.log(rides)
        }
        this.rides = rides.filter(ride => ride.RidePassengers.createdAt == ride.RidePassengers.updatedAt);
        this.hasRides = true;
      });

this.feedback() ;
      
  }

  onFileSelected(event) {
    this.file = event.addedFiles[0];
    console.log(this.file);
  }
  onRemove() {
    this.file = null;
  }

  onUpload() {
    const data = new FormData();
    data.append('file', this.file);
    data.append('type', 'passenger')
    console.log(data)
    this.authService.uploadImage(this.passenger.id, data).subscribe(image => {
      this.passenger.imageUrl = image.result.url;
      this.tokenStorage.saveUser(this.passenger);
      console.log(image.result.url)
    })
  }


  onSubmit(form: NgForm, rideId, driverId){
    this.obj.message = form.value['comment']
this.obj.driverId = driverId;
this.obj.rideId = rideId;
this.obj.passengerId = this.passenger.id
this.obj.rating = form.value['rating'];
this.feedbackService.addFeedback(this.obj).subscribe((response)=> {
  if(response) {
    this.rides = this.rides.filter(ride => ride.id !== rideId);
    console.log(response);
    form.resetForm();
  alert("Added feedback");
  }
})
}  

feedback(){
  this.feedbackService.getFeedbackPassenger(this.passenger.id).subscribe((feedback)=> { 
    for(var i =0; i < feedback.length; i++) {
      feedback[i].createdAt = moment(feedback[i].createdAt).format('LLL') 
    }
    this.feedBack = feedback;
  })
}

}
