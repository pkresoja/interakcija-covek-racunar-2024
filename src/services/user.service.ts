import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private static instance: UserService

  private constructor() {
    if (!localStorage.getItem('users'))
      this.createDefault()
  }

  private createDefault() {
    const user: UserModel = {
      email: 'pkresoja@singidunum.ac.rs',
      password: 'pkresoja',
      flights: []
    }

    localStorage.setItem('users', JSON.stringify([user]))
  }

  public static getInstance() {
    if (this.instance == undefined)
      this.instance = new UserService()
    return this.instance
  }

  public login(email: string, password: string) {
    if (!localStorage.getItem('users'))
      this.createDefault()

    const users: UserModel[] = JSON.parse(localStorage.getItem('users')!)
    const active = users.find(u => u.email == email && u.password == password)

    if (!active) throw Error('BAD_USERNAME_OR_PASSWORD')
    localStorage.setItem('active', active.email)
  }

  public logout() {
    localStorage.removeItem('active')
  }

  public signup(email: string, password: string) {
    if (!localStorage.getItem('users'))
      this.createDefault()

    const users: UserModel[] = JSON.parse(localStorage.getItem('users')!)
    users.push({
      email: email,
      password: password,
      flights: []
    })

    localStorage.setItem('users', JSON.stringify(users))
  }

  public hasActive() {
    return localStorage.getItem('active') != null
  }

  public getActive() {
    return localStorage.getItem('active') ? localStorage.getItem('active') : 'N/A'
  }

}
