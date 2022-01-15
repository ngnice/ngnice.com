import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'example-if',
    templateUrl: './if.component.html',
    host: {
        class: 'live-example'
    }
})
export class AppIfComponent implements OnInit {
    found = false;

    constructor() {}

    ngOnInit(): void {}

    findCat() {
        this.found = true;
    }
}
