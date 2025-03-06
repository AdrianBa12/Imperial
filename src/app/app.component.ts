import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MasterService } from './Core/Service/master.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'P01';

  isLoginForm: boolean = true;
  masterSrv = inject(MasterService);
  loggedUserData: any;

  loginObj: any = {
    userName: '',
    password: '',
  };

  registerObj: any = {
    userId: 0,
    userName: '',
    emailId: '',
    fullName: '',
    role: '',
    createdDate: new Date(),
    password: '',
    projectName: '',
    refreshToken: '',
    refreshTokenExpiryTime: new Date(),
  };

  constructor() {
    const localUser = localStorage.getItem('redBusUser');
    if (localUser != null) {
      this.loggedUserData = JSON.parse(localUser);
    }
  }

  openModel() {
    const model = document.getElementById('myModal');
    if (model != null) {
      model.style.display = 'block';
    }
  }
  closeModel() {
    const model = document.getElementById('myModal');
    if (model != null) {
      model.style.display = 'none';
    }
  }
  onVendorRegister() {
    this.masterSrv.onRegisterVendor(this.registerObj).subscribe((res: any) => {
      if (res.result) {
        alert('Vendor Created Sucess');
        this.closeModel();
      } else {
        alert(res.message);
      }
    });
  }

  onRegister() {
    this.masterSrv.onRegisterUser(this.registerObj).subscribe(
      (res: any) => {
        alert('User Registed Success');
        localStorage.setItem('redBusUser', JSON.stringify(res.data));
        this.loggedUserData = res.data;
        this.closeModel();
      },
      (error) => {
        alert(JSON.stringify(error));
      }
    );
  }

  onLogin() {
    this.masterSrv.onLogin(this.loginObj).subscribe(
      (res: any) => {
        localStorage.setItem('redBusUser', JSON.stringify(res.data));
        this.loggedUserData = res.data;
        this.closeModel();
      },
      (error) => {
        alert(JSON.stringify(error));
      }
    );
  }

  logoff() {
    localStorage.removeItem('redBusUser');
    this.loggedUserData = undefined;
  }
}
