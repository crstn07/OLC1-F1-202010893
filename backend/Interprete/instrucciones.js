const TIPO_VALOR = {
	ENTERO: 'VAL_ENTERO',
	DECIMAL: 'VAL_DECIMAL',
	CADENA: 'VAL_CADENA',
	BOOLEAN: 'VAL_BOOLEAN',
	CARACTER: 'VAL_CARACTER',
	IDENTIFICADOR: 'VAL_IDENTIFICADOR'
}

const TIPO_OPERACION = {
	SUMA: 'SUMA',
	RESTA: 'RESTA',
	MULTIPLICACION: 'MULTIPLICACION',
	DIVISION: 'DIVISION',
	NEGATIVO: 'NEGATIVO',
	MODULO: 'MODULO',
	POTENCIA: 'POTENCIA',

	MAYOR_QUE: 'MAYOR_QUE',
	MENOR_QUE: 'MENOR_QUE',
	MAYOR_IGUAL: 'MAYOR_IGUAL',
	MENOR_IGUAL: 'MENOR_IGUAL',
	IGUAL_IGUAL: 'IGUAL_IGUAL',
	DIFERENTE: 'DIFERENTE',

	AND: 'AND',
	OR: 'OR',
	NOT: 'NOT',
	XOR: 'XOR',

	INCREMENTO_POST: 'INCREMENTO_POST',
	INCREMENTO_PRE: 'INCREMENTO_PRE',
	DECREMENTO_POST: 'DECREMENTO_POST',
	DECREMENTO_PRE: 'DECREMENTO_PRE',

	TYPEOF: "TYPEOF", 
	TOLOWER: "TOLOWER",
	TOUPPER: "TOUPPER",
	ROUND: "ROUND",
	LENGTH: "LENGTH",
	TO_CHAR_ARRAY: "TO_CHAR_ARRAY",
	INDEXOF: "INDEXOF"
};

const TIPO_INSTRUCCION = {
	PRINT: 'PRINT',
	PRINTLN: 'PRINTLN',
	WHILE: 'WHILE',
	DECLARACION: 'DECLARACION',
	ASIGNACION: 'ASIGNACION',
	DECLARACION_ASIGNACION: 'DECLARACION_ASIGNACION',
	IF: 'IF',
	IF_ELSE: 'IF_ELSE',
	ELSE_IF: 'ELSE_IF',
	FOR: 'FOR',
	SWITCH: 'SWITCH',
	DOWHILE: 'DOWHILE',
	BREAK: 'BREAK',
	CONTINUE: 'CONTINUE',
	DECLARAR_METODO: 'DECLARAR_METODO',
	EJECUTAR_METODO: 'EJECUTAR_METODO',
	RETURN: 'RETURN',
	NUEVO_BLOQUE: 'NUEVO_BLOQUE',
	TERNARIO_INS: 'TERNARIO_INS',
	TERNARIO_EXP: 'TERNARIO_EXP',
	DECLARACION_VECTOR: 'DECLARACION_VECTOR',
	ACCESO_VECTOR: 'ACCESO_VECTOR',
	MODIFICAR_VECTOR: 'MODIFICAR_VECTOR',
	PUSH: 'PUSH',
	POP: 'POP',
	SPLICE: 'SPLICE',
	GRAFICAR_TS: 'GRAFICAR_TS',
}

const TIPO_OPCION_SWITCH = {
	CASE: 'CASE',
	DEFAULT: 'DEFAULT'
}

function nuevaOperacion(operandoIzq, operandoDer, tipo) {
	return {
		operandoIzq: operandoIzq,
		operandoDer: operandoDer,
		tipo: tipo
	}
}

