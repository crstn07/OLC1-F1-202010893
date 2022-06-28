var fs = require('fs');
var parser = require('../gramatica/gramatica');

const TIPO_INSTRUCCION = require('./instrucciones').TIPO_INSTRUCCION;
const TIPO_OPERACION = require('./instrucciones').TIPO_OPERACION;
const TIPO_VALOR = require('./instrucciones').TIPO_VALOR;
const TIPO_OPCION_SWITCH = require('./instrucciones').TIPO_OPCION_SWITCH;
var listaErrores = require('../interprete/instrucciones').listaErrores;

// Tabla de Simbolos
const TIPO_DATO = require('./tablaSimbolos').TIPO_DATO;
const TS = require('./tablaSimbolos').TS;
salida = "";

function analizar(entrada) {
    listaErrores.splice(0, listaErrores.length);
    let ast_instrucciones;
    salida = "";
    try {
        ast_instrucciones = parser.parse(entrada.toString());
        console.log(ast_instrucciones)
        //fs.writeFileSync('./ast.json', JSON.stringify(ast_instrucciones, null, 2));
    } catch (e) {
        console.error(e);
        return;
    }

    // Creación de una tabla de simbolos GLOBAL para iniciar con el interprete
    const tsGlobal = new TS(undefined, []);

    // Procesa las instrucciones reconocidas en el AST
    procesarBloque(ast_instrucciones, tsGlobal)
    if (listaErrores.length > 0) {
        salida += "\n========== ERRORES ==========\n";
    }
    listaErrores.forEach(_error => {
        salida += _error.mensaje + "\n";
    });
    return { salida, ast: ast_instrucciones, listaErrores, TS: tsGlobal };
}


