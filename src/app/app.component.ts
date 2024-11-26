import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { WebService } from './web.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { MessageModel } from '../models/message.model';
import { RasaModel } from '../models/rasa.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, HttpClientModule, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  webService = WebService.getInstance();
  title = 'interakcija-covek-racunar-2024';
  year = new Date().getFullYear();

  isChatVisible = false;
  userMessage: string = '';
  messages: MessageModel[] = [];

  // ViewChild to access the chat-body element directly
  @ViewChild('chatBody', { static: false }) chatBody: ElementRef | undefined;

  constructor() { }

  ngOnInit(): void {
    // Check if there are any messages saved
    if (!localStorage.getItem('messages')) {
      localStorage.setItem('messages', JSON.stringify([
        { type: 'bot', text: 'How can I help you?' }
      ]));
    }

    this.messages = JSON.parse(localStorage.getItem('messages')!);
  }

  ngAfterViewChecked(): void {
    // Scroll to bottom after view has been updated
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  pushMessage(message: MessageModel) {
    this.messages.push(message);
    // Save messages in local storage
    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      const trimmedInput = this.userMessage;
      // Reset user input
      this.userMessage = '';

      this.pushMessage({ type: 'user', text: trimmedInput });
      this.webService.sendRasaMessage(trimmedInput)
        .subscribe((rsp: RasaModel[]) => {
          if (rsp.length == 0) {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry I did not understand your question.'
            });
            return;
          }

          rsp.map(msg => {
            // Handle bot message (including images, flight cards, etc.)
            if (msg.image) {
              return `<img src="${msg.image}" width="200">`;
            }
            if (msg.attachment) {
              let html = '';
              for (const item of msg.attachment) {
                html += `
                  <div class="card card-chat">
                    <img src="${[this.webService.getDestinationImage(item.destination)]}" class="card-img-top" alt="${item.destination}">
                    <div class="card-body">
                      <h3 class="card-title">${item.destination}</h3>
                      <p class="card-text">${this.webService.formatDate(item.scheduledAt)} (${item.flightNumber})</p>
                    </div>
                    <div class="card-body">
                      <a class="btn btn-primary" href="/flight/${item.id}">
                        <i class="fa-solid fa-up-right-from-square"></i> Details
                      </a>
                      <a class="btn btn-success ms-1" href="/list">
                        <i class="fa-solid fa-magnifying-glass"></i> Browse All
                      </a>
                    </div>
                  </div>
                `;
              }
              return html;
            }
            return msg.text;
          })
            .forEach(msg => {
              this.pushMessage({
                type: 'bot',
                text: msg!
              });
            });
        },
          (err: HttpErrorResponse) => {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry, I am not available at the moment.'
            });
          });
    }
  }
}
