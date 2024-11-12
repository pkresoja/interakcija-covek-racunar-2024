import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WebService } from './web.service';
import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MessageModel } from '../models/message.model';
import { catchError } from 'rxjs';
import { RasaModel } from '../models/rasa.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, NgFor, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  webService = WebService.getInstance()
  title = 'interakcija-covek-racunar-2024'
  year = new Date().getFullYear()

  isChatVisible = false
  userMessage: string = ''
  messages: MessageModel[] = []

  ngOnInit(): void {
    // Check if there are any messages saved
    if (!localStorage.getItem('messages')) {
      localStorage.setItem('messages', JSON.stringify([
        { type: 'bot', text: 'How can I help you?' }
      ]))
    }

    this.messages = JSON.parse(localStorage.getItem('messages')!)
    console.log(this.messages)
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible
  }

  pushMessage(message: MessageModel) {
    this.messages.push(message)
    // Save messages in local storage
    localStorage.setItem('messages', JSON.stringify(this.messages))
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      const trimmedInput = this.userMessage
      // Reset user input
      this.userMessage = ''

      this.pushMessage({ type: 'user', text: trimmedInput })
      // this.pushMessage({ type: 'bot', text: 'Thinking...' })
      this.webService.sendRasaMessage(trimmedInput)
        // .pipe(catchError(this.handleError))
        .subscribe((rsp: RasaModel[]) => {
          if (rsp.length == 0) {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry I did not understand your question.'
            })
            return
          }

          rsp.map(msg => msg.image ? `<img src="${msg.image}" width="200">` : msg.text).forEach(msg => {
            this.pushMessage({
              type: 'bot',
              text: msg!
            })
          })
        },
          (err: HttpErrorResponse) => {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry, I am not available at the moment.'
            })
          })
    }
  }
}
