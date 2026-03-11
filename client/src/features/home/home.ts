import { Component, Input, signal } from '@angular/core';
import { Register } from '../account/register/register';
import { User } from '../../types/user';

@Component({
  selector: 'app-home',
  imports: [Register],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  //removed from html [membersFromHome]="membersFromApp" from app-register 
  //@Input({required: true }) membersFromApp:User[]=[]; //one way from parent to child

  protected registerMode = signal(false);

  public showRegister(value: boolean) {
    this.registerMode.set(value);
  }
}
