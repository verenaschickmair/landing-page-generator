import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private data = '';
  public data$ = new BehaviorSubject('');

  public mainLoader$ = new BehaviorSubject(false);
  public loading$ = new BehaviorSubject(false);

  private url = 'http://localhost:3000';
  private useMockdata = false;
  public controller = new AbortController();

  constructor(private router: Router) {}

  public async sendInitialPrompt(prompt: any): Promise<any> {
    if (!this.useMockdata) {
      // Set loading state
      this.loading$.next(true);
      this.mainLoader$.next(true);

      // Reset data
      this.data = '';
      this.data$.next(this.data);

      // Set URL
      this.url = window.location.origin.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://us-central1-landingpage-designer.cloudfunctions.net/listenToRequests';

      const body = { prompt };
      const fileName = prompt.name.toLowerCase().replace(/\s/g, '-');

      this.router.navigate(['/results', fileName + '.html'], {
        queryParams: { initial: true },
      });

      this.controller = new AbortController();
      const signal = this.controller.signal;

      const response = await fetch(`${this.url}/api/prompt/initial`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok || !response.body) {
        console.error('Error: ', response.statusText);
        return '';
      }

      this.mainLoader$.next(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const loopRunner = true;

      while (loopRunner) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const decodedChunk = decoder.decode(value, { stream: true });
        this.data = this.data + decodedChunk; // update state with new chunk

        // Remove markdown
        if (this.data.includes('</html>\n```')) {
          this.data = this.data.replace('</html>\n```', '</html>');
        }

        if (this.data.includes('</html>```')) {
          this.data = this.data.replace('</html>```', '</html>');
        }

        if (this.data.includes('```')) {
          this.data = this.data.replace('```', '');
        }

        this.data$.next(this.data);
      }
      this.loading$.next(false);
      return { data: this.data, fileName };
    } else {
      this.loading$.next(true);

      this.data = `<!DOCTYPE html>
        <html lang="en">
        <header>Header</header>
        <div><p>Test</p></div>
        <section><p>Test</p></section>
        <footer>Footer</footer>
        </html>`;

      this.data$.next(this.data);
      this.router.navigate(['/results', 'test']);

      setTimeout(() => {
        this.loading$.next(false);
        return { data: this.data, fileName: 'test.html' };
      }, 10000);
    }
  }

  public sendRefinementPrompt(
    refinementPrompt: string,
    code: string,
    considerWholeDoc: boolean
  ): Promise<Response> {
    if (!this.useMockdata) {
      const body = { refinementPrompt, code, considerWholeDoc };
      this.controller = new AbortController();
      const signal = this.controller.signal;

      this.url = window.location.origin.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://us-central1-landingpage-designer.cloudfunctions.net/listenToRequests';

      return fetch(`${this.url}/api/prompt/refinement`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      });
    } else {
      return Promise.resolve(new Response());
    }
  }

  public async deployVersion(
    code: string,
    userId: string,
    fileName: string
  ): Promise<Response> {
    if (!this.useMockdata) {
      const body = { code, userId, fileName };

      this.url = window.location.origin.includes('localhost')
        ? 'http://localhost:3000'
        : 'https://us-central1-landingpage-designer.cloudfunctions.net/listenToRequests';

      return fetch(`${this.url}/api/deploy`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } else {
      return Promise.resolve(new Response());
    }
  }
}
