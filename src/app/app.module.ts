import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { DOCGENI_SITE_PROVIDERS, IMPORT_MODULES, RootComponent, DocgeniTemplateModule } from './content/index';

@NgModule({
    declarations: [],
    imports: [BrowserModule, DocgeniTemplateModule, ...IMPORT_MODULES, RouterModule.forRoot([]), ],
    providers: [...DOCGENI_SITE_PROVIDERS],
    bootstrap: [RootComponent]
})
export class AppModule {
    constructor() {}
}
