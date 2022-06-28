var listaErrores = require('../interprete/instrucciones').listaErrores;

const TIPO_DATO = {
    ENTERO: 'INT',
    DECIMAL: 'DOUBLE',
    CADENA: 'STRING',
    CARACTER: 'CHAR',
    BOOLEAN: 'BOOLEAN'
}

const TIPO_VARIABLE = {
    VARIABLE: 'VAR',
    CONSTANTE: 'CONST'
}

function crearSimbolo(id, tipo, valor, tipoVar) {
    if (valor.valor === undefined) {
        let val;
        if (tipo === TIPO_DATO.ENTERO || tipo === TIPO_DATO.DECIMAL) {
            val = 0;
        }
        if (tipo == TIPO_DATO.CADENA || tipo == TIPO_DATO.CARACTER) {
            val = "";
        }
        if (tipo == TIPO_DATO.BOOLEAN) {
            val = true;
        }
        return {
            id: id,
            tipo: tipo,
            valor: val,
            tipoVar: tipoVar
        }
    } else {
        if (valor.tipo !== tipo) {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: ">>ERROR SEMANTICO: " + id + " es de tipo " + tipo + " y el valor a asignar \"" + valor.valor + "\" es de tipo " + valor.tipo
            })
            console.log(">>ERROR SEMANTICO: " + id + " es de tipo " + tipo + " y el valor a asignar \"" + valor.valor + "\" es de tipo " + valor.tipo)
        } else {
            return {
                id: id,
                tipo: tipo,
                valor: valor.valor,
                tipoVar: tipoVar
            }
        }

    }

}

function crearMetodo(id, parametros, instrucciones, tipoReturn) {
    return {
        id: id,
        parametros: parametros,
        instrucciones: instrucciones,
        tipoReturn: tipoReturn
    }
}

class TS {

    constructor(anterior, metodos) {
        this.anterior = anterior;
        this._simbolos = new Array();
        this._metodos = metodos;
    }

