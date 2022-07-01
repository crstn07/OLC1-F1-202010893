const fs = require('fs');
const { graphviz } = require('node-graphviz');
const analizar = require('./interprete/interprete');
const { exec } = require("child_process");

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
    //console.log(result)
    ast = result.ast;
    listaErrores = result.listaErrores;
    TS = result.TS
    generarAST(ast);
    return res.send(JSON.stringify({ "Salida": result.salida }))
})

app.get('/AST', (req, res) => {
    exec("AST.svg", () => {

    });
    return res.send(JSON.stringify({ "Salida": "OK" }))
})

app.get('/Errores', (req, res) => {
    console.log("LISTA ERRORES: " + JSON.stringify(listaErrores))
    return res.send({"respuesta":listaErrores})
})

app.get('/TS', (req, res) => {
    console.log(TS)
    return res.send({"respuesta":TS})
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
    //fs.writeFileSync('AST.dot', dot);
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
        let res = obtenerValor(expresion, nodoPadre, cont);
        nodos += res.nodos;
        conexiones += res.conexiones;
        return {nodos, conexiones}
    }

}
function obtenerValor(expresion, nodoPadre, cont) {
    let nodos = "";
    let conexiones = "";
    if (expresion.valor !== undefined) {
        nodos += "N" + cont + "[fillcolor=green  style=filled label=\"" + expresion + "\"];\n";
        conexiones += "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }//return expresion.valor;
    } else {
        let res1 ="";
        let res2 ="";
        res1 += obtenerValorIzq(expresion, nodoPadre, cont);
        res1 += obtenerValorDer(expresion, nodoPadre, cont);
        nodos += res1.nodos + res2.nodos;
        conexiones += res1.conexiones + res2.conexiones;
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
    if (expresion.operandoDer !== undefined) {
        let nodos = "N" + cont + "[fillcolor=green  style=filled label=\"" + expresion.operandoDer.valor + "\"];\n";
        let conexiones = "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }
    } /* else if (expresion.operandoDer.valor === undefined) {
        return obtenerValorDer(expresion.operandoDer);
    } */

}
function obtenerValorIzq(expresion, nodoPadre, cont) {
    if (expresion.operandoIzq !== undefined) {
        let nodos = "N" + cont + "[fillcolor=green  style=filled label=\"" + expresion.operandoIzq.valor + "\"];\n";
        let conexiones = "N" + nodoPadre + " -> " + "N" + cont + ";\n";
        return { nodos, conexiones }
    }/*  else if (expresion.operandoIzq.valor === undefined) {
        return obtenerValorIzq(expresion.operandoIzq);
    } */
}
app.listen(PORT, () => console.log('Server running on port: ' + PORT))