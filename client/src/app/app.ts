import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Nav } from '../layouts/nav/nav';
import { AccountService } from '../core/services/account-service';
import { User } from '../types/user';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  //removing all this stuff from here as no longer needed since we have did this setCurrentUser logic in initService and etc and i will remove in next commit
  private http = inject(HttpClient);

  protected router = inject(Router);
  private accountService = inject(AccountService);

  protected readonly title = signal('Dating App');

  protected members = signal<User[]>([]);  //[membersFromApp]="members()" removed from html=>app-home

  public async ngOnInit(): Promise<void> {
    this.members.set(await this.getMembers());
    this.setCurrentUser();  //using this user persists,even if refresh page 
  }

  public setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }

  public async getMembers() {
    try {
      return lastValueFrom(this.http.get<User[]>('https://localhost:5001/api/members'))
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
