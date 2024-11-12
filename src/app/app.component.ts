import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WebService } from './web.service';
import { HttpClientModule } from '@angular/common/http';
import { MessageModel } from '../models/message.model';

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

  sendMessage() {
    if (this.userMessage.trim()) {
      this.messages.push({ type: 'user', text: this.userMessage })
      const obs = this.webService.sendRasaMessage(this.userMessage)

      // Reset user input
      this.userMessage = ''

      obs.subscribe(rsp => {
        if (rsp.length == 0) {
          this.messages.push({
            type: 'bot',
            text: 'Sorry I did not understand your question.'
          })
          return
        }

        rsp.map(msg => msg.image ? `<img src="${msg.image}">` : msg.text).forEach(msg => {
          this.messages.push({
            type: 'bot',
            text: msg!
          })
        })

        // Save messages in local storage
        localStorage.setItem('messages', JSON.stringify(this.messages))
      })
    }
  }
}
