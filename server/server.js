/* eslint-disable import/no-duplicates */
import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import Html from '../client/html'

let connections = []

const port = process.env.PORT || 3000
const server = express()

server.use(cors())

server.use(express.static(path.resolve(__dirname, '../dist/assets')))
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
server.use(bodyParser.json({ limit: '50mb', extended: true }))

server.use(cookieParser())

server.use((req, res, next) => {
  res.set('x-skillcrucial-user', 'd8a9d949-d1f3-4999-9c60-fb9eeb53af33')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
})

const USER_FILE_PATH = `${__dirname}/user.json`

const { readFile, writeFile, unlink } = require('fs').promises

/*
  1. Получает всех юзеров из файла users.json, если его нет то п2
  2. Получает данные с сервиса https://jsonplaceholder.typicode.com/users
  3. Заполняет файл users.json y и возвращает данные
*/
server.get('/api/v1/users', async (req, res) => {
  try {
    const fileData = await readFile(USER_FILE_PATH)
    res.json(JSON.parse(fileData))
  } catch (error) {
    const { data: users } = await axios('http://jsonplaceholder.typicode.com/users')
    await writeFile(USER_FILE_PATH, JSON.stringify(users), {
      encoding: 'utf8'
    })
    res.json(users)
  }
})

/**
 * 1. добавляет юзера в файл users.json, с id равным id последнего элемента + 1
 * 2. возвращает {status: 'success', id: id}
 */
server.post('/api/v1/users', async (req, res) => {
  const user = req.body
  try {
    const fileData = await readFile(USER_FILE_PATH)
    const users = JSON.parse(fileData)

    const userId = users[users.length - 1].id + 1
    users.push({ ...user, id: userId })

    await unlink(USER_FILE_PATH)
    await writeFile(USER_FILE_PATH, JSON.stringify(users), {
      encoding: 'utf8'
    })

    res.json({ status: 'success', id: userId })
  } catch (error) {
    res.json({ status: 'error', error })
  }
})

/**
 * 1. дополняет юзера в users.json с id равным userId
 * 2. возвращает { status: 'success', id: userId }
 */
server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const userNew = req.body
  try {
    const fileData = await readFile(USER_FILE_PATH)
    const users = JSON.parse(fileData)

    const usersNew = users.map((rec) => {
      if (rec.id === Number(userId)) {
        return { ...rec, ...userNew }
      }
      return rec
    })

    await unlink(USER_FILE_PATH)
    await writeFile(USER_FILE_PATH, JSON.stringify(usersNew), {
      encoding: 'utf8'
    })

    res.json({ status: 'success', id: userId })
  } catch (error) {
    res.json({ status: 'error', error })
  }
})

/**
 * удаляет юзера в users.json с id равным userId
 * и возвращает { status: 'success', id: userId }
 */
server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const fileData = await readFile(USER_FILE_PATH)
    const users = JSON.parse(fileData)

    const usersNew = users.filter((rec) => {
      if (rec.id === Number(userId)) {
        return false
      }
      return true
    })

    await unlink(USER_FILE_PATH)
    await writeFile(USER_FILE_PATH, JSON.stringify(usersNew), {
      encoding: 'utf8'
    })

    res.json({ status: 'success', id: userId })
  } catch (error) {
    res.json({ status: 'error', error })
  }
})

/**
 * 1. удаляет файл users.json
 * 2. возвращает { status: 'success', id: userId }
 */
server.delete('/api/v1/users', async (req, res) => {
  await unlink(USER_FILE_PATH)
  res.json({ status: 'success' })
})

server.get('/api/v1/users/take/:number', async (req, res) => {
  const { number } = req.params
  const { data: users } = await axios('http://jsonplaceholder.typicode.com/users')
  res.json(users.slice(0, +number))
})

server.get('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const fileData = await readFile(USER_FILE_PATH)
    const users = JSON.parse(fileData)

    const user = users.find((rec) => {
      if (rec.id === Number(userId)) {
        return true
      }
      return false
    })

    res.json(user)
  } catch (error) {
    res.json({ status: 'error', error })
  }
})

const echo = sockjs.createServer()
echo.on('connection', (conn) => {
  connections.push(conn)
  conn.on('data', async () => {})

  conn.on('close', () => {
    connections = connections.filter((c) => c.readyState !== 3)
  })
})

server.get('/', (req, res) => {
  // const body = renderToString(<Root />);
  const title = 'Server side Rendering'
  res.send(
    Html({
      body: '',
      title
    })
  )
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

echo.installHandlers(app, { prefix: '/ws' })

// eslint-disable-next-line no-console
console.log(`Serving at http://localhost:${port}`)

// const USER_FILE_NAME = 'user.json'
// const NO_FILE = 'no file'
// const { readFile, writeFile, stat, unlink } = require('fs').promises

// async function readUserFile() {
//   try {
//     const fileData = await readFile(`${__dirname}/${USER_FILE_NAME}`)
//     return fileData
//   } catch (error) {
//     return NO_FILE
//   }
// }
