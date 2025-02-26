# OthelloServer

![Backend Deployment](https://github.com/luisplata/Reversi_Backend/actions/workflows/main.yml/badge.svg)

OthelloServer is a backend API for playing Othello (Reversi) online. It is built using **Node.js**, **Express**, and **MySQL** (via Sequelize ORM).

## Features
- Create and manage Othello (Reversi) game sessions.
- Validate and process legal moves.
- Store game states in a MySQL database.
- REST API for interacting with the game.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (>=16.0.0)
- [MySQL](https://www.mysql.com/)

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/luisplata/Reversi_Backend.git
   cd Reversi_Backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up the environment variables:  
   Create a `.env` file in the root directory and configure it with your database settings:
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   DB_PORT=3306
   ```

4. Run database migrations (if needed):
   ```sh
   node index.js
   ```

## Running the Server
- **Production Mode**:
  ```sh
  npm start
  ```
- **Development Mode** (with auto-restart using nodemon):
  ```sh
  npm run dev
  ```

## Linting and Formatting
To check for linting issues:
```sh
npm run lint
```
To auto-format the code:
```sh
npm run format
```

## API Endpoints

### Create a new game
```http
POST /game
```
Creates a new Othello game with the initial board state.

#### Response Example:
```json
{
  "id": 1,
  "board": [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  "currentPlayer": "black",
  "status": "ongoing"
}
```

### Get game state
```http
GET /game/:id
```
Fetches the current game state.

#### Response Example:
```json
{
  "id": 1,
  "board": [[...]],
  "currentPlayer": "black",
  "status": "ongoing"
}
```

### Get valid moves
```http
GET /game/:id/valid-moves
```
Returns a list of valid moves for the current player.

#### Response Example:
```json
{
  "validMoves": [
    { "x": 2, "y": 3 },
    { "x": 3, "y": 2 },
    { "x": 4, "y": 5 },
    { "x": 5, "y": 4 }
  ],
  "player": "black"
}
```

### Make a move
```http
POST /game/:id/move
```
Executes a move for the current player.

#### Request Body Example:
```json
{
  "x": 3,
  "y": 5
}
```

#### Response Example:
```json
{
  "id": 1,
  "board": [[...]],
  "currentPlayer": "white",
  "status": "ongoing"
}
```

### Get game status
```http
GET /game/:id/status
```
Returns whether the game is ongoing or finished.

#### Response Example:
```json
{
  "status": "ongoing",
  "current_turn": "black"
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first.

## License
This project is licensed under the **GNU General Public License**. See [LICENSE](LICENSE) for more details.

## Author
Developed by **Luis Plata (PeryLoth)**  
GitHub: [@luisplata](https://github.com/luisplata)

