const analizar = require('./interprete/interprete');

const express = require('express')
const cors = require('cors');

const app = express()

app.use(express.json())
app.use(cors())

const PORT = 4000

app.get('/', (req, res) => {
    res.send("<h1>Hola Mundo</h1>")
})

app.post('/analizar', (req, res) => {
    const contenido = req.body.Contenido
    const result = analizar(contenido);
    console.log(result)
    return res.send(JSON.stringify({ "Salida": result }))
})


app.listen(PORT, () => console.log('Server running on port: ' + PORT))