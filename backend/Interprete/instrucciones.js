const TIPO_VALOR = {
	ENTERO: 'VAL_ENTERO',
	DECIMAL: 'VAL_DECIMAL',
	CADENA: 'VAL_CADENA',
	BOOLEAN: 'VAL_BOOLEAN',
	CARACTER: 'VAL_CARACTER',
	IDENTIFICADOR: 'VAL_IDENTIFICADOR'
}

const TIPO_OPERACION = {
	SUMA: 'OP_SUMA',
	RESTA: 'OP_RESTA',
	MULTIPLICACION: 'OP_MULTIPLICACION',
	DIVISION: 'OP_DIVISION',
	NEGATIVO: 'OP_NEGATIVO',
	MODULO: 'OP_MODULO',
	POTENCIA: 'OP_POTENCIA',

	MAYOR_QUE: 'OP_MAYOR_QUE',
	MENOR_QUE: 'OP_MENOR_QUE',
	MAYOR_IGUAL: 'OP_MAYOR_IGUAL',
	MENOR_IGUAL: 'OP_MENOR_IGUAL',
	IGUAL_IGUAL: 'OP_IGUAL_IGUAL',
	DIFERENTE: 'OP_DIFERENTE',

	AND: 'OP_AND',
	OR: 'OP_OR',
	NOT: 'OP_NOT',
	XOR: 'OP_XOR',

	INCREMENTO_POST: 'OP_INCREMENTO_POST',
	INCREMENTO_PRE: 'OP_INCREMENTO_PRE',
	DECREMENTO_POST: 'OP_DECREMENTO_POST',
	DECREMENTO_PRE: 'OP_DECREMENTO_PRE',

	TYPEOF: "OP_TYPEOF"
};

const TIPO_INSTRUCCION = {
	PRINT: 'INSTR_PRINT',
	PRINTLN: 'INSTR_PRINTLN',
	WHILE: 'INSTR_WHILE',
	DECLARACION: 'INSTR_DECLARACION',
	ASIGNACION: 'INSTR_ASIGNACION',
	DECLARACION_ASIGNACION: 'INSTR_DECLARACION_ASIGNACION',
	IF: 'INSTR_IF',
	IF_ELSE: 'INSTR_IF_ELSE',
	ELSE_IF: 'INSTR_ELSE_IF',
	FOR: 'INSTR_FOR',
	SWITCH: 'INSTR_SWITCH',
	DOWHILE: 'INSTR_DOWHILE',
	BREAK: 'INSTR_BREAK',
	CONTINUE: 'INSTR_CONTINUE',
	DECLARAR_METODO: 'INSTR_DECLAR_METODO',
	EJECUTAR_METODO: 'INSTR_EJECUTAR_METODO'
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
	
	nuevoTypeof: (expresion) => ({
		tipo: TIPO_OPERACION.TYPEOF,
		expresion: expresion
	})
}

module.exports.TIPO_OPERACION = TIPO_OPERACION;
module.exports.TIPO_INSTRUCCION = TIPO_INSTRUCCION;
module.exports.TIPO_VALOR = TIPO_VALOR;
module.exports.instrucciones = instrucciones;
module.exports.TIPO_OPCION_SWITCH = TIPO_OPCION_SWITCH;