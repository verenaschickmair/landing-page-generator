import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './components/editor/editor.component';
import { ResultComponent } from './components/result/result.component';
import { StartComponent } from './components/start/start.component';

import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';

import { SafePipeModule } from 'safe-pipe';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { SanitizeHtmlPipe } from './pipes/sanitize.pipe';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideStorage } from '@angular/fire/storage';
import { getStorage } from 'firebase/storage';
import { FormComponent } from './components/form/form.component';
import { ModalComponent } from './components/modal/modal.component';
import { VersionComponent } from './components/version/version.component';
import { WarningModalComponent } from './components/warning-modal/warning-modal.component';
import { ReversePipe } from './pipes/reverse.pipe';

export const firebaseConfig = {
  apiKey: 'AIzaSyAnDQuLa2iuh-mO_Ek8LltElhOW9OiGJMQ',
  authDomain: 'landingpage-designer.firebaseapp.com',
  projectId: 'landingpage-designer',
  storageBucket: 'landingpage-designer.appspot.com',
  messagingSenderId: '1083076323207',
  appId: '1:1083076323207:web:4e401325d38376132f9522',
  measurementId: 'G-2R2BTWJVYS',
};

@NgModule({
  declarations: [
    AppComponent,
    ResultComponent,
    StartComponent,
    EditorComponent,
    SanitizeHtmlPipe,
    ReversePipe,
    LoginComponent,
    VersionComponent,
    ModalComponent,
    FormComponent,
    WarningModalComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    CodemirrorModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SafePipeModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() =>
      getDatabase(
        getApp(),
        'https://landingpage-designer-default-rtdb.europe-west1.firebasedatabase.app'
      )
    ),
    provideStorage(() => getStorage(getApp())),
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
