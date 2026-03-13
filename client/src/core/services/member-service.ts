import { HttpClient} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AccountService } from './account-service';
import { Member, Photo } from '../../types/member';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private accountService = inject(AccountService);

  public getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'members');
  }

  public getMember(id: string) {
    return this.http.get<Member>(this.baseUrl + 'members/' + id);
  }

  public getMemberPhotos(id:string){
    return this.http.get<Photo[]>(this.baseUrl + 'members/'+ id +'/photos');
  }
}