// Recorre las instrucciones en un bloque, las identifica y las procesa
function procesarBloque(instrucciones, tablaDeSimbolos) {
    try {
        instrucciones.forEach(instruccion => {
            if (instruccion.tipo === TIPO_INSTRUCCION.DECLARAR_METODO) {
                procesarDeclararMetodo(instruccion, tablaDeSimbolos);
            }
        })

        breakvar = false;
        continuevar = false;
        returnvar = undefined;
        for (const instruccion of instrucciones) {
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
                let res = procesarWhile(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.DOWHILE) {
                // Procesando Instrucción DOWhile
                let res = procesarDoWhile(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo == TIPO_INSTRUCCION.FOR) {
                // Procesando Instrucción For
                let res = procesarFor(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.IF) {
                // Procesando Instrucción If
                let res = procesarIf(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.IF_ELSE) {
                // Procesando Instrucción If Else
                let res = procesarIfElse(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.ELSE_IF) {
                // Procesando Instrucción Else If
                let res = procesarElseIf(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.SWITCH) {
                // Procesando Instrucción Switch  
                let res = procesarSwitch(instruccion, tablaDeSimbolos);
                if (res !== undefined && (res.breakvar || res.continuevar)) break;
            } else if (instruccion.tipo === TIPO_INSTRUCCION.EJECUTAR_METODO) {
                // Ejecutando Metodos  
                //console.log("SALIDA <<ANTES>> DE EJECUTAR LA INSTRUCCION METODO: \"", salida, "\"")
                procesarEjecutarMetodo(instruccion, tablaDeSimbolos);
                //console.log("SALIDA <<DESPUES>> DE EJECUTAR LA INSTRUCCION METODO: \"", salida, "\"")
            } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARAR_METODO) {
                // IGNORA LA DECLARACION
            } else if (instruccion.tipo === TIPO_INSTRUCCION.BREAK) {
                breakvar = true
                return { breakvar: breakvar, continuevar: continuevar, returnvar: returnvar }
            } else if (instruccion.tipo === TIPO_INSTRUCCION.CONTINUE) {
                continuevar = true
                return { breakvar: breakvar, continuevar: continuevar, returnvar: returnvar }
            } else if (instruccion.tipo === TIPO_INSTRUCCION.RETURN) {
                if (instruccion.expresion !== undefined) {
                    returnvar = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
                }
                return { breakvar, continuevar, returnvar };
            } else if (instruccion.tipo === TIPO_INSTRUCCION.NUEVO_BLOQUE) {
                const nuevaTS = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
                procesarBloque(instruccion.instrucciones, nuevaTS);
            } else if (instruccion.tipo === TIPO_INSTRUCCION.TERNARIO_INS) {
                procesarTernarioIns(instruccion, tablaDeSimbolos);
            } else if (instruccion.tipo === TIPO_INSTRUCCION.DECLARACION_VECTOR) {
                procesarDeclaracionVector(instruccion, tablaDeSimbolos);
            } else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: 'ERROR: tipo de instrucción no válido: ' + instruccion + "\n"
                })
                return { valor: 'ERROR: tipo de instrucción no válido: ' + instruccion + "\n", tipo: "ERROR SEMANTICO" };
            }
        };
        //return { instrucciones: instrucciones, ts: tablaDeSimbolos, salida: salida }
        //console.log("RETURN :" , returnvar)
        return { breakvar, continuevar, returnvar };
    } catch (error) {
        console.log("ERROR :", error)
    }

}

function procesarExpresion(expresion, tablaDeSimbolos) {
    if (expresion.tipo === TIPO_OPERACION.NEGATIVO) {
        const valor = procesarExpresion(expresion.operandoIzq, tablaDeSimbolos);
        if (valor.tipo === TIPO_DATO.ENTERO || valor.tipo === TIPO_DATO.DECIMAL) {
            const res = valor.valor * -1;
            return { valor: res, tipo: valor.tipo };
        } else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: ' + valor.tipo + ' no puede negarse'
            })
            return { valor: '>>ERROR SEMANTICO: ' + valor.tipo + ' no puede negarse' + "\n", tipo: "ERROR SEMANTICO" };
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
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede sumar ' + valorIzq.tipo + ' con ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede sumar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
            }
        }
        // RESTA
        if (expresion.tipo === TIPO_OPERACION.RESTA) {
            if (valorIzq.tipo === TIPO_DATO.CADENA || valorDer.tipo === TIPO_DATO.CADENA || valorIzq.tipo === TIPO_DATO.BOOLEAN || valorDer.tipo === TIPO_DATO.BOOLEAN) {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede restar ' + valorIzq.tipo + ' con ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede restar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede multiplicar ' + valorIzq.tipo + ' por ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede multiplicar ' + valorIzq.tipo + ' por ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede dividir ' + valorIzq.tipo + ' entre ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede dividir ' + valorIzq.tipo + ' entre ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede realizar la potencia con ' + valorIzq.tipo + ' y ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede realizar la potencia con ' + valorIzq.tipo + ' y ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: No se puede realizar el módulo con ' + valorIzq.tipo + ' y ' + valorDer.tipo
                })
                return { valor: '>>ERROR SEMANTICO: No se puede realizar el módulo con ' + valorIzq.tipo + ' y ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
        if (Array.isArray(sym.valor)) {
            return { valor: JSON.stringify(sym.valor), tipo: sym.tipo };
        }
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
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: no se puede relacionar ' + valorIzq.tipo + ' con ' + valorDer.tipo
            })
            return { valor: '>>ERROR SEMANTICO: no se puede relacionar ' + valorIzq.tipo + ' con ' + valorDer.tipo + "\n", tipo: "ERROR SEMANTICO" };
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
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: solo se puede realizar operaciones lógicas con tipos de dato BOOLEAN'
            })
            return { valor: '>>ERROR SEMANTICO: solo se puede realizar operaciones lógicas con tipos de dato BOOLEAN\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_OPERACION.INCREMENTO_POST) {
        if (expresion.identificador.valor != undefined) expresion.identificador = expresion.identificador.valor;
        return procesarIncrementoPost(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_OPERACION.DECREMENTO_POST) {
        if (expresion.identificador.valor != undefined) expresion.identificador = expresion.identificador.valor;
        return procesarDecrementoPost(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_OPERACION.INCREMENTO_PRE) {
        if (expresion.identificador.valor != undefined) expresion.identificador = expresion.identificador.valor;
        return procesarIncrementoPre(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_OPERACION.DECREMENTO_PRE) {
        if (expresion.identificador.valor != undefined) expresion.identificador = expresion.identificador.valor;
        return procesarDecrementoPre(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_OPERACION.TYPEOF) {
        let res = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        return { valor: res.tipo.toLowerCase(), tipo: TIPO_DATO.CADENA }
    } else if (expresion.tipo === TIPO_INSTRUCCION.EJECUTAR_METODO) {
        console.log("SALIDA DESPUES DE DEVOLVER EL RETORNO: \"" + salida + "\"");
        return procesarEjecutarMetodo(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_INSTRUCCION.TERNARIO_EXP) {
        return procesarTernarioExp(expresion, tablaDeSimbolos);
    } else if (expresion.tipo === TIPO_OPERACION.TOLOWER) {
        let exp = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        if (exp.tipo === TIPO_DATO.CADENA) return { valor: exp.valor.toLowerCase(), tipo: TIPO_DATO.CADENA }
        else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: solo se aceptan cadenas'
            })
            return { valor: '>>ERROR SEMANTICO: solo se aceptan cadenas\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_OPERACION.TOUPPER) {
        let exp = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        if (exp.tipo === TIPO_DATO.CADENA) return { valor: exp.valor.toUpperCase(), tipo: TIPO_DATO.CADENA }
        else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: solo se aceptan cadenas'
            })
            return { valor: '>>ERROR SEMANTICO: solo se aceptan cadenas\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_OPERACION.ROUND) {
        let exp = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        if (exp.tipo === TIPO_DATO.DECIMAL) return { valor: Math.round(exp.valor), tipo: TIPO_DATO.ENTERO }
        else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: solo se aceptan decimales'
            })
            return { valor: '>>ERROR SEMANTICO: solo se aceptan decimales\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_OPERACION.LENGTH) {
        let exp = procesarExpresion(expresion.expresion, tablaDeSimbolos);
        if (exp.tipo === TIPO_DATO.CADENA) return { valor: exp.valor.length, tipo: TIPO_DATO.ENTERO }
        else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: solo se aceptan cadenas o vectores'
            })
            return { valor: '>>ERROR SEMANTICO: solo se aceptan cadenas o vectores\n', tipo: "ERROR SEMANTICO" };
        }
    } else if (expresion.tipo === TIPO_INSTRUCCION.ACCESO_VECTOR) {
        return procesarAccesoVector(expresion, tablaDeSimbolos);
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
    let valor = tablaDeSimbolos.obtener(instruccion.identificador);
    valor.valor++;
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
    return { tipo: valor.tipo, valor: valor.valor - 1 }
}

