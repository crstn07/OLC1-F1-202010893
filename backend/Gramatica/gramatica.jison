%{
	const TIPO_OPERACION	= require('../interprete/instrucciones').TIPO_OPERACION;
	const TIPO_VALOR 		= require('../interprete/instrucciones').TIPO_VALOR;
	const TIPO_DATO			= require('../interprete/tablaSimbolos').TIPO_DATO; 
	const TIPO_VARIABLE		= require('../interprete/tablaSimbolos').TIPO_VARIABLE; 
	const instrucciones	    = require('../interprete/instrucciones').instrucciones;
	var listaErrores 		= require('../interprete/instrucciones').listaErrores;
%}

%lex

%options case-insensitive

%%

\s+											// Ignora espacios en blanco
[/][/].*								    // Comentario de línea
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]			// Comentario multilínea

"int"				return 'INT';
"double"			return 'DOUBLE';
"boolean"			return 'BOOLEAN';
"string"			return 'STRING';
"char"				return 'CHAR';
"true"				return 'TRUE';
"false"				return 'FALSE';

"print"				return 'PRINT';
"println"			return 'PRINTLN';
"if"				return 'IF';
"else"				return 'ELSE';
"for"				return 'FOR';
"switch"			return 'SWITCH';
"case"				return 'CASE';
"default"			return 'DEFAULT';
"do"				return 'DO';
"while"				return 'WHILE';
"break"				return 'BREAK';
"continue"			return 'CONTINUE';
"return"			return 'RETURN';
"void"				return 'VOID';
"typeof"			return 'TYPEOF';
"call"				return 'CALL';
"const"				return 'CONST';
"tolower"			return 'TOLOWER';
"toupper"			return 'TOUPPER';
"round"				return 'ROUND';
"length"			return 'LENGTH';
"new"				return 'NEW';
"tochararray"		return 'TO_CHAR_ARRAY';
"indexof"			return 'INDEXOF';
"push"				return 'PUSH';
"pop"				return 'POP';
"splice"			return 'SPLICE';
"graficar_ts();"	return 'GRAFICAR_TS';

"."					return 'PUNTO';
":"					return 'DOSPTS';
";"					return 'PTCOMA';
","					return 'COMA';
"{"					return 'LLAVE_ABRE';
"}"					return 'LLAVE_CIERRA';
"("					return 'PAR_ABRE';
")"					return 'PAR_CIERRA';
"["					return '[';
"]"					return ']';

"++"				return 'INCREMENTO';
"--"				return 'DECREMENTO';
"+"					return 'MAS';
"-"					return 'MENOS';
"**"				return 'POTENCIA';
"*"					return 'POR';
"/"					return 'DIVISION';
"%"					return 'MODULO';
"?"					return 'INTERROGACION';

"=="				return 'IGUALIGUAL';
"="					return 'IGUAL';
"<="				return 'MENORIGUAL';
"<"					return 'MENOR';
"!="				return 'DIFERENTE';
">="				return 'MAYORIGUAL';
">"					return 'MAYOR';


"||"				return 'OR';
"&&"				return 'AND';
"^" 				return 'XOR';
"!"					return 'NOT';

\"(\\\"|[^\"])*\"                                     { yytext = yytext.substr(1,yyleng-2); return 'CADENA'; }
\'\\\'\'|\'([^\']|\\t|\\n|\\\\|\\r|\\\")\'            { yytext = yytext.substr(1,yyleng-2); return 'CARACTER';}

[0-9]+"."[0-9]+\b  		return 'DECIMAL';
[0-9]+\b				return 'ENTERO';
([a-zA-Z])[a-zA-Z0-9_]*	return 'IDENTIFICADOR';

<<EOF>>				return 'EOF';
.					{ 
	//console.error('Este es un error léxico: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column); 
	listaErrores.push({
		tipo:"LEXICO",
		linea:yylloc.first_line,
		columna:yylloc.first_column,
		mensaje:'>>ERROR LEXICO: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column
		})
	}
/lex

/* Asociación de operadores y precedencia */
%left 'DOSPTS' 'COMA' , 'INTERROGACION'
%left 'OR'
%left 'AND'
%left 'XOR'
%nonassoc 'DIFERENTE' 'IGUALIGUAL' 'MENORIGUAL' 'MAYORIGUAL' 'MENOR' 'MAYOR'
%left 'MAS' 'MENOS'
%left 'POR' 'DIVISION' 'MODULO'
%nonassoc 'POTENCIA' 
%right 'NOT'
%left UMENOS

%start ini

%% 

ini
	: instrucciones EOF {
		return $1;
	}
;

instrucciones
	: instrucciones instruccion 	{ $1.push($2); $$ = $1; }
	| instruccion					{ $$ = [$1]; }
;

