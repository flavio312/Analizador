package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

// Estructuras para el análisis
type Token struct {
	Type    string `json:"type"`
	Value   string `json:"value"`
	Line    int    `json:"line"`
	Column  int    `json:"column"`
}

type AnalysisResult struct {
	Tokens         []Token        `json:"tokens"`
	TokenStats     map[string]int `json:"tokenStats"`
	SyntaxErrors   []string       `json:"syntaxErrors"`
	SemanticErrors []string       `json:"semanticErrors"`
	SyntaxValid    bool           `json:"syntaxValid"`
	SemanticValid  bool           `json:"semanticValid"`
}

// Analizador Léxico
type Lexer struct {
	input    string
	position int
	line     int
	column   int
	tokens   []Token
}

func NewLexer(input string) *Lexer {
	return &Lexer{
		input:  input,
		line:   1,
		column: 1,
		tokens: make([]Token, 0),
	}
}

func (l *Lexer) addToken(tokenType, value string) {
	l.tokens = append(l.tokens, Token{
		Type:   tokenType,
		Value:  value,
		Line:   l.line,
		Column: l.column - len(value),
	})
}

func (l *Lexer) advance() rune {
	if l.position >= len(l.input) {
		return 0
	}
	char := rune(l.input[l.position])
	l.position++
	if char == '\n' {
		l.line++
		l.column = 1
	} else {
		l.column++
	}
	return char
}

func (l *Lexer) peek() rune {
	if l.position >= len(l.input) {
		return 0
	}
	return rune(l.input[l.position])
}

func (l *Lexer) peekByte() byte {
	if l.position >= len(l.input) {
		return 0
	}
	return l.input[l.position]
}

func (l *Lexer) peekNext() rune {
	if l.position+1 >= len(l.input) {
		return 0
	}
	return rune(l.input[l.position+1])
}

func (l *Lexer) skipWhitespace() {
	for l.position < len(l.input) && (l.input[l.position] == ' ' || l.input[l.position] == '\t') {
		l.advance()
	}
}

func (l *Lexer) readIdentifier() string {
	start := l.position
	for l.position < len(l.input) && (isAlphaNumeric(l.input[l.position]) || l.input[l.position] == '_') {
		l.advance()
	}
	return l.input[start:l.position]
}

func (l *Lexer) readNumber() string {
	start := l.position
	for l.position < len(l.input) && isDigit(l.input[l.position]) {
		l.advance()
	}
	// Manejar números decimales
	if l.position < len(l.input) && l.input[l.position] == '.' {
		l.advance()
		for l.position < len(l.input) && isDigit(l.input[l.position]) {
			l.advance()
		}
	}
	return l.input[start:l.position]
}

func (l *Lexer) readString() string {
	quote := l.input[l.position]
	l.advance() // skip opening quote
	start := l.position
	for l.position < len(l.input) && l.input[l.position] != quote {
		if l.input[l.position] == '\\' {
			l.advance() // skip escape character
		}
		l.advance()
	}
	value := l.input[start:l.position]
	if l.position < len(l.input) {
		l.advance() // skip closing quote
	}
	return value
}