const instrucciones = {

	nuevaOperacionBinaria: function (operandoIzq, operandoDer, tipo) {
		return nuevaOperacion(operandoIzq, operandoDer, tipo);
	},

	nuevaOperacionUnaria: function (operando, tipo) {
		return nuevaOperacion(operando, undefined, tipo);
	},

	nuevoValor: function (valor, tipo) {
		return {
			tipo: tipo,
			valor: valor
		}
	},

	nuevoPrint: (expresion) => ({
		tipo: TIPO_INSTRUCCION.PRINT,
		expresion: expresion
	}),

	nuevoPrintln: (expresion) => ({
		tipo: TIPO_INSTRUCCION.PRINTLN,
		expresion: expresion
	}),

	nuevoIncrementoPost: (identificador) => ({
		tipo: TIPO_OPERACION.INCREMENTO_POST,
		identificador: identificador
	}),

	nuevoIncrementoPre: (identificador) => ({
		tipo: TIPO_OPERACION.INCREMENTO_PRE,
		identificador: identificador
	}),

	nuevoDecrementoPost: (identificador) => ({
		tipo: TIPO_OPERACION.DECREMENTO_POST,
		identificador: identificador
	}),

	nuevoDecrementoPre: (identificador) => ({
		tipo: TIPO_OPERACION.DECREMENTO_PRE,
		identificador: identificador
	}),

	nuevoWhile: function (expresion, instrucciones) {
		return {
			tipo: TIPO_INSTRUCCION.WHILE,
			expresion: expresion,
			instrucciones: instrucciones
		};
	},

	nuevoDoWhile: function (instrucciones, expresion) {
		return {
			tipo: TIPO_INSTRUCCION.DOWHILE,
			expresion: expresion,
			instrucciones: instrucciones
		};
	},

	nuevoFor: function (variable, expresion, aumento, instrucciones) {
		return {
			tipo: TIPO_INSTRUCCION.FOR,
			expresion: expresion,
			instrucciones: instrucciones,
			aumento: aumento,
			variable: variable
		}
	},

	nuevaDeclaracion: function (identificador, tipo_dato, tipoVariable) {
		return {
			tipo: TIPO_INSTRUCCION.DECLARACION,
			identificador: identificador,
			tipo_dato: tipo_dato,
			tipoVar: tipoVariable
		}
	},

	nuevaAsignacion: function (identificador, expresion) {
		return {
			tipo: TIPO_INSTRUCCION.ASIGNACION,
			identificador: identificador,
			expresion: expresion,
		}
	},

	nuevaDeclaracionAsignacion: function (identificador, expresion, tipo_dato, tipoVariable) {
		return {
			tipo: TIPO_INSTRUCCION.DECLARACION_ASIGNACION,
			identificador: identificador,
			expresion: expresion,
			tipo_dato: tipo_dato,
			tipoVar: tipoVariable
		}
	},

	nuevoIf: function (expresion, instrucciones) {
		return {
			tipo: TIPO_INSTRUCCION.IF,
			expresion: expresion,
			instrucciones: instrucciones
		}
	},

	//If-Else
	nuevoIfElse: function (expresion, instruccionesIfVerdadero, instruccionesIfFalso) {
		return {
			tipo: TIPO_INSTRUCCION.IF_ELSE,
			expresion: expresion,
			instruccionesIfVerdadero: instruccionesIfVerdadero,
			instruccionesIfFalso: instruccionesIfFalso
		}
	},

	//Else-If
	nuevoElseIf: function (expresion, instruccionesIf, If) {
		return {
			tipo: TIPO_INSTRUCCION.ELSE_IF,
			expresion: expresion,
			instruccionesIf: instruccionesIf,
			if: If
		}
	},

	nuevoSwitch: function (expresion, casos) {
		return {
			tipo: TIPO_INSTRUCCION.SWITCH,
			expresion: expresion,
			casos: casos
		}
	},

	//casos Switch
	nuevoListaCasos: function (caso) {
		var casos = [];
		casos.push(caso);
		return casos;
	},

	//OPCION_SWITCH para una CASE de la sentencia Switch.
	nuevoCaso: function (expresion, instrucciones) {
		return {
			tipo: TIPO_OPCION_SWITCH.CASE,
			expresion: expresion,
			instrucciones: instrucciones
		}
	},

	//OPCION_SWITCH para un DEFAULT de la sentencia Switch.
	nuevoCasoDef: function (instrucciones) {
		return {
			tipo: TIPO_OPCION_SWITCH.DEFAULT,
			instrucciones: instrucciones
		}
	},

	nuevoBreak: () => ({
		tipo: TIPO_INSTRUCCION.BREAK,
	}),

	nuevoContinue: () => ({
		tipo: TIPO_INSTRUCCION.CONTINUE,
	}),

	nuevoReturn: (expresion) => ({
		tipo: TIPO_INSTRUCCION.RETURN,
		expresion: expresion
	}),
	
	nuevoTypeof: (expresion) => ({
		tipo: TIPO_OPERACION.TYPEOF,
		expresion: expresion
	}),

	nuevoMetodo: (tipoReturn, id, parametros, instrucciones) => ({
		tipo: TIPO_INSTRUCCION.DECLARAR_METODO,
		identificador: id,
		parametros: parametros,
		instrucciones:instrucciones, 
		tipoReturn: tipoReturn
	}),

	ejecutarMetodo: (id, parametros) => ({
		tipo: TIPO_INSTRUCCION.EJECUTAR_METODO,
		identificador: id,
		parametrosAsignar: parametros
	}),

	nuevoBloque: (instrucciones) => ({
		tipo: TIPO_INSTRUCCION.NUEVO_BLOQUE,
		instrucciones: instrucciones
	}),

	nuevoTernarioIns: (expresion, instruccionVerdadera, instruccionFalsa) => ({
		tipo: TIPO_INSTRUCCION.TERNARIO_INS,
		expresion:expresion,
		instruccionVerdadera:instruccionVerdadera,
		instruccionFalsa:instruccionFalsa, 
	}),

	nuevoTernarioExp: (expresion, expresionVerdadera, expresionFalsa) => ({
		tipo: TIPO_INSTRUCCION.TERNARIO_EXP,
		expresion:expresion,
		expresionVerdadera: expresionVerdadera,
		expresionFalsa: expresionFalsa, 
	}),
	
	nuevoToLower: (expresion) => ({
		tipo: TIPO_OPERACION.TOLOWER,
		expresion:expresion,
	}),
	
	nuevoToUpper: (expresion) => ({
		tipo: TIPO_OPERACION.TOUPPER,
		expresion:expresion,
	}),
	
	nuevoRound: (expresion) => ({
		tipo: TIPO_OPERACION.ROUND,
		expresion:expresion,
	}),
	
	nuevoLength: (expresion) => ({
		tipo: TIPO_OPERACION.LENGTH,
		expresion:expresion,
	}),

	nuevoVector: (tipo, id, tipo2, expresion, expresion2 ) => ({
		tipo: TIPO_INSTRUCCION.DECLARACION_VECTOR,
		tipo_dato: tipo,
		identificador:id,
		tipo_dato2: tipo2,
		expresion: expresion,
		expresion2: expresion2,
	}),

	nuevoAccesoVector: (id, expresion, expresion2) => ({
		tipo: TIPO_INSTRUCCION.ACCESO_VECTOR,
		identificador:id,
		expresion: expresion,
		expresion2: expresion2,
	}),
	
	nuevoModificarVector: (id, pos1, pos2, expresion) => ({
		tipo: TIPO_INSTRUCCION.MODIFICAR_VECTOR,
		identificador:id,
		pos1: pos1,
		pos2: pos2,
		expresion: expresion
	}),

	nuevoToCharArray: (expresion) => ({
		tipo: TIPO_OPERACION.TO_CHAR_ARRAY,
		expresion: expresion
	}),
	
	nuevoIndexOf: (id, expresion) => ({
		tipo: TIPO_OPERACION.INDEXOF,
		identificador:id,
		expresion: expresion
	}),

	nuevoPush: (id, expresion) => ({
		tipo: TIPO_INSTRUCCION.PUSH,
		identificador:id,
		expresion: expresion
	}),

	nuevoPop: (id) => ({
		tipo: TIPO_INSTRUCCION.POP,
		identificador:id,
	}),

	nuevoSplice: (id, pos, valor) => ({
		tipo: TIPO_INSTRUCCION.SPLICE,
		identificador:id,
		pos: pos,
		valor: valor
	}),

	nuevoGraficarTs: () => ({
		tipo: TIPO_INSTRUCCION.GRAFICAR_TS,
	}),
}

const listaErrores = []
module.exports.TIPO_OPERACION = TIPO_OPERACION;
module.exports.TIPO_INSTRUCCION = TIPO_INSTRUCCION;
module.exports.TIPO_VALOR = TIPO_VALOR;
module.exports.instrucciones = instrucciones;
module.exports.TIPO_OPCION_SWITCH = TIPO_OPCION_SWITCH;
module.exports.listaErrores = listaErrores;