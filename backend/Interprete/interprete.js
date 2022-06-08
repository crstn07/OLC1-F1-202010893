var fs = require('fs');
var parser = require('../gramatica/gramatica');

const TIPO_INSTRUCCION = require('./instrucciones').TIPO_INSTRUCCION;
const TIPO_OPERACION = require('./instrucciones').TIPO_OPERACION;
const TIPO_VALOR = require('./instrucciones').TIPO_VALOR;
const TIPO_OPCION_SWITCH = require('./instrucciones').TIPO_OPCION_SWITCH;

// Tabla de Simbolos
const TIPO_DATO = require('./tablaSimbolos').TIPO_DATO;
const TS = require('./tablaSimbolos').TS;

var salida = "";

function analizar(entrada) {
    salida = "";
    let ast_instrucciones;

    try {
        ast_instrucciones = parser.parse(entrada.toString());
        console.log(ast_instrucciones)
        //fs.writeFileSync('./ast.json', JSON.stringify(ast_instrucciones, null, 2));
    } catch (e) {
        console.error(e);
        return;
    }

    // Creación de una tabla de simbolos GLOBAL para iniciar con el interprete
    const tsGlobal = new TS([]/*, []*/);

    // Procesa las instrucciones reconocidas en el AST
    procesarBloque(ast_instrucciones, tsGlobal)
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
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARACION) {
            // Procesando Instrucción Declaración
            procesarDeclaracion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.ASIGNACION) {
            // Procesando Instrucción Asignación
            procesarAsignacion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARACION_ASIGNACION) {
            // Procesando Instrucción Declaración Asignación
            procesarDeclaracionAsignacion(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_OPERACION.INCREMENTO_POST) {
            // Procesando Incremento Post
            procesarIncrementoPost(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_OPERACION.DECREMENTO_POST) {
            // Procesando Decremento Post
            procesarDecrementoPost(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_OPERACION.INCREMENTO_PRE) {
            // Procesando Incremento Pre
            procesarIncrementoPre(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_OPERACION.DECREMENTO_PRE) {
            // Procesando Decremento Pre
            procesarDecrementoPre(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.WHILE) {
            // Procesando Instrucción While
            procesarWhile(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo === TIPO_INSTRUCCION.DOWHILE) {
            // Procesando Instrucción DOWhile
            procesarDoWhile(instruccion, tablaDeSimbolos);
        } else if (instruccion.tipo == TIPO_INSTRUCCION.FOR) {
            // Procesando Instrucción For
            procesarFor(instruccion, tablaDeSimbolos);
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

function procesarExpresion(expresion, tablaDeSimbolos) {
    if (expresion.tipo === TIPO_OPERACION.NEGATIVO) {
        const valor = procesarExpresion(expresion.operandoIzq, tablaDeSimbolos);
        if (valor.tipo === TIPO_DATO.ENTERO || valor.tipo === TIPO_DATO.DECIMAL) {
            const res = valor.valor * -1;
            return { valor: res, tipo: valor.tipo };
        } else {
            return { valor: '>>Error Semántico: ' + valor.tipo + ' no puede negarse' + "\n", tipo: "ERROR SEMANTICO" };
            throw '>>Error Semántico: ' + valor.tipo + ' no puede negarse';
        }
    } else if (expresion.tipo === TIPO_OPERACION.SUMA
        || expresion.tipo === TIPO_OPERACION.RESTA
        || expresion.tipo === TIPO_OPERACION.MULTIPLICACION
        || expresion.tipo === TIPO_OPERACION.DIVISION
        || expresion.tipo === TIPO_OPERACION.MODULO
        || expresion.tipo === TIPO_OPERACION.POTENCIA) {
        var valorIzq = procesarExpresion(expresion.operandoIzq, tablaDeSimbolos);
        var valorDer = procesarExpresion(expresion.operandoDer, tablaDeSimbolos);
        // SUMA
        if (expresion.tipo === TIPO_OPERACION.SUMA) {
            if ((valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA)) {
                const res = valorIzq.valor + valorDer.valor
                return { valor: res, tipo: TIPO_DATO.CADENA };
            } else if ((valorIzq.tipo === TIPO_DATO.CARACTER && valorDer.tipo === TIPO_DATO.CARACTER)) {
                const res = valorIzq.valor.charCodeAt(0) + valorDer.valor.charCodeAt(0);
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            } else if ((valorIzq.tipo === TIPO_DATO.DECIMAL || valorDer.tipo === TIPO_DATO.DECIMAL) && (valorIzq.tipo !== TIPO_DATO.BOOLEAN && valorDer.tipo !== TIPO_DATO.BOOLEAN)) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor + valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.DECIMAL };
            } else if ((valorIzq.tipo === TIPO_DATO.ENTERO || valorDer.tipo === TIPO_DATO.ENTERO) && (valorIzq.tipo !== TIPO_DATO.BOOLEAN && valorDer.tipo !== TIPO_DATO.BOOLEAN)) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor + valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            } else {
                return { valor: '>>Error Semántico: No se puede sumar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            }
        }
        // RESTA
        if (expresion.tipo === TIPO_OPERACION.RESTA) {
            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                return { valor: '>>Error Semántico: No se puede restar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            } else if ((valorIzq.tipo === TIPO_DATO.CARACTER && valorDer.tipo === TIPO_DATO.CARACTER)) {
                const res = valorIzq.valor.charCodeAt(0) - valorDer.valor.charCodeAt(0);
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            } else if (valorIzq.tipo === TIPO_DATO.DECIMAL || valorDer.tipo === TIPO_DATO.DECIMAL) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor - valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.DECIMAL };
            } else if (valorIzq.tipo === TIPO_DATO.ENTERO || valorDer.tipo === TIPO_DATO.ENTERO) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor - valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            }
        }
        //MULTIPLICACION
        if (expresion.tipo === TIPO_OPERACION.MULTIPLICACION) {
            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                return { valor: '>>Error Semántico: No se puede multiplicar ' + valorIzq.tipo + ' por ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            } else if (valorIzq.tipo === TIPO_DATO.DECIMAL || valorDer.tipo === TIPO_DATO.DECIMAL) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor * valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.DECIMAL };
            } else if (valorIzq.tipo === TIPO_DATO.ENTERO || valorDer.tipo === TIPO_DATO.ENTERO) {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor * valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            } else if ((valorIzq.tipo === TIPO_DATO.CARACTER && valorDer.tipo === TIPO_DATO.CARACTER)) {
                const res = valorIzq.valor.charCodeAt(0) * valorDer.valor.charCodeAt(0);
                return { valor: res, tipo: TIPO_DATO.ENTERO };
            }
        }
        //DIVISION
        if (expresion.tipo === TIPO_OPERACION.DIVISION) {
            if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
            if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                return { valor: '>>Error Semántico: No se puede dividir ' + valorIzq.tipo + ' entre ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            } else if (valorIzq.tipo === TIPO_DATO.DECIMAL || valorDer.tipo === TIPO_DATO.DECIMAL) {
                if (valorDer.valor === 0) {
                    return { valor: '>>ERROR la division entre 0 da como resultado: ' + valorIzq / valorDer, tipo: "ERROR" };
                } else {
                    const res = valorIzq.valor / valorDer.valor;
                    return { valor: res, tipo: TIPO_DATO.DECIMAL };
                }
            } else if (valorIzq.tipo === TIPO_DATO.ENTERO || valorDer.tipo === TIPO_DATO.ENTERO) {
                if (valorDer.valor === 0) {
                    return { valor: '>>ERROR la division entre 0 da como resultado: ' + valorIzq / valorDer, tipo: "ERROR" };
                } else {
                    const res = Math.trunc(valorIzq.valor / valorDer.valor);
                    return { valor: res, tipo: TIPO_DATO.ENTERO };
                }
            } else if ((valorIzq.tipo === TIPO_DATO.CARACTER && valorDer.tipo === TIPO_DATO.CARACTER)) {
                if (valorDer.valor === 0) {
                    return { valor: '>>ERROR la division entre 0 da como resultado: ' + valorIzq / valorDer, tipo: "ERROR" };
                } else {
                    const res = Math.trunc(valorIzq.valor / valorDer.valor);
                    return { valor: res, tipo: TIPO_DATO.ENTERO };
                }
            }
        }
        //POTENCIA
        if (expresion.tipo === TIPO_OPERACION.POTENCIA) {
            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                return { valor: '>>Error Semántico: No se puede realizar la potencia con ' + valorIzq.tipo + ' y ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            } else {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = Math.pow(valorIzq.valor, valorDer.valor);
                return { valor: res, tipo: TIPO_DATO.DECIMAL };
            }
        }
        // MODULO
        if (expresion.tipo === TIPO_OPERACION.MODULO) {
            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                return { valor: '>>Error Semántico: No se puede realizar el módulo con ' + valorIzq.tipo + ' y ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            } else {
                if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
                if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

                const res = valorIzq.valor % valorDer.valor;
                return { valor: res, tipo: TIPO_DATO.DECIMAL };
            }
        }
    } else if (expresion.tipo === TIPO_VALOR.ENTERO) {
        return { valor: expresion.valor, tipo: TIPO_DATO.ENTERO };

    } else if (expresion.tipo === TIPO_VALOR.DECIMAL) {
        return { valor: expresion.valor, tipo: TIPO_DATO.DECIMAL };

    } else if (expresion.tipo === TIPO_VALOR.CADENA) {
        let cadena = expresion.valor
        cadena = cadena.replaceAll('\\\\', '\\').replaceAll('\\\"', '\"').replaceAll('\\\'', '\'').replaceAll('\\n', '\n').replaceAll('\\t', '\t').replaceAll('\\r', '\r');
        return { valor: cadena, tipo: TIPO_DATO.CADENA };

    } else if (expresion.tipo === TIPO_VALOR.CARACTER) {
        let char = expresion.valor
        char = char.replaceAll('\\\\', '\\').replaceAll('\\\"', '\"').replaceAll('\\\'', '\'').replaceAll('\\n', '\n').replaceAll('\\t', '\t').replaceAll('\\r', '\r');
        return { valor: char, tipo: TIPO_DATO.CARACTER };

    } else if (expresion.tipo === TIPO_VALOR.BOOLEAN) {
        return { valor: expresion.valor, tipo: TIPO_DATO.BOOLEAN };

    } else if (expresion.tipo === TIPO_VALOR.IDENTIFICADOR) {
        // SE RETORNA EL VALOR DE LA TABLA DE SIMBOLOS
        const sym = tablaDeSimbolos.obtener(expresion.valor);
        return { valor: sym.valor, tipo: sym.tipo };
    } else if (expresion.tipo === TIPO_OPERACION.MAYOR_QUE
        || expresion.tipo === TIPO_OPERACION.MENOR_QUE
        || expresion.tipo === TIPO_OPERACION.MAYOR_IGUAL
        || expresion.tipo === TIPO_OPERACION.MENOR_IGUAL
        || expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL
        || expresion.tipo === TIPO_OPERACION.DIFERENTE) {
        let valorIzq = procesarExpresion(expresion.operandoIzq, tablaDeSimbolos);
        let valorDer = procesarExpresion(expresion.operandoDer, tablaDeSimbolos);

        if (valorIzq.tipo === TIPO_DATO.CARACTER) valorIzq.valor = valorIzq.valor.charCodeAt(0);
        if (valorDer.tipo === TIPO_DATO.CARACTER) valorDer.valor = valorDer.valor.charCodeAt(0);

        if (valorIzq.tipo === TIPO_DATO.CADENA && valorDer.tipo === TIPO_DATO.CADENA
            && (expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL || expresion.tipo === TIPO_OPERACION.DIFERENTE)) {
            if (expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL) return { valor: valorIzq.valor === valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.DIFERENTE) return { valor: valorIzq.valor !== valorDer.valor, tipo: TIPO_DATO.BOOLEAN };

        } else if (valorIzq.tipo === TIPO_DATO.BOOLEAN && valorDer.tipo === TIPO_DATO.BOOLEAN
            && (expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL || expresion.tipo === TIPO_OPERACION.DIFERENTE)) {
            if (expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL) return { valor: valorIzq.valor === valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.DIFERENTE) return { valor: valorIzq.valor !== valorDer.valor, tipo: TIPO_DATO.BOOLEAN };

        } else if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
            return { valor: '>>Error semántico: no se puede relacionar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
        }
        else {
            if (expresion.tipo === TIPO_OPERACION.MAYOR_QUE) return { valor: valorIzq.valor > valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.MENOR_QUE) return { valor: valorIzq.valor < valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.MAYOR_IGUAL) return { valor: valorIzq.valor >= valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.MENOR_IGUAL) return { valor: valorIzq.valor <= valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.IGUAL_IGUAL) return { valor: valorIzq.valor === valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
            if (expresion.tipo === TIPO_OPERACION.DIFERENTE) return { valor: valorIzq.valor !== valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
        }
    } else if (expresion.tipo === TIPO_OPERACION.AND
        || expresion.tipo === TIPO_OPERACION.OR
        || expresion.tipo === TIPO_OPERACION.XOR
        || expresion.tipo === TIPO_OPERACION.NOT) {
        let valorIzq = procesarExpresion(expresion.operandoIzq, tablaDeSimbolos);
        let valorDer;
        if (expresion.tipo !== TIPO_OPERACION.NOT) valorDer = procesarExpresion(expresion.operandoDer, tablaDeSimbolos);

        if (expresion.tipo === TIPO_OPERACION.AND && valorIzq.tipo === TIPO_DATO.BOOLEAN && valorDer.tipo === TIPO_DATO.BOOLEAN) {
            //AND
            return { valor: valorIzq.valor && valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
        } else if (expresion.tipo === TIPO_OPERACION.OR && valorIzq.tipo === TIPO_DATO.BOOLEAN && valorDer.tipo === TIPO_DATO.BOOLEAN) {
            //OR
            return { valor: valorIzq.valor || valorDer.valor, tipo: TIPO_DATO.BOOLEAN };
        } else if (expresion.tipo === TIPO_OPERACION.XOR && valorIzq.tipo === TIPO_DATO.BOOLEAN && valorDer.tipo === TIPO_DATO.BOOLEAN) {
            //XOR
            return { valor: Boolean(valorIzq.valor ^ valorDer.valor), tipo: TIPO_DATO.BOOLEAN };
        } else if (expresion.tipo === TIPO_OPERACION.NOT && valorIzq.tipo === TIPO_DATO.BOOLEAN) {
            //NOT
            return { valor: !valorIzq.valor, tipo: TIPO_DATO.BOOLEAN };
        } else {
            return { valor: '>>Error semántico: solo se puede realizar operaciones lógicas con tipos de dato BOOLEAN\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_OPERACION.INCREMENTO) {
        const val = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        return { valor: val.valor + 1, tipo: val.tipo };
    } else if (expresion.tipo === TIPO_OPERACION.DECREMENTO) {
        const val = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        return { valor: val.valor - 1, tipo: val.tipo };
    } else {
        return { valor: 'ERROR: expresión no válida: ' + expresion + "\n", tipo: "ERROR SEMANTICO" };
    }
}

function procesarPrint(instruccion, tablaDeSimbolos) {
    const cadena = procesarExpresion(instruccion.expresion, tablaDeSimbolos).valor;
    return cadena;
}

function procesarPrintln(instruccion, tablaDeSimbolos) {
    const cadena = procesarExpresion(instruccion.expresion, tablaDeSimbolos).valor;
    return (cadena + "\n");
}

function procesarDeclaracion(instruccion, tablaDeSimbolos) {
    tablaDeSimbolos.agregar(instruccion.identificador, instruccion.tipo_dato, undefined, instruccion.tipoVar);
}

function procesarAsignacion(instruccion, tablaDeSimbolos) {
    const valor = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
}

function procesarDeclaracionAsignacion(instruccion, tablaDeSimbolos) {
    const valor = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    tablaDeSimbolos.agregar(instruccion.identificador, instruccion.tipo_dato, valor, instruccion.tipoVar);
}

function procesarIncrementoPost(instruccion, tablaDeSimbolos) {
    let valor = tablaDeSimbolos.obtener(instruccion.identificador);//procesarExpresion({ operandoIzq: { tipo: 'VAL_IDENTIFICADOR', valor: instruccion.identificador }, operandoDer: { tipo: 'VAL_ENTERO', valor: 1 }, tipo: 'OP_SUMA' });
    valor.valor++;
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
    if (valor.tipo === TIPO_DATO.ENTERO) {
        return { tipo: TIPO_VALOR.ENTERO, valor: valor-- }
    } else if (valor.tipo === TIPO_DATO.DECIMAL) {
        return { tipo: TIPO_VALOR.DECIMAL, valor: valor-- }
    }else if (valor.tipo === TIPO_DATO.BOOLEAN) {
        return { tipo: TIPO_VALOR.BOOLEAN, valor: valor-- }
    }else if (valor.tipo === TIPO_DATO.BOOLEAN) {
        return { tipo: TIPO_VALOR.BOOLEAN, valor: valor-- }
    }else if (valor.tipo === TIPO_DATO.CADENA) {
        return { tipo: TIPO_VALOR.CADENA, valor: valor-- }
    }else if (valor.tipo === TIPO_DATO.CARACTER) {
        return { tipo: TIPO_VALOR.CARACTER, valor: valor-- }
    }

}

function procesarIncrementoPre(instruccion, tablaDeSimbolos) {

    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
}

function procesarDecrementoPost(instruccion, tablaDeSimbolos) {

    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
}

function procesarDecrementoPre(instruccion, tablaDeSimbolos) {

    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
}

module.exports = analizar;