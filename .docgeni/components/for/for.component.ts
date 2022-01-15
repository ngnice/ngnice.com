import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'example-for',
    templateUrl: './for.component.html',
    host: {
        class: 'live-example'
    }
})
export class AppForComponent implements OnInit {
    items = [
        {
            id: 1,
            title: 'Angular 怎么不火呢?'
        },
        {
            id: 2,
            title: 'Angular 太牛逼了!'
        },
        {
            id: 3,
            title: '优秀的前端工程师和框架无关，但是 Angular 会让你更快的成为优秀前端工程师!'
        }
    ];
    constructor() {}

    ngOnInit(): void {}
}