func (l *Lexer) tokenize() []Token {
	// Palabras clave y tipos de datos
	keywords := map[string]string{
		"int":    "TD_INT",
		"float":  "TD_FLOAT",
		"double": "TD_DOUBLE",
		"char":   "TD_CHAR",
		"string": "TD_STRING",
		"bool":   "TD_BOOL",
		"void":   "TD_VOID",
		"main":   "IDENTIFICADOR",
		"if":     "PALABRA_RESERVADA",
		"else":   "PALABRA_RESERVADA",
		"while":  "PALABRA_RESERVADA",
		"for":    "PALABRA_RESERVADA",
		"do":     "PALABRA_RESERVADA",
		"return": "PALABRA_RESERVADA",
		"break":  "PALABRA_RESERVADA",
		"continue": "PALABRA_RESERVADA",
	}

	for l.position < len(l.input) {
		l.skipWhitespace()
		
		if l.position >= len(l.input) {
			break
		}

		char := l.input[l.position]

		switch {
		case char == '\n':
			l.advance()
		case char == '{':
			l.advance()
			l.addToken("LLAVES_APER", "{")
		case char == '}':
			l.advance()
			l.addToken("LLAVES_CERR", "}")
		case char == '(':
			l.advance()
			l.addToken("P_OPEN", "(")
		case char == ')':
			l.advance()
			l.addToken("P_CLOSE", ")")
		case char == '[':
			l.advance()
			l.addToken("CORCHETE_APER", "[")
		case char == ']':
			l.advance()
			l.addToken("CORCHETE_CERR", "]")
		case char == ';':
			l.advance()
			l.addToken("PUNTOCYC", ";")
		case char == ',':
			l.advance()
			l.addToken("COMA", ",")
		case char == ':':
			l.advance()
			l.addToken("DOS_PUNTOS", ":")
		case char == '.' && !isDigit(l.peekByte()):
			l.advance()
			l.addToken("PUNTO", ".")
		case char == '+' && l.peekByte() == '+':
			l.advance()
			l.advance()
			l.addToken("INCREMENTO", "++")
		case char == '-' && l.peekByte() == '-':
			l.advance()
			l.advance()
			l.addToken("DECREMENTO", "--")
		case char == '+':
			l.advance()
			l.addToken("SUMA", "+")
		case char == '-':
			l.advance()
			l.addToken("RESTA", "-")
		case char == '*':
			l.advance()
			l.addToken("MULTIPLICACION", "*")
		case char == '/':
			l.advance()
			l.addToken("DIVISION", "/")
		case char == '%':
			l.advance()
			l.addToken("MODULO", "%")
		case char == '=' && l.peekByte() == '=':
			l.advance()
			l.advance()
			l.addToken("IGUALDAD", "==")
		case char == '=' && l.peekByte() != '=':
			l.advance()
			l.addToken("IGUAL", "=")
		case char == '!' && l.peekByte() == '=':
			l.advance()
			l.advance()
			l.addToken("DIFERENTE", "!=")
		case char == '<' && l.peekByte() == '=':
			l.advance()
			l.advance()
			l.addToken("MENOR_IGUAL", "<=")
		case char == '>' && l.peekByte() == '=':
			l.advance()
			l.advance()
			l.addToken("MAYOR_IGUAL", ">=")
		case char == '<':
			l.advance()
			l.addToken("MENOR", "<")
		case char == '>':
			l.advance()
			l.addToken("MAYOR", ">")
		case char == '&' && l.peekByte() == '&':
			l.advance()
			l.advance()
			l.addToken("AND_LOGICO", "&&")
		case char == '|' && l.peekByte() == '|':
			l.advance()
			l.advance()
			l.addToken("OR_LOGICO", "||")
		case char == '!':
			l.advance()
			l.addToken("NOT_LOGICO", "!")
		case char == '"' || char == '\'':
			value := l.readString()
			l.addToken("CADENA_CARACT", value)
		case isDigit(char) || (char == '.' && isDigit(l.peekByte())):
			value := l.readNumber()
			if strings.Contains(value, ".") {
				l.addToken("FLOAT", value)
			} else {
				l.addToken("INT", value)
			}
		case isAlpha(char):
			value := l.readIdentifier()
			tokenType := "IDENTIFICADOR"
			if keywordType, exists := keywords[value]; exists {
				tokenType = keywordType
			}
			l.addToken(tokenType, value)
		default:
			// Caracter no reconocido
			l.advance()
		}
	}

	return l.tokens
}

// Analizador Sintáctico
func analyzeSyntax(tokens []Token, code string) (bool, []string) {
	var errors []string
	
	// Verificar estructura básica del programa
	hasMain := false
	hasOpenBrace := false
	hasCloseBrace := false
	braceCount := 0
	parenCount := 0
	
	for _, token := range tokens {
		switch token.Value {
		case "main":
			hasMain = true
		case "{":
			hasOpenBrace = true
			braceCount++
		case "}":
			hasCloseBrace = true
			braceCount--
		case "(":
			parenCount++
		case ")":
			parenCount--
		}
	}
	
	// Verificaciones sintácticas básicas
	if !hasMain {
		errors = append(errors, "Falta la función 'main'")
	}
	
	if !hasOpenBrace || !hasCloseBrace {
		errors = append(errors, "Faltan llaves de apertura o cierre")
	}
	
	if braceCount != 0 {
		errors = append(errors, "Llaves desbalanceadas")
	}
	
	if parenCount != 0 {
		errors = append(errors, "Paréntesis desbalanceados")
	}
	
	// Verificar declaraciones de variables
	hasProperDeclarations := true
	for i, token := range tokens {
		if isTypeToken(token.Type) {
			if i+1 < len(tokens) && tokens[i+1].Type == "IDENTIFICADOR" {
				// Declaración válida
				continue
			} else {
				hasProperDeclarations = false
				break
			}
		}
	}
	
	if !hasProperDeclarations {
		errors = append(errors, "Declaraciones de variables incorrectas")
	}
	
	return len(errors) == 0, errors
}

