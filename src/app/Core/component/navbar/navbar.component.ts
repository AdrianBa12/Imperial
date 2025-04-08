import { Component, inject } from '@angular/core';
import { MasterService } from '../../Service/master.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule, NgbModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
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
    // Asegurar que los nombres de campos coincidan
    this.registerObj = {
      userName: this.registerObj.userName,
      emailId: this.registerObj.emailId,
      password: this.registerObj.password,
      fullName: this.registerObj.fullName
    };

    this.masterSrv.onRegisterUser(this.registerObj).subscribe({
      next: (res: any) => {
        // La respuesta de Strapi tiene estructura diferente
        const userData = {
          userId: res.user?.id,
          userName: res.user?.username,
          emailId: res.user?.email,
          fullName: res.user?.fullName || '',
          role: '3',
          jwt: res.jwt
        };

        alert('Usuario registrado con éxito');
        localStorage.setItem('redBusUser', JSON.stringify(userData));
        this.loggedUserData = userData;
        this.closeModel();
      },
      error: (error) => {
        console.error('Error en registro:', error);
        alert(`Error en registro: ${error.error?.error?.message || 'Error desconocido'}`);
      }
    });
  }

  // En app.component.ts
  onLogin() {
    this.masterSrv.onLogin(this.loginObj).subscribe(
      (res: any) => {
        const userData = {
          userId: res.user.id, // Esto debe ser el ID correcto
          userName: res.user.username,
          emailId: res.user.email,
          fullName: res.user.fullName,
          role: '3',
          jwt: res.jwt
        };

        localStorage.setItem('redBusUser', JSON.stringify(userData));
        this.loggedUserData = userData;
        this.closeModel();
      },
      (error) => {
        alert('Error de login: ' + error.message);
      }
    );
  }

  logoff() {
    localStorage.removeItem('redBusUser');
    this.loggedUserData = undefined;
  }
}
