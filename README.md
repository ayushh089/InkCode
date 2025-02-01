# InkCode

Welcome to InkCode! This project is designed to help you write and manage your code efficiently.

## Features

- Real-time collaboration
- Integrated chat
- Video calling (Soon)
- Run and execute code
- And many more...

## Installation

To install InkCode, follow these steps:
1. Clone the repository:
    ```sh
    git clone https://github.com/ayushh089/InkCode.git
    ```
2. Navigate to the project directory:
    ```sh
    cd InkCode
    ```
3. Install the dependencies for both client and server:
    ```sh
    npm install
    cd client && npm install
    cd ../server && npm install
    ```
    ```

## Usage

To start using InkCode, you need to run both the client and server. Use the following commands:

1. Start the client:
    ```sh
    npm run dev
    ```

2. Start the server:
    ```sh
    node app.js
    ```
    or, if you have `nodemon` installed:
    ```sh
    nodemon app.js
    ```

## Environment Variables

To run InkCode, you need to set up the following environment variables:

```sh
VITE_RAPID_API_HOST=judge0-ce.p.rapidapi.com
VITE_RAPID_API_KEY=YOUR_RAPID_API_KEY
VITE_RAPID_API_URL=https://judge0-ce.p.rapidapi.com/submissions
```

To get your RapidAPI key, visit [Judge0 API](https://rapidapi.com/judge0-official/api/judge0-ce).

## Contact

For any questions or feedback, please reach out to us at [guptaayush1280@gmail.com](mailto:guptaayush1280@gmail.com)
