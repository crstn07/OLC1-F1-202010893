%{
	const TIPO_OPERACION	= require('../interprete/instrucciones').TIPO_OPERACION;
	const TIPO_VALOR 		= require('../interprete/instrucciones').TIPO_VALOR;
	const TIPO_DATO			= require('../interprete/tablaSimbolos').TIPO_DATO; 
	const TIPO_VARIABLE		= require('../interprete/tablaSimbolos').TIPO_VARIABLE; 
	const instrucciones	    = require('../interprete/instrucciones').instrucciones;
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

":"					return 'DOSPTS';
";"					return 'PTCOMA';
","					return 'COMA';
"{"					return 'LLAVE_ABRE';
"}"					return 'LLAVE_CIERRA';
"("					return 'PAR_ABRE';
")"					return 'PAR_CIERRA';
//"["					return 'CORCHETE_ABRE';
//"]"					return 'CORCHETE_CIERRA';

"++"				return 'INCREMENTO';
"--"				return 'DECREMENTO';
"+"					return 'MAS';
"-"					return 'MENOS';
"**"				return 'POTENCIA';
"*"					return 'POR';
"/"					return 'DIVISION';
"%"					return 'MODULO';

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
.					{ console.error('Este es un error léxico: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column); }

/lex

/* Asociación de operadores y precedencia */
%left 'DOSPTS' 'COMA'
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
	| declaracion_asignacion
	| if				
	| SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE casos LLAVE_CIERRA	{ $$ = instrucciones.nuevoSwitch($3,$6);}
	| WHILE PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE instrucciones LLAVE_CIERRA { $$ = instrucciones.nuevoWhile($3, $6); }
	| DO LLAVE_ABRE instrucciones LLAVE_CIERRA WHILE PAR_ABRE expresion PAR_CIERRA PTCOMA { $$ = instrucciones.nuevoDoWhile($3, $7); }	
	| FOR PAR_ABRE declaracion_asignacion expresion PTCOMA asignacion PAR_CIERRA statement 
		{ $$ = instrucciones.nuevoFor($3,$4,$6,$8) } 
	| break
	| continue
	| VOID IDENTIFICADOR params statement 		{ $$ = instrucciones.nuevoMetodo($2,$3,$4);}
	| CALL IDENTIFICADOR PAR_ABRE identificadores PAR_CIERRA PTCOMA { $$ = instrucciones.ejecutarMetodo($2,$4);}
	| CALL IDENTIFICADOR PAR_ABRE PAR_CIERRA PTCOMA				   { $$ = instrucciones.ejecutarMetodo($2,[]);}
	| error { console.error('Este es un error sintáctico: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column); }
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
// DECLARACION Y ASIGNACION
declaracion_asignacion
	: declaracion        { $$ = $1; }
	| asignacion PTCOMA  { $$ = $1; }
;
declaracion
	: tipo identificadores PTCOMA						{ $$ = instrucciones.nuevaDeclaracion($2, $1, TIPO_VARIABLE.VARIABLE); }
	| tipo identificadores IGUAL expresion PTCOMA		{ $$ = instrucciones.nuevaDeclaracionAsignacion($2, $4, $1, TIPO_VARIABLE.VARIABLE); }
	| CONST tipo identificadores PTCOMA						{ $$ = instrucciones.nuevaDeclaracion($3, $2, TIPO_VARIABLE.CONSTANTE); }
	| CONST tipo identificadores IGUAL expresion PTCOMA		{ $$ = instrucciones.nuevaDeclaracionAsignacion($3, $5, $2, TIPO_VARIABLE.CONSTANTE); }
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
;

