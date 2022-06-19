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
                mensaje: ">>Error Semántico: " + id + " es de tipo " + tipo + " y el valor a asignar \"" + valor.valor + "\" es de tipo " + valor.tipo
            })
            console.log(">>Error Semántico: " + id + " es de tipo " + tipo + " y el valor a asignar \"" + valor.valor + "\" es de tipo " + valor.tipo)
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
                    mensaje: '>>Error Sémantico: el metodo "' + id.toLowerCase() + '" ya fue declarado'
                })
                console.error('>>Error Sémantico: el metodo "' + id.toLowerCase() + '" ya fue declarado')
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
                    mensaje: '>>Error Sémantico: la variable "' + ID.toLowerCase() + '" ya fue declarada'
                })
                console.error('>>Error Sémantico: la variable "' + ID.toLowerCase() + '" ya fue declarada')
                //throw new error('>>Error Sémantico: la variable "' + ID.toLowerCase() + '" ya fue declarada');
            }

        })
        //}
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
                        mensaje: '>>Error Sémantico: ' + id + ' es de tipo ' + simbolo.tipo + ' y el valor a asignar es de tipo ' + valor.tipo
                    })
                    console.error('>>Error Sémantico: ' + id + ' es de tipo ' + simbolo.tipo + ' y el valor a asignar es de tipo ' + valor.tipo)
                }
            } else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: '>>Error Sémantico: ' + id + ' es una constante, no se puede cambiar su valor'
                })
                console.error('>>Error Sémantico: ' + id + ' es una constante, no se puede cambiar su valor')
            }
        }
        else {
            if (this.anterior !== undefined) {
                this.anterior.actualizar(id, valor)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: 'ERROR: la variable ' + id + ' no ha sido declarada'
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
            /*             do {
                            res = anterior.obtener(id)
                            if(res!==undefined) { return res; }
                        } while (anterior !== undefined); */
            if (this.anterior !== undefined) {
                return this.anterior.obtener(id)
            }
            else {
                listaErrores.push({
                    tipo: "SEMANTICO", linea: "", columna: "",
                    mensaje: 'ERROR: la variable ' + id + ' no ha sido declarada'
                })
                console.error('ERROR: la variable ' + id + ' no ha sido declarada')
                //return undefined;
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