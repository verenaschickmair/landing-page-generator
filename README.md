# Master Thesis Project - Landing Page Generator powered by GPT-3.5 and GPT-4

## Client

### Angular

1. Navigate to the `client` folder:
    ```bash
    cd client
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the application:
    ```bash
    ng serve
    ```
4. The application will be available at [http://localhost:4200/](http://localhost:4200/).

## Server

### Node.js (Express)

1. Navigate to the `server` folder:
    ```bash
    cd server
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    node index.js
    ```
4. The server will be running on port 3000.

## Environment Variables

For security reasons, you must set your own `OPENAI_API_KEY` and `VERCEL_API_KEY`. Follow these steps to create a `.env` file:

1. Navigate to the `server` folder:
    ```bash
    cd server
    ```
2. Create a `.env` file:
    ```bash
    touch .env
    ```
3. Add the following content to the `.env` file (replace placeholders with actual keys):
    ```env
    OPENAI_API_KEY="YOUR-API-KEY"
    VERCEL_API_KEY="YOUR-VERCEL-API-KEY"
    VERCEL_TEAM_ID="YOUR-VERCEL-TEAM-ID"
    ```

4. Make sure to add the `.env` file to your `.gitignore` to keep it secure:
    ```bash
    echo ".env" >> .gitignore
    ```

### How to Get API Keys

#### OpenAI API Key

1. Go to the [OpenAI website](https://www.openai.com/).
2. Sign in or create an account if you don't have one.
3. Navigate to the API section of your account.
4. Generate a new API key.
5. Copy the key and use it as the value for `OPENAI_API_KEY` in your `.env` file.

#### Vercel API Key and Team ID

1. Go to the [Vercel website](https://vercel.com/).
2. Sign in or create an account if you don't have one.
3. Navigate to your account settings and find the API Tokens section.
4. Generate a new API token.
5. Copy the API token and use it as the value for `VERCEL_API_KEY` in your `.env` file.
6. To find your Team ID, navigate to your team settings in Vercel.
7. Copy the Team ID and use it as the value for `VERCEL_TEAM_ID` in your `.env` file.

