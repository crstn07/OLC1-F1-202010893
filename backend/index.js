const fs = require('fs');
const { graphviz } = require('node-graphviz');
const analizar = require('./interprete/interprete');

const express = require('express')
const cors = require('cors');

const app = express()

app.use(express.json())
app.use(cors())

const PORT = 4000
var ast = []

app.get('/', (req, res) => {
    res.send("<h1>Hola Mundo</h1>")
})

app.post('/analizar', (req, res) => {
    const contenido = req.body.Contenido
    const result = analizar(contenido);
    console.log(result)
    ast = result.ast;
    listaErrores = new Array(result.listaErrores);
    generarAST(ast);
    return res.send(JSON.stringify({ "Salida": result.salida }))
})

app.get('/AST', (req, res) => {
    return res.send(JSON.stringify({ "Salida": "OK" }))
})

app.get('/Errores', (req, res) => {
    console.log("LISTA ERRORES: " + listaErrores)
    return res.send(JSON.stringify({"respuesta":listaErrores}))
})

function generarAST(ast) {
    let dot = "digraph G{\nlabel=\" AST\";\n";
    dot += " edge[color=\"black\" arrowhead=normal]\n rankdir=\"TB\";\n";
    let nodos = "";
    let conexiones = "";
    let cont = 0;
    nodos += "PADRE [fillcolor=yellow  style=filled label=\" Instrucciones \"];\n";
    ast.forEach(instruccion => {
        nodos += "N" + cont + instruccion.tipo + "[fillcolor=orange  style=filled label=\"" + instruccion.tipo + "\"];\n";
        conexiones += "PADRE -> " + "N" + cont + instruccion.tipo + ";\n";
        //res = obtenerHijos("N" + cont + instruccion.tipo, cont, instruccion.expresion);
        //nodos += res.nodos;
        //conexiones += res.conexiones;
        cont++;
    });

    dot += nodos + conexiones + "\n}";
    fs.writeFileSync('AST.dot', dot);
    // Compile the graph to SVG using the `dot` layout algorithm
    graphviz.dot(dot, 'svg').then((svg) => {
         // Write the SVG to file
         fs.writeFileSync('AST.svg', svg);
     });
}

function obtenerHijos(nodoPadre, cont, expresion) {
    let nodos = ""
    let conexiones = ""
    if (expresion !== undefined) {
        res = obtenerValor(expresion.valor, nodoPadre, cont);
        nodos += res.nodos;
        conexiones += res.conexiones;
        return {nodos, conexiones}
    }

}
function obtenerValor(valor, nodoPadre, cont) {
    let nodos = "";
    let conexiones = "";
    if (valor !== undefined) {
        nodos += "N" + cont + "[fillcolor=green  style=filled label=\"" + valor + "\"];\n";
        conexiones += "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }//return expresion.valor;
    } else {
        res += obtenerValorIzq(valor.valor, nodoPadre, cont);
        res += obtenerValorDer(valor.valor, nodoPadre, cont);
        nodos += res.nodos;
        conexiones += res.conexiones;
        return { nodos, conexiones }
        /*         if (expresion.operandoIzq !== undefined && expresion.operandoIzq.valor !== undefined) {
                    return expresion.operandoIzq.valor;
                } else if (expresion.operandoIzq.valor === undefined) {
                    return obtenerValor(expresion.operandoIzq);
                }
                if (expresion.operandoDer !== undefined && expresion.operandoDer.valor !== undefined) {
                    return expresion.operandoDer.valor;
                } else if (expresion.operandoDer.valor === undefined) {
                    return obtenerValor(expresion.operandoDer);
                } */
    }
}

function obtenerValorDer(expresion, nodoPadre, cont) {
    let nodos = "";
    let conexiones = "";
    if (expresion.operandoDer !== undefined && expresion.operandoDer.valor !== undefined) {
        nodos += "N" + cont + "[fillcolor=green  style=filled label=\"" + expresion.valor + "\"];\n";
        conexiones += "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }
    } else if (expresion.operandoDer.valor === undefined) {
        return obtenerValor(expresion.operandoDer);
    }

}
function obtenerValorIzq(expresion, nodoPadre, cont) {
    let nodos = "";
    let conexiones = "";
    if (expresion.operandoIzq !== undefined && expresion.operandoIzq.valor !== undefined) {
        nodos += "N" + cont + "[fillcolor=green  style=filled label=\"" + expresion.valor + "\"];\n";
        conexiones += "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }
    } else if (expresion.operandoIzq.valor === undefined) {
        return obtenerValor(expresion.operandoIzq);
    }
}
app.listen(PORT, () => console.log('Server running on port: ' + PORT))