instruccion
	//PRINT
	: PRINT PAR_ABRE expresion PAR_CIERRA PTCOMA	{ $$ = instrucciones.nuevoPrint($3); }
	| PRINTLN PAR_ABRE expresion PAR_CIERRA PTCOMA	{ $$ = instrucciones.nuevoPrintln($3); }
	| tipo IDENTIFICADOR '[' ']' '[' ']' IGUAL NEW tipo '[' expresion ']' '[' expresion ']' PTCOMA { $$ = instrucciones.nuevoVector($1,$2,$9,$11,$14); }
	| tipo IDENTIFICADOR '[' ']' IGUAL NEW tipo '[' expresion ']' PTCOMA { $$ = instrucciones.nuevoVector($1,$2,$7,$9); }
	| tipo IDENTIFICADOR '[' ']' '[' ']' IGUAL vector PTCOMA  { $$ = instrucciones.nuevoVector($1,$2,undefined,$8,undefined); }
	| tipo IDENTIFICADOR '[' ']' IGUAL vector PTCOMA  { $$ = instrucciones.nuevoVector($1,$2,undefined,$6); }
	| tipo IDENTIFICADOR '[' ']' IGUAL expresion PTCOMA  { $$ = instrucciones.nuevoVector($1,$2,undefined,$6); }
	| IDENTIFICADOR '[' expresion ']' '[' expresion ']' IGUAL expresion PTCOMA  { $$ = instrucciones.nuevoModificarVector($1,$3,$6,$9); }
	| IDENTIFICADOR '[' expresion ']' IGUAL expresion PTCOMA  { $$ = instrucciones.nuevoModificarVector($1,$3,undefined,$6); }
	| IDENTIFICADOR PUNTO PUSH expresion PTCOMA { $$ = instrucciones.nuevoPush($1,$4); }
	| IDENTIFICADOR PUNTO POP PAR_ABRE PAR_CIERRA PTCOMA { $$ = instrucciones.nuevoPop($1); }
	| IDENTIFICADOR PUNTO SPLICE PAR_ABRE expresion COMA expresion PAR_CIERRA PTCOMA { $$ = instrucciones.nuevoSplice($1,$5,$7); }
	| declaracion_asignacion PTCOMA
	| if				
	| SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE casos LLAVE_CIERRA	{ $$ = instrucciones.nuevoSwitch($3,$6);}
	| WHILE PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE instrucciones LLAVE_CIERRA { $$ = instrucciones.nuevoWhile($3, $6); }
	| DO LLAVE_ABRE instrucciones LLAVE_CIERRA WHILE PAR_ABRE expresion PAR_CIERRA PTCOMA { $$ = instrucciones.nuevoDoWhile($3, $7); }	
	| FOR PAR_ABRE declaracion_asignacion PTCOMA expresion PTCOMA asignacion PAR_CIERRA statement 
		{ $$ = instrucciones.nuevoFor($3,$5,$7,$9) } 
	| break
	| continue
	| return
	| VOID IDENTIFICADOR params statement 		{ $$ = instrucciones.nuevoMetodo("VOID",$2,$3,$4);}
	| tipo IDENTIFICADOR params statement 		{ $$ = instrucciones.nuevoMetodo($1,$2,$3,$4);}
	| CALL IDENTIFICADOR PAR_ABRE parametros_asignar PAR_CIERRA PTCOMA { $$ = instrucciones.ejecutarMetodo($2,$4);}
	| statement 		{ $$ = instrucciones.nuevoBloque($1); }
	| ternario instruccion_ternario DOSPTS instruccion_ternario PTCOMA { $$ = instrucciones.nuevoTernarioIns($1,[$2],[$4]); }
	| GRAFICAR_TS { $$ = instrucciones.nuevoGraficarTs(); }
 	| error {  console.error('Este es un error sintáctico: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column); 
			listaErrores.push({
				tipo: "SINTACTICO",
				linea: this._$.first_line,
				columna: this._$.first_column,
				mensaje: '>>ERROR SINTACTICO: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column
			});
	}
;

vector
	: '[' valoresVector ']' { $$ = $2;}
;
valoresVector
	: valoresVector COMA expresion 	{ $1.push($3); $$ = $1;}
	| valoresVector COMA vector 	{ $1.push($3); $$ = $1;}
	| expresion  	{ $$ = [$1]; }
	| vector		{ $$ = [$1]; }
;
instruccion_ternario
	: PRINT PAR_ABRE expresion PAR_CIERRA 	{ $$ = instrucciones.nuevoPrint($3); }
	| PRINTLN PAR_ABRE expresion PAR_CIERRA	{ $$ = instrucciones.nuevoPrintln($3); } 
	| asignacion			 				{ $$ = $1; }
	| CALL IDENTIFICADOR PAR_ABRE parametros_asignar PAR_CIERRA  { $$ = instrucciones.ejecutarMetodo($2,$4);}
;
identificadores
	: identificadores COMA IDENTIFICADOR  	{$1.push($3); $$=$1;}
	| IDENTIFICADOR							{$$=[$1]}
;
params
	: PAR_ABRE parametros PAR_CIERRA 	{ $$ = $2; }
	| PAR_ABRE PAR_CIERRA				{ $$ = []; }
;
parametros
	: parametros COMA tipo IDENTIFICADOR		{ $1.push({tipo:$3,identificador:$4}); $$=$1; }
	| tipo IDENTIFICADOR						{ $$ = [{tipo:$1,identificador:$2}]; }
;
parametros_asignar
	: parametros_asignar COMA expresion		{ $1.push($3); $$=$1; }
	| expresion								{ $$ = [$1]; }
	| 										{ $$ = []; }
;
tipo
	: INT 		{ $$ = 'INT'; }
	| DOUBLE 	{ $$ = 'DOUBLE'; }
	| STRING	{ $$ = 'STRING'; }
	| CHAR		{ $$ = 'CHAR'; }
	| BOOLEAN	{ $$ = 'BOOLEAN'; }
;
if
	: IF expresion statement                { $$ = instrucciones.nuevoIf($2, $3); }
	| IF expresion statement ELSE if        { $$ = instrucciones.nuevoElseIf($2, $3, $5); }
	| IF expresion statement ELSE statement { $$ = instrucciones.nuevoIfElse($2, $3, $5); }
    | IF expresion instruccion 		        { $$ = instrucciones.nuevoIf($2, [$3]); }
	| IF expresion instruccion ELSE if      { $$ = instrucciones.nuevoElseIf($2, [$3], $5); }
	| IF expresion instruccion ELSE instruccion     { $$ = instrucciones.nuevoIfElse($2, [$3], [$5]); } 
;

statement
    : LLAVE_ABRE instrucciones LLAVE_CIERRA     { $$ = $2; }
    | LLAVE_ABRE LLAVE_CIERRA					{ $$ = []; }
	//| instruccion								{ $$ = $1; }	
;

casos 
	: casos caso {  $1.push($2); $$ = $1;}
  	| caso { $$ = instrucciones.nuevoListaCasos($1);}
;

caso 
	: CASE expresion DOSPTS instrucciones { $$ = instrucciones.nuevoCaso($2,$4); }
	| DEFAULT DOSPTS instrucciones { $$ = instrucciones.nuevoCasoDef($3); }
;

break
	: BREAK PTCOMA { $$ = instrucciones.nuevoBreak()}
	| {}
;
continue
	: CONTINUE PTCOMA { $$ = instrucciones.nuevoContinue()}
	| {}
;
return
	: RETURN PTCOMA { $$ = instrucciones.nuevoReturn(); }
	| RETURN expresion PTCOMA { $$ = instrucciones.nuevoReturn($2); }
	| {}
;
// DECLARACION Y ASIGNACION
declaracion_asignacion
	: declaracion        { $$ = $1; }
	| asignacion 		 { $$ = $1; }
;
declaracion
	: tipo identificadores						{ $$ = instrucciones.nuevaDeclaracion($2, $1, TIPO_VARIABLE.VARIABLE); }
	| tipo identificadores IGUAL expresion 		{ $$ = instrucciones.nuevaDeclaracionAsignacion($2, $4, $1, TIPO_VARIABLE.VARIABLE); }
	| CONST tipo identificadores 						{ $$ = instrucciones.nuevaDeclaracion($3, $2, TIPO_VARIABLE.CONSTANTE); }
	| CONST tipo identificadores IGUAL expresion		{ $$ = instrucciones.nuevaDeclaracionAsignacion($3, $5, $2, TIPO_VARIABLE.CONSTANTE); }
;
asignacion
	: IDENTIFICADOR IGUAL expresion				{ $$ = instrucciones.nuevaAsignacion($1, $3); } 
	//Incremento y Decremento - PENDIENTE
	| incremento					{ $$ = $1; } 
	| decremento					{ $$ = $1; } 
;
incremento
	: IDENTIFICADOR INCREMENTO		{ $$ = instrucciones.nuevoIncrementoPost($1);}
	| INCREMENTO IDENTIFICADOR 		{ $$ = instrucciones.nuevoIncrementoPre($2);}
;					
decremento
	: IDENTIFICADOR DECREMENTO		{ $$ = instrucciones.nuevoDecrementoPost($1);}
	| DECREMENTO IDENTIFICADOR		{ $$ = instrucciones.nuevoDecrementoPre($2);}
;
ternario
	: expresion INTERROGACION { $$ = $1; }
;
expresion
	//Expresion Aritmetica
	: MENOS expresion %prec UMENOS					{ $$ = instrucciones.nuevaOperacionUnaria($2, TIPO_OPERACION.NEGATIVO); }
	| expresion MAS expresion						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.SUMA); }
	| expresion MENOS expresion						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.RESTA); }
	| expresion POR expresion						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MULTIPLICACION); }
	| expresion DIVISION expresion					{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.DIVISION); }
	| expresion POTENCIA expresion					{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.POTENCIA); }
	| expresion MODULO expresion					{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MODULO); }
	| PAR_ABRE expresion PAR_CIERRA					{ $$ = $2; }
	| ENTERO										{ $$ = instrucciones.nuevoValor(Number($1), TIPO_VALOR.ENTERO); }
	| DECIMAL										{ $$ = instrucciones.nuevoValor(Number($1), TIPO_VALOR.DECIMAL); }
	| TRUE											{ $$ = instrucciones.nuevoValor(true, TIPO_VALOR.BOOLEAN); }
	| FALSE											{ $$ = instrucciones.nuevoValor(false, TIPO_VALOR.BOOLEAN); }
	| CADENA										{ $$ = instrucciones.nuevoValor($1, TIPO_VALOR.CADENA); }
	| CARACTER										{ $$ = instrucciones.nuevoValor($1, TIPO_VALOR.CARACTER); } 
	| IDENTIFICADOR									{ $$ = instrucciones.nuevoValor($1, TIPO_VALOR.IDENTIFICADOR); }
	//Expresion Relacional
	| expresion MAYOR expresion						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MAYOR_QUE); }
	| expresion MENOR expresion						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MENOR_QUE); }
	| expresion MAYORIGUAL expresion				{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MAYOR_IGUAL); }
	| expresion MENORIGUAL expresion				{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.MENOR_IGUAL); }
	| expresion IGUALIGUAL expresion				{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.IGUAL_IGUAL); }
	| expresion DIFERENTE expresion					{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.DIFERENTE); }
	//Expresion Logica
	| expresion AND expresion     					{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.AND); }
	| expresion OR expresion 						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.OR); }
	| expresion XOR expresion 						{ $$ = instrucciones.nuevaOperacionBinaria($1, $3, TIPO_OPERACION.XOR); }
    | NOT expresion 								{ $$ = instrucciones.nuevaOperacionUnaria($2, TIPO_OPERACION.NOT); }
	| TYPEOF PAR_ABRE expresion PAR_CIERRA 			{ $$ = instrucciones.nuevoTypeof($3); }
	//Incremento y Decremento - PENDIENTE
	| incremento  									{ $$ = $1; }
	| decremento 									{ $$ = $1; }
	//| expresion MAS MAS			{ $$ = instrucciones.nuevoIncrementoPost($1);}
	//| MAS MAS expresion 		{ $$ = instrucciones.nuevoIncrementoPre($3);}
	//| expresion MENOS MENOS		{ $$ = instrucciones.nuevoDecrementoPost($1);}
	//| MENOS MENOS expresion		{ $$ = instrucciones.nuevoDecrementoPre($3);}
	| IDENTIFICADOR PAR_ABRE parametros_asignar PAR_CIERRA { $$ = instrucciones.ejecutarMetodo($1,$3);}
	| ternario expresion DOSPTS expresion 	{ $$ = instrucciones.nuevoTernarioExp($1,$2,$4); }
	| TOLOWER PAR_ABRE expresion PAR_CIERRA { $$ = instrucciones.nuevoToLower($3); }
	| TOUPPER PAR_ABRE expresion PAR_CIERRA { $$ = instrucciones.nuevoToUpper($3); }
	| ROUND PAR_ABRE expresion PAR_CIERRA 	{ $$ = instrucciones.nuevoRound($3); }
	| LENGTH PAR_ABRE expresion	PAR_CIERRA 	{ $$ = instrucciones.nuevoLength($3); }
	| IDENTIFICADOR '[' expresion ']' 		{ $$ = instrucciones.nuevoAccesoVector($1,$3); }
	| IDENTIFICADOR '[' expresion ']' '[' expresion ']' 	{ $$ = instrucciones.nuevoAccesoVector($1,$3,$6); }
	| TO_CHAR_ARRAY PAR_ABRE expresion PAR_CIERRA 			{ $$ = instrucciones.nuevoToCharArray($3); }
	| IDENTIFICADOR PUNTO INDEXOF PAR_ABRE expresion PAR_CIERRA  { $$ = instrucciones.nuevoIndexOf($1,$5); }
	| IDENTIFICADOR PUNTO PUSH PAR_ABRE expresion PAR_CIERRA { $$ = instrucciones.nuevoPush($1,$5); }
;

