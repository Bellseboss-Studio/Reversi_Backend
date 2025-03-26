const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
require('dotenv').config();

let DATABASE = process.env.DB_NAME;
let USER = process.env.DB_USER;
let PASSWORD = process.env.DB_PASSWORD;
let HOST = process.env.DB_HOST;
let PORT = process.env.DB_PORT;

// Configuración de la base de datos
const sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
    host: HOST,
    port: PORT,
    dialect: 'mysql'
});

const app = express();
app.use(bodyParser.json());
// Modelo de Partida
const Game = sequelize.define('Game', {
    board: {
        type: DataTypes.JSON, // Almacena el estado del tablero
        allowNull: false,
    },
    currentPlayer: {
        type: DataTypes.STRING,
        allowNull: false,
        get() {
            return JSON.parse(this.getDataValue('board'));
        },
        set(value) {
            this.setDataValue('board', JSON.stringify(value));
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ongoing'
    }
}, {
    // Sobrescribir el método toJSON
    defaultScope: {
        attributes: {
            exclude: []
        }
    },
    instanceMethods: {
        toJSON: function () {
            const values = Object.assign({}, this.get());
            values.board = JSON.parse(values.board);
            return values;
        }
    }
});

// Sincronizar la base de datos
sequelize.sync();

// Crear una nueva partida
app.post('/game', async (req, res) => {
    const initialBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    const game = await Game.create({ board: initialBoard, currentPlayer: 'black' });
    res.json(game);
});

// Obtener el estado de una partida
app.get('/game/:id', async (req, res) => {
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Partida no encontrada' });
    res.json(game);
});

// Obtener los movimientos válidos
app.get('/game/:id/valid-moves', async (req, res) => {
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Partida no encontrada' });

    let player = game.currentPlayer === 'black' ? 1 : 2;
    let validMoves = getValidMoves(game.board, player);
    res.json({ validMoves, player: game.currentPlayer });
});

// Obtener el estado de la partida
app.get('/game/:id/status', async (req, res) => {
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Partida no encontrada' });

    let player1CanPlay = canPlay(game.board, 1);
    let player2CanPlay = canPlay(game.board, 2);
    let status = 'ongoing';

    if (!player1CanPlay && !player2CanPlay) {
        status = 'finished';
    }

    res.json({ status, curren_turn: game.currentPlayer });
});

// Realizar un movimiento
app.post('/game/:id/move', async (req, res) => {
    const { x, y } = req.body;
    const game = await Game.findByPk(req.params.id);
    if (!game) return res.status(404).json({ error: 'Partida no encontrada' });

    let player = game.currentPlayer === 'black' ? 1 : 2;
    let validMoves = getValidMoves(game.board, player);

    if (!validMoves.some(move => move.x === x && move.y === y)) {
        return res.status(400).json({ error: 'Movimiento inválido' });
    }

    let newBoard = makeMove(game.board, x, y, player);
    let nextPlayer = player === 1 ? 'white' : 'black';

    await game.update({ board: newBoard, currentPlayer: nextPlayer });
    res.json(game);
});

// Función para obtener los movimientos válidos
function getValidMoves(board, player) {
    let validMoves = [];
    let opponent = player === 1 ? 2 : 1;
    let directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] !== 0) continue;

            for (let [dx, dy] of directions) {
                let nx = x + dx, ny = y + dy;
                let hasOpponentBetween = false;

                while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === opponent) {
                    hasOpponentBetween = true;
                    nx += dx;
                    ny += dy;
                }

                if (hasOpponentBetween && nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === player) {
                    validMoves.push({ x, y });
                    break;
                }
            }
        }
    }
    return validMoves;
}

// Función para realizar un movimiento y voltear fichas
function makeMove(board, x, y, player) {
    let newBoard = board.map(row => [...row]);
    newBoard[x][y] = player;
    let opponent = player === 1 ? 2 : 1;
    let directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        let nx = x + dx, ny = y + dy;
        let piecesToFlip = [];

        while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === opponent) {
            piecesToFlip.push([nx, ny]);
            nx += dx;
            ny += dy;
        }

        if (piecesToFlip.length > 0 && nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && board[nx][ny] === player) {
            for (let [fx, fy] of piecesToFlip) {
                newBoard[fx][fy] = player;
            }
        }
    }
    return newBoard;
}

// Verificar si un jugador puede jugar
function canPlay(board, player) {
    return getValidMoves(board, player).length > 0;
}

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});
