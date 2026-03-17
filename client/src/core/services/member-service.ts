import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, Photo } from '../../types/member';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  public editMode = signal(false);
 public member =signal<Member | null>(null);

  public getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'members');
  }

  public getMember(id: string) {
    return this.http.get<Member>(this.baseUrl + 'members/' + id).pipe(
      tap(member=>{
        this.member.set(member);
      })
    )
  }

  public getMemberPhotos(id: string) {
    return this.http.get<Photo[]>(this.baseUrl + 'members/' + id + '/photos');
  }

  public updateMember(member: EditableMember) {
    return this.http.put(this.baseUrl + 'members', member);
  }

  public uploadPhoto(file:File){
    const formData=new FormData();
    formData.append('file',file);
    return this.http.post<Photo>(this.baseUrl + 'members/add-photo', formData);
  }

  public setMainPhoto(photo:Photo){
    return this.http.put(this.baseUrl + 'members/set-main-photo/' +photo.id,{} );
  }

   public deletePhoto(photoId:number){
    return this.http.delete(this.baseUrl + 'members/delete-photo/' + photoId );
  }
}
