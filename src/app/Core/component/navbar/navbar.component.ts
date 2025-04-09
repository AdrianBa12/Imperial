import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MasterService } from '../../Service/master.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule, NgbModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isLoginForm: boolean = true;
  masterSrv = inject(MasterService);
  loggedUserData: any;

  loginObj: any = {
    userName: '',
    password: ''
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
    refreshTokenExpiryTime: new Date()
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
      model.classList.add('show');
    }
  }

  closeModel() {
    const model = document.getElementById('myModal');
    if (model != null) {
      model.style.display = 'none';
      model.classList.remove('show');
    }
  }

  onRegister() {
    if (!this.registerObj.emailId || !this.registerObj.userName || 
        !this.registerObj.fullName || !this.registerObj.password) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.masterSrv.onRegisterUser(this.registerObj).subscribe({
      next: (res: any) => {
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

  onLogin() {
    if (!this.loginObj.userName || !this.loginObj.password) {
      alert('Por favor ingresa tu usuario y contraseña');
      return;
    }

    this.masterSrv.onLogin(this.loginObj).subscribe({
      next: (res: any) => {
        const userData = {
          userId: res.user.id,
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
      error: (error) => {
        alert('Error de login: ' + (error.error?.message || 'Credenciales incorrectas'));
      }
    });
  }

  logoff() {
    localStorage.removeItem('redBusUser');
    this.loggedUserData = undefined;
  }
}