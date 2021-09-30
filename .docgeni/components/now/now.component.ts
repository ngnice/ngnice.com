import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-now',
    template: '{{now}}'
})
export class NowComponent implements OnInit {
    now: string;
    constructor() {
        const now = new Date();
        this.now = `${now.getFullYear()}年`;
    }

    ngOnInit(): void {}
}

export default {
    selector: 'now',
    component: NowComponent
};
