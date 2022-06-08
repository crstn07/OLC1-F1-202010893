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

/*function crearMetodo(id, parametros, instrucciones) {
    return {
        id: id,
        parametros: parametros,
        instrucciones: instrucciones
    }
}
*/
class TS {

    constructor(simbolos/*, metodos*/) {
        this._simbolos = simbolos;
        //this._metodos = metodos;
    }
    /*
         agregarMetodo(id, parametros, instrucciones ) {
            const metodo = this._metodos.filter(metodo => metodo.id === id.toLowerCase())[0];
            if (!metodo) {
                const nuevoMetodo = crearMetodo(id.toLowerCase(), parametros, instrucciones);
                if (nuevoMetodo !== undefined) this._metodos.push(nuevoMetodo);
            } else {
                console.error('>>Error Sémantico: el metodo "' + id.toLowerCase() + '" ya fue declarado')
            }
        }
    */

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
                console.error('>>Error Sémantico: la variable "' + ID.toLowerCase() + '" ya fue declarada')
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
                    console.error('>>Error Sémantico: ' + id + ' es de tipo ' + simbolo.tipo + ' y el valor a asignar es de tipo ' + valor.tipo)
                }
            } else {
                console.error('>>Error Sémantico: ' + id + ' es una constante, no se puede cambiar su valor')
            }
        }
        else {
            console.error('ERROR: la variable ' + id + ' no ha sido declarada')
        }
    }

    obtener(id) {
        id = id.toLowerCase();
        const simbolo = this._simbolos.filter(simbolo => simbolo.id === id)[0];

        if (simbolo) return simbolo;
        console.error('ERROR: la variable ' + id + ' no ha sido declarada')
    }

    /*
         obtenerMetodo(id) {
            id = id.toLowerCase();
            const metodo = this._metodos.filter(metodo => metodo.id === id)[0];
            if (metodo) return metodo; 
            console.error('ERROR: el metodo ' + id + ' no ha sido declarado')// throw 'ERROR: metodo: ' + id + ' no ha sido definido';
        }
    */

    get simbolos() {
        return this._simbolos;
    }
    /*
        get metodos(){
            return this._metodos;
        }
    */
}

module.exports.TIPO_DATO = TIPO_DATO;
module.exports.TIPO_VARIABLE = TIPO_VARIABLE;
module.exports.TS = TS;