    agregarMetodo(id, parametros, instrucciones, tipoReturn) {
        const metodos = this._metodos.filter(metodo => metodo.id === id.toLowerCase());
        for (const metodo of metodos) {
            let params1 = metodo.parametros.map(parametro => parametro.tipo);
            let params2 = parametros.map(parametro => parametro.tipo);
            //console.log("MAP1: ", params1)
            //console.log("MAP2: ", params2)
            //console.log(JSON.stringify(params1) !== JSON.stringify(params2))
            if (JSON.stringify(params1) !== JSON.stringify(params2)) {
                // NO es el mismo metodo
                //console.log("NO ES EL MISMO METODO")
                const nuevoMetodo = crearMetodo(id.toLowerCase(), parametros, instrucciones, tipoReturn);
                if (nuevoMetodo !== undefined) this._metodos.push(nuevoMetodo);
            } else {
                // ES el mismo metodo
                //console.log("ES EL MISMO METODO")
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el metodo "' + id.toLowerCase() + '" ya fue declarado'
                })
                console.error('>>ERROR SEMANTICO: el metodo "' + id.toLowerCase() + '" ya fue declarado')
            }
        }
        if (!metodos[0]) {
            const nuevoMetodo = crearMetodo(id.toLowerCase(), parametros, instrucciones, tipoReturn);
            if (nuevoMetodo !== undefined) this._metodos.push(nuevoMetodo);
        }
    }


    agregar(id, tipo, valor, tipoVar) {
        //if (Array.isArray(id)) {
        id.forEach(ID => {
            const simbolo = this._simbolos.filter(simbolo => simbolo.id === ID.toLowerCase())[0];
            if (!simbolo) {
                if (valor === undefined) {
                    const nuevoSimbolo = crearSimbolo(ID.toLowerCase(), tipo, { valor: valor, tipo: tipo }, tipoVar);
                    if (nuevoSimbolo !== undefined) this._simbolos.push(nuevoSimbolo);
                } else {
                    const nuevoSimbolo = crearSimbolo(ID.toLowerCase(), tipo, valor, tipoVar);
                    if (nuevoSimbolo !== undefined) this._simbolos.push(nuevoSimbolo);
                }
            } else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: la variable "' + ID.toLowerCase() + '" ya fue declarada'
                })
                console.error('>>ERROR SEMANTICO: la variable "' + ID.toLowerCase() + '" ya fue declarada')
                //throw new error('>>ERROR SEMANTICO: la variable "' + ID.toLowerCase() + '" ya fue declarada');
            }

        })
        //}
    }

    agregarVector(id, tipo, tipo2, valor, expresion2) {
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id.toLowerCase())[0];
        if (!simbolo) {
            if (Number(valor.valor)) {
                if (tipo === tipo2) {
                    let vector = [];
                    for (let i = 0; i < valor.valor; i++) {
                        if (expresion2.valor) {
                            let valoresVector = [];
                            for (let j = 0; j < expresion2.valor; j++) {
                                if (tipo === TIPO_DATO.ENTERO || tipo === TIPO_DATO.DECIMAL) {
                                    valoresVector.push(0);
                                }
                                if (tipo == TIPO_DATO.CADENA || tipo == TIPO_DATO.CARACTER) {
                                    valoresVector.push("");
                                }
                                if (tipo == TIPO_DATO.BOOLEAN) {
                                    valoresVector.push(true);
                                }
                            }
                            vector.push(valoresVector);
                        } else {
                            if (tipo === TIPO_DATO.ENTERO || tipo === TIPO_DATO.DECIMAL) {
                                vector.push(0);
                            }
                            if (tipo == TIPO_DATO.CADENA || tipo == TIPO_DATO.CARACTER) {
                                vector.push("");
                            }
                            if (tipo == TIPO_DATO.BOOLEAN) {
                                vector.push(true);
                            }
                        }

                    }
                    this._simbolos.push({ id: id, tipo: tipo, valor: vector, tipoVar: "VAR" });
                } else {
                    listaErrores.push({
                        tipo: "SEMANTICO", linea: "", columna: "",
                        mensaje: '>>ERROR SEMANTICO: los tipos del vector "' + id.toLowerCase() + '" no son iguales'
                    })
                }
            } else {
                console.log("valores: ", valor.valor)
                let vector = [];
                let error = false;
                for (const val of valor.valor) {
                    if (Array.isArray(val)) {
                        let valoresVector = []
                        for (const val2 of val) {
                            if (val2.tipo === tipo) {
                                valoresVector.push(val2.valor);
                            } else {
                                listaErrores.push({
                                    tipo: "SEMANTICO", linea: "", columna: "",
                                    mensaje: '>>ERROR SEMANTICO: los tipos del vector "' + id.toLowerCase() + '" no son iguales'
                                })
                                error = true;
                                break;
                            }
                        }
                        if (error) break;
                        vector.push(valoresVector);
                    } else {
                        if (val.tipo === tipo) {
                            vector.push(val.valor);
                        } else {
                            listaErrores.push({
                                tipo: "SEMANTICO", linea: "", columna: "",
                                mensaje: '>>ERROR SEMANTICO: los tipos del vector "' + id.toLowerCase() + '" no son iguales'
                            })
                            error = true;
                            break;
                        }
                    }

                }
                if (!error) this._simbolos.push({ id: id, tipo: tipo, valor: vector, tipoVar: "VAR" });
            }
        } else {
            listaErrores.push({
                tipo: "SEMANTICO", linea: "", columna: "",
                mensaje: '>>ERROR SEMANTICO: la variable "' + id.toLowerCase() + '" ya fue declarada'
            })
        }
    }

    actualizar(id, valor) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo) {
            if (simbolo.tipoVar !== TIPO_VARIABLE.CONSTANTE) {
                if (simbolo.tipo === valor.tipo) {
                    simbolo.valor = valor.valor;
                } else {
                    listaErrores.push({
                        tipo: "SEMANTICO", linea: "", columna: "",
                        mensaje: '>>ERROR SEMANTICO: ' + id + ' es de tipo ' + simbolo.tipo + ' y el valor a asignar es de tipo ' + valor.tipo
                    })
                    console.error('>>ERROR SEMANTICO: ' + id + ' es de tipo ' + simbolo.tipo + ' y el valor a asignar es de tipo ' + valor.tipo)
                }
            } else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: ' + id + ' es una constante, no se puede cambiar su valor'
                })
                console.error('>>ERROR SEMANTICO: ' + id + ' es una constante, no se puede cambiar su valor')
            }
        }
        else {
            if (this.anterior !== undefined) {
                this.anterior.actualizar(id, valor)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: la variable ' + id + ' no ha sido declarada'
                })
                console.error('ERROR: la variable ' + id + ' no ha sido declarada')
                //return undefined;
            }
        }
    }

    obtener(id) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo) { return simbolo; }
        else {
            if (this.anterior !== undefined) {
                return this.anterior.obtener(id)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: la variable ' + id + ' no ha sido declarada'
                })
                console.error('ERROR: la variable ' + id + ' no ha sido declarada')
            }
        }
    }

    obtenerValorVector(id, expresion, expresion2) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo && expresion2) {
            return { valor: simbolo.valor[expresion.valor][expresion2.valor], tipo: simbolo.tipo }
        } else if (simbolo) {
            return { valor: simbolo.valor[expresion.valor], tipo: simbolo.tipo }
        }
        else {
            if (this.anterior !== undefined) {
                return this.anterior.obtenerValorVector(id, expresion, expresion2)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el vector "' + id + '" no ha sido declarado'
                })
            }
        }
    }

    modificarVector(id, pos1, pos2, exp) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo && pos2) {
            if (simbolo.tipo === exp.tipo) {
                simbolo.valor[pos1.valor][pos2.valor] = exp.valor;
            } else {

            }
        } else if (simbolo) {
            if (simbolo.tipo === exp.tipo) {
                simbolo.valor[pos1.valor] = exp.valor;
            } else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el vector "' + id + '" es de tipo ' + simbolo.tipo + ', y el valor a asignar es ' + exp.tipo
                })
            }
        }
        else {
            if (this.anterior !== undefined) {
                this.anterior.modificarVector(id, pos1, pos2, exp)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el vector "' + id + '" no ha sido declarado'
                })
            }
        }
    }

    indexof(id, expresion) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo) {
            return simbolo.valor.indexOf(expresion.valor);
        } else {
            if (this.anterior !== undefined) {
                return this.anterior.indexof(id, expresion)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el vector "' + id + '" no ha sido declarado'
                })
            }
        }
    }

    Push(id, expresion) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];
        if (simbolo) {
            if (simbolo.tipo === expresion.tipo) {
                simbolo.valor.push(expresion.valor);
                return true;
            }
            return false;
        } else {
            if (this.anterior !== undefined) {
                return this.anterior.Push(id, expresion)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>ERROR SEMANTICO: el vector "' + id + '" no ha sido declarado'
                })
            }
        }
    }
    /* obtenerMetodo(id) {
        id = id.toLowerCase();
        //const metodo = this._metodos.filter(metodo => metodo.id === id)[0];
        const metodos = this._metodos.filter(metodo => metodo.id === id);
        console.log("METODOS: ", metodos)
        if (metodos[0]) { return metodos; }
        else {
            if (this.anterior !== undefined) {
                return this.anterior.obtenerMetodo(id);
            }
            else {
                console.error('ERROR: el metodo ' + id + ' no ha sido declarado')
                return;
            }
        }
    } */


    get simbolos() {
        return this._simbolos;
    }

    get metodos() {
        return this._metodos;
    }

}

module.exports.TIPO_DATO = TIPO_DATO;
module.exports.TIPO_VARIABLE = TIPO_VARIABLE;
module.exports.TS = TS;