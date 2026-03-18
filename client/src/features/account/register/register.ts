import { Component, Inject, inject, input, OnInit, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterCreds, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { email } from '@angular/forms/signals';
import { JsonPipe } from '@angular/common';
import { TextInput } from "../../../shared/text-input/text-input";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, JsonPipe, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  //not needed so commented but it shows the new way of communicating
  // public membersFromHome = input.required<User[]>(); //another way of passing dat from parentto child using input signals(and we used @input decoraters from app to home and then here home-to regisrer component)

  private accountService = inject(AccountService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  public cancelRegister = output<boolean>();

  protected creds = {} as RegisterCreds;
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected currentStep = signal(1);
  protected validationErrors=signal<string[]>([]);
  
  public constructor() {
    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', Validators.required],
      password: ['', [Validators.required,
      Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
   
    this.profileForm=this.fb.group({
      gender:['male', Validators.required],
      dateOfBirth:['', Validators.required],
      city:['', Validators.required],
      country:['', Validators.required],
    })

    //to make the password match if added extra char after password valid that should run the validtaion below to match again
    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    })
  }

  public matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;
      const matchValue = parent.get(matchTo)?.value;
      return control.value === matchValue ? null : { passwordMismatch: true }
    }
  }

  public nextStep() {
    if (this.credentialsForm.valid) {
      this.currentStep.update(prevStep => prevStep + 1);
    }
  }

  public prevStep() {
    this.currentStep.update(prevStep => prevStep - 1);
  }

  public getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  public register() {
    if (this.credentialsForm.valid && this.profileForm.valid) {
      const formData = { ...this.credentialsForm.value, ...this.profileForm.value };
      
      this.accountService.register(formData).subscribe({
        next: () => {
        this.router.navigateByUrl('/members');
        },
        error: error =>{
          console.log(error);
          this.validationErrors.set(error);
        }
      })
    }
  }

  public cancel() {
    this.cancelRegister.emit(false);
  }
}