function procesarIncrementoPre(instruccion, tablaDeSimbolos) {
    let valor = tablaDeSimbolos.obtener(instruccion.identificador);
    valor.valor++;
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
    return { tipo: valor.tipo, valor: valor.valor }
}

function procesarDecrementoPost(instruccion, tablaDeSimbolos) {
    let valor = tablaDeSimbolos.obtener(instruccion.identificador);
    valor.valor--;
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
    return { tipo: valor.tipo, valor: valor.valor + 1 }
}

function procesarDecrementoPre(instruccion, tablaDeSimbolos) {
    let valor = tablaDeSimbolos.obtener(instruccion.identificador);
    valor.valor--;
    tablaDeSimbolos.actualizar(instruccion.identificador, valor);
    return { tipo: valor.tipo, valor: valor.valor }
}

function procesarWhile(instruccion, tablaDeSimbolos) {
    while (procesarExpresion(instruccion.expresion, tablaDeSimbolos).valor) {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const tsWhile = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        if (procesarBloque(instruccion.instrucciones, tsWhile).breakvar) break;
    }
}

function procesarDoWhile(instruccion, tablaDeSimbolos) {
    do {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const tsDoWhile = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        if (procesarBloque(instruccion.instrucciones, tsDoWhile).breakvar) break;
    } while (procesarExpresion(instruccion.expresion, tablaDeSimbolos).valor);
}

function procesarFor(instruccion, tablaDeSimbolos) {
    let copiaArray = tablaDeSimbolos.simbolos.slice();
    const tsFor = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
    if (instruccion.variable.tipo === TIPO_INSTRUCCION.ASIGNACION) {
        //LA VARIABLE YA HA SIDO DECLARADA EN EL AMBITO PADRE Y SE ASIGNA VALOR
        procesarAsignacion(instruccion.variable, tsFor /*Verificar por tsFor*/);
    } else if (instruccion.variable.tipo === TIPO_INSTRUCCION.DECLARACION_ASIGNACION) {
        //LA VARIABLE SE DECLARA EN EL AMBITO LOCAL Y SE ASIGNA DE UNA VEZ       
        procesarDeclaracionAsignacion(instruccion.variable, tsFor);
    }
    while (procesarExpresion(instruccion.expresion, tsFor).valor) {
        //let copiaArray = tsLocal.simbolos.slice();
        const tsForBloque = new TS(tsFor, tablaDeSimbolos.metodos);
        var res = procesarBloque(instruccion.instrucciones, tsForBloque);
        if (res.breakvar) break;
        //if(res.continuevar) console.log("Continue");
        if (instruccion.aumento.tipo !== TIPO_INSTRUCCION.ASIGNACION) procesarExpresion(instruccion.aumento, tsFor);
        else procesarAsignacion(instruccion.aumento, tsFor);
    }


}

function procesarIf(instruccion, tablaDeSimbolos) {
    const condicion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    if (condicion.valor) {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const /*Eliminar el Const si no funciona*/tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        return procesarBloque(instruccion.instrucciones, tsIf);
    }
}

