var fs = require('fs');
var parser = require('../gramatica/gramatica');

const TIPO_INSTRUCCION = require('./instrucciones').TIPO_INSTRUCCION;
const TIPO_OPERACION = require('./instrucciones').TIPO_OPERACION;
const TIPO_VALOR = require('./instrucciones').TIPO_VALOR;
const TIPO_OPCION_SWITCH = require('./instrucciones').TIPO_OPCION_SWITCH;

// Tabla de Simbolos
const TIPO_DATO = require('./tablaSimbolos').TIPO_DATO;
//const TS = require('./tablaSimbolos').TS;

var salida = "";

function analizar(entrada) {
    salida = "";
    let ast;

    try {
        ast = parser.parse(entrada.toString());
        //fs.writeFileSync('./ast.json', JSON.stringify(ast, null, 2));
    } catch (e) {
        console.error(e);
        return;
    }

    // Creación de una tabla de simbolos GLOBAL para iniciar con el interprete
    const tsGlobal = new TS([], []);

    // Procesa las instrucciones reconocidas en el AST
    console.log(procesarBloque(ast, tsGlobal).ts)
    return salida
}


// Recorre las instrucciones en un bloque, las identifica y las procesa

function procesarBloque(instrucciones, tablaDeSimbolos) {

    instrucciones.forEach(instruccion => {
        if (instruccion.tipo === TIPO_INSTRUCCION.PRINT) {
            // Procesando Instrucción Print
            salida += procesarPrint(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.PRINTLN) {
            // Procesando Instrucción Println
            salida += procesarPrintln(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.WHILE) {
            // Procesando Instrucción While
            procesarWhile(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DOWHILE) {
            // Procesando Instrucción DOWhile
            procesarDoWhile(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo == TIPO_INSTRUCCION.FOR) {
            // Procesando Instrucción For
            procesarFor(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARACION) {
            // Procesando Instrucción Declaración
            procesarDeclaracion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.ASIGNACION) {
            // Procesando Instrucción Asignación
            procesarAsignacion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARACION_ASIGNACION) {
            // Procesando Instrucción Declaración Asignación
            procesarDeclaracionAsignacion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.IF) {
            // Procesando Instrucción If
            procesarIf(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.IF_ELSE) {
            // Procesando Instrucción If Else
            procesarIfElse(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.ELSE) {
            // Procesando Instrucción Else
            procesarElse(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.SWITCH) {
            // Procesando Instrucción Switch  
            procesarSwitch(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.EJECUTAR_METODO) {
            // Ejecutando Metodos  
            salida += procesarEjecutarMetodo(instruccion, tablaDeSimbolos);
        } else {
            return { valor: 'ERROR: tipo de instrucción no válido: ' + instruccion + "\n", tipo: "ERROR SEMANTICO" };
        }
    });
    return { instrucciones: instrucciones, ts: tablaDeSimbolos, salida: salida }
}

module.exports = analizar;