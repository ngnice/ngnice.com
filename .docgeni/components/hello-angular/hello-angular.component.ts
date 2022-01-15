import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'example-hello',
    templateUrl: './hello-angular.component.html',
    host: {
        class: 'live-example'
    }
})
export class AppHelloComponent implements OnInit {
    message = "Hello Angular!";

    constructor() {}

    ngOnInit(): void {}
}