function procesarIfElse(instruccion, tablaDeSimbolos) {
    const condicion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    if (condicion.valor) {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        return procesarBloque(instruccion.instruccionesIfVerdadero, tsIf);
    } else {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const tsElse = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);;
        return procesarBloque(instruccion.instruccionesIfFalso, tsElse);
    }
}

function procesarElseIf(instruccion, tablaDeSimbolos) {
    const condicion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    if (condicion.valor) {
        let copiaArray = tablaDeSimbolos.simbolos.slice();
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        return procesarBloque(instruccion.instruccionesIf, tsIf);
    } else {
        if (instruccion.if.tipo === TIPO_INSTRUCCION.IF_ELSE) return procesarIfElse(instruccion.if, tablaDeSimbolos);
        if (instruccion.if.tipo === TIPO_INSTRUCCION.IF) return procesarIf(instruccion.if, tablaDeSimbolos);
        if (instruccion.if.tipo === TIPO_INSTRUCCION.ELSE_IF) return procesarElseIf(instruccion.if, tablaDeSimbolos);
    }
}

function procesarSwitch(instruccion, tablaDeSimbolos) {
    let match = false;
    let def; let sinbreak = false;
    const valorExpresion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    let copiaArray = tablaDeSimbolos.simbolos.slice();
    const tsSwitch = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
    instruccion.casos.forEach(caso => {
        if (caso.tipo == TIPO_OPCION_SWITCH.CASE) {
            const valorExpCase = procesarExpresion(caso.expresion, tsSwitch);
            if (valorExpCase.valor == valorExpresion.valor || sinbreak) {
                var res = procesarBloque(caso.instrucciones, tsSwitch);
                match = true;
                if (res != undefined && !res.breakvar) sinbreak = true;
                else sinbreak = false;
            }
        }
        else {
            def = caso;
            if (sinbreak) procesarBloque(def.instrucciones, tsSwitch); //Pendiente de eliminar o dejar
        }

    });
    if (!match) procesarBloque(def.instrucciones, tsSwitch);

}

function procesarTernarioIns(instruccion, tablaDeSimbolos) {
    const condicion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    if (condicion.valor) {
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        procesarBloque(instruccion.instruccionVerdadera, tsIf);
    } else {
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        procesarBloque(instruccion.instruccionFalsa, tsIf);
    }
}

function procesarTernarioExp(instruccion, tablaDeSimbolos) {
    const condicion = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    if (condicion.valor) {
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        return procesarExpresion(instruccion.expresionVerdadera, tsIf);
    } else {
        const tsIf = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
        return procesarExpresion(instruccion.expresionFalsa, tsIf);
    }
}

function procesarDeclararMetodo(instruccion, tablaDeSimbolos) {
    //console.log(instruccion.tipoReturn)
    tablaDeSimbolos.agregarMetodo(instruccion.identificador, instruccion.parametros, instruccion.instrucciones, instruccion.tipoReturn);
}

