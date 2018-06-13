import { Component, OnInit } from '@angular/core';

import { SocketService } from '../../services/sockets';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private socketIo: SocketService) { }

  ngOnInit() {
      const token = localStorage.getItem('risk-token');

      // Initialize the socket connection
      this.socketIo.connect(token);
  }

}