// Analizador Semántico
func analyzeSemantic(tokens []Token, code string) (bool, []string) {
	var errors []string
	
	// Tabla de símbolos para variables declaradas
	symbolTable := make(map[string]string)
	
	// Verificar declaración antes del uso
	for i, token := range tokens {
		if isTypeToken(token.Type) && i+1 < len(tokens) {
			// Nueva declaración
			varName := tokens[i+1].Value
			symbolTable[varName] = token.Type
		} else if token.Type == "IDENTIFICADOR" && token.Value != "main" {
			// Uso de variable
			if _, exists := symbolTable[token.Value]; !exists {
				errors = append(errors, fmt.Sprintf("Variable '%s' usada sin declarar", token.Value))
			}
		}
	}
	
	// Verificar asignaciones de tipos compatibles
	for i, token := range tokens {
		if token.Type == "IGUAL" && i > 0 && i < len(tokens)-1 {
			leftVar := tokens[i-1].Value
			if varType, exists := symbolTable[leftVar]; exists {
				// Verificar compatibilidad de tipos (simplificado)
				rightToken := tokens[i+1]
				if !isTypeCompatible(varType, rightToken.Type) {
					errors = append(errors, fmt.Sprintf("Asignación incompatible para variable '%s'", leftVar))
				}
			}
		}
	}
	
	// Verificar que main tenga return (si no es void)
	hasReturn := false
	for _, token := range tokens {
		if token.Value == "return" {
			hasReturn = true
			break
		}
	}
	
	if !hasReturn {
		errors = append(errors, "Función 'main' debería tener una declaración 'return'")
	}
	
	return len(errors) == 0, errors
}

// Funciones auxiliares
func isAlpha(char byte) bool {
	return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
}

func isDigit(char byte) bool {
	return char >= '0' && char <= '9'
}

func isAlphaNumeric(char byte) bool {
	return isAlpha(char) || isDigit(char)
}

func isTypeToken(tokenType string) bool {
	types := []string{"TD_INT", "TD_FLOAT", "TD_DOUBLE", "TD_CHAR", "TD_STRING", "TD_BOOL", "TD_VOID"}
	for _, t := range types {
		if t == tokenType {
			return true
		}
	}
	return false
}

func isTypeCompatible(varType, valueType string) bool {
	// Reglas de compatibilidad simplificadas
	switch varType {
	case "TD_INT":
		return valueType == "INT" || valueType == "TD_INT"
	case "TD_FLOAT", "TD_DOUBLE":
		return valueType == "FLOAT" || valueType == "INT" || valueType == "TD_FLOAT" || valueType == "TD_DOUBLE"
	case "TD_STRING":
		return valueType == "CADENA_CARACT" || valueType == "TD_STRING"
	case "TD_CHAR":
		return valueType == "CADENA_CARACT" || valueType == "TD_CHAR"
	default:
		return true // Permisivo por defecto
	}
}

// Handlers HTTP
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

func analyzeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Code string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	fmt.Printf("📝 Analizando código:\n%s\n", request.Code)

	// Análisis léxico
	lexer := NewLexer(request.Code)
	tokens := lexer.tokenize()

	// Estadísticas de tokens
	tokenStats := make(map[string]int)
	for _, token := range tokens {
		tokenStats[token.Type]++
	}

	// Análisis sintáctico
	syntaxValid, syntaxErrors := analyzeSyntax(tokens, request.Code)

	// Análisis semántico
	semanticValid, semanticErrors := analyzeSemantic(tokens, request.Code)

	fmt.Printf("📊 Resultados: Sintaxis=%v, Semántica=%v\n", syntaxValid, semanticValid)

	result := AnalysisResult{
		Tokens:         tokens,
		TokenStats:     tokenStats,
		SyntaxErrors:   syntaxErrors,
		SemanticErrors: semanticErrors,
		SyntaxValid:    syntaxValid,
		SemanticValid:  semanticValid,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	http.Handle("/analyze", enableCORS(http.HandlerFunc(analyzeHandler)))
	
	fmt.Println("🚀 Servidor corriendo en http://localhost:8080")
	fmt.Println("✨ Analizador léxico, sintáctico y semántico para códigos")
	log.Fatal(http.ListenAndServe(":8080", nil))
}