function procesarEjecutarMetodo(instruccion, tablaDeSimbolos) {
    try {
        const metodos = tablaDeSimbolos.metodos.filter(metodo => metodo.id === instruccion.identificador.toLowerCase());
        //const metodos = tablaDeSimbolos.obtenerMetodo(instruccion.identificador);
        if (metodos.length > 0) {
            let error = false;
            //let errorLength = false;
            //let errorType = false;
            let copiaArray = tablaDeSimbolos.simbolos.slice();
            const tsMetodo = new TS(tablaDeSimbolos, tablaDeSimbolos.metodos);
            for (const metodo of metodos) {
                let params1 = metodo.parametros.map(parametro => parametro.tipo);
                let params2 = instruccion.parametrosAsignar.map(parametro => procesarExpresion(parametro, tablaDeSimbolos).tipo);
                //console.log("MAP1: ", params1)
                //console.log("MAP2: ", params2)
                //console.log(JSON.stringify(params1) === JSON.stringify(params2))

                if (JSON.stringify(params1) === JSON.stringify(params2)) {
                    //errorLength = false;
                    //errorType = false;
                    error = false;
                    if (params1.length > 0) {
                        for (let i = 0; i < metodo.parametros.length; i++) {
                            const param = metodo.parametros[i];
                            const paramAsignar = instruccion.parametrosAsignar[i];
                            let parametroAsignar = procesarExpresion(paramAsignar, tsMetodo);
                            tsMetodo.agregar([param.identificador], param.tipo, parametroAsignar, "VAR");
                        }
                    }
                    if (metodo.tipoReturn === "VOID") {
                        let retorno = procesarBloque(metodo.instrucciones, tsMetodo).returnvar;
                        //console.log("RETORNO DE METODO: " + metodo.id + " = " + JSON.stringify(retorno));
                        if (retorno !== undefined) {
                            listaErrores.push({
                                tipo: "SEMANTICO", linea: "", columna: "",
                                mensaje: ">>ERROR SEMANTICO: Un método no debe tener un valor de retorno"
                            })
                            //salida += "\n>>ERROR SEMANTICO: Un método no debe tener un valor de retorno \n";
                        }
                        break;
                    } else {
                        let retorno = procesarBloque(metodo.instrucciones, tsMetodo).returnvar;
                        console.log("RETORNO DE METODO: " + metodo.id + " = " + JSON.stringify(retorno));
                        if (retorno === undefined) {
                            listaErrores.push({
                                tipo: "SEMANTICO", linea: "", columna: "",
                                mensaje: ">>ERROR SEMANTICO: Una función debe tener un valor de retorno"
                            })
                            //salida += "\n>>ERROR SEMANTICO: Una función debe tener un valor de retorno \n";
                        } else if (retorno.tipo === metodo.tipoReturn) {
                            returnvar = undefined;
                            console.log("SALIDA DESPUES DE EJECUTAR EL METODO: " + metodo.id + " = {" + salida + "}")
                            return retorno; //{retorno, salida}
                        } else {
                            listaErrores.push({
                                tipo: "SEMANTICO", linea: "", columna: "",
                                mensaje: ">>ERROR SEMANTICO: El tipo de la expresión de retorno no coincide con el tipo de la función:  \"" + metodo.id + "\""
                            })
                            //salida += "\n>>ERROR SEMANTICO: El tipo de la expresión de retorno no coincide con el tipo de la función:  \"" + metodo.id + "\"\n";
                            returnvar = undefined;
                            return { valor: undefined, tipo: "STRING" };
                        }
                        break;
                    }
                } else {
                    //if (params1.length !== params2.length) errorLength = true;
                    //else errorType = true;
                    error = true;
                }
            }
            if (error) {
                // salida += "\n>>ERROR SEMANTICO: problemas con los parámetros del método: \"" + metodos[0].id + "\"\n";
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: `>>ERROR SEMANTICO: problemas con los parámetros del método: \"${metodos[0].id}\"`
                })
            }
            //if (errorLength) salida += "\n>>Error Sémantico: la cantidad de parámetros a asignar del método: \"" + metodos[0].id + "\" no es la misma que la de los parametros declarados\n";
            //if(errorType) salida += "\n>>ERROR SEMANTICO: los tipos de los parámetros del método: \"" + metodos[0].id + "\" no coinciden \n";

        } else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: `>>ERROR SEMANTICO: no existe el método: \"${instruccion.identificador.toLowerCase()}\"`
            })
            //salida += "\n>>ERROR SEMANTICO: no existe el método: \"" + instruccion.identificador.toLowerCase() + "\"\n";
        }

    } catch (error) {
        console.log(error)
        salida += "\n>>Ocurrió un error al ejecutar el metodo" + metodo.identificador.toLowerCase() + "\n"
    }
}

function procesarDeclaracionVector(instruccion, tablaDeSimbolos) {
    let exp;
    let exp2 = { valor: undefined };
    if (instruccion.tipo_dato2) {
        exp = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
        if (instruccion.expresion2) {
            exp2 = procesarExpresion(instruccion.expresion2, tablaDeSimbolos);
        }
    } else {
        let valores = [];
        instruccion.expresion.forEach(expresion => {
            if (Array.isArray(expresion)) {
                let valoresVector = []
                expresion.forEach(expresion => {
                    valoresVector.push(procesarExpresion(expresion, tablaDeSimbolos));
                });
                valores.push(valoresVector);
            } else {
                valores.push(procesarExpresion(expresion, tablaDeSimbolos));
            }
        });
        exp = { valor: valores }
    }
    tablaDeSimbolos.agregarVector(instruccion.identificador, instruccion.tipo_dato, instruccion.tipo_dato2, exp, exp2)
}

function procesarAccesoVector(instruccion, tablaDeSimbolos) {
    let exp = procesarExpresion(instruccion.expresion, tablaDeSimbolos);
    let exp2;
    if (instruccion.expresion2) {
        exp2 = procesarExpresion(instruccion.expresion2, tablaDeSimbolos);
    }
    return tablaDeSimbolos.obtenerValorVector(instruccion.identificador, exp, exp2)
}
module.exports = analizar;