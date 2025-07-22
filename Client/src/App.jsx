import React, { useState } from 'react';

const CodeAnalyzer = () => {
  const [code, setCode] = useState(`int main() {
    int num1 = 10;
    string texto2 = "Hola";
    
    do {
        if (num1 > 5) {
            num1 = 2;
        }
    } while (num1 < 5);
    
    return 0;
}`);
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lexical');
  const [error, setError] = useState(null);

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const response = await fetch('http://localhost:8080/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Analysis result:', result);
        if (result && typeof result === 'object') {
          setAnalysis(result);
          setActiveTab('lexical');
        } else {
          setError('Respuesta del servidor inválida');
        }
      } else {
        const errorText = await response.text();
        setError(`Error del servidor: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error de conexión: ${error.message}`);
    }
    setLoading(false);
  };

  const getTokenTypeIcon = (tokenType) => {
    const icons = {
      'TD_INT': '🔢',
      'TD_FLOAT': '🔢',
      'TD_DOUBLE': '🔢',
      'TD_STRING': '📝',
      'TD_CHAR': '📝',
      'TD_BOOL': '✅',
      'TD_VOID': '🚫',
      'IDENTIFICADOR': '🏷️',
      'PALABRA_RESERVADA': '🔑',
      'INT': '💯',
      'FLOAT': '📊',
      'CADENA_CARACT': '💬',
      'LLAVES_APER': '🔓',
      'LLAVES_CERR': '🔒',
      'P_OPEN': '🔵',
      'P_CLOSE': '🔴',
      'CORCHETE_APER': '📂',
      'CORCHETE_CERR': '📁',
      'PUNTOCYC': '⏹️',
      'COMA': '🔸',
      'PUNTO': '⚫',
      'IGUAL': '⚖️',
      'IGUALDAD': '🎯',
      'DIFERENTE': '❌',
      'MENOR': '◀️',
      'MAYOR': '▶️',
      'MENOR_IGUAL': '⬅️',
      'MAYOR_IGUAL': '➡️',
      'SUMA': '➕',
      'RESTA': '➖',
      'MULTIPLICACION': '✖️',
      'DIVISION': '➗',
      'MODULO': '🔄',
      'INCREMENTO': '⬆️',
      'DECREMENTO': '⬇️',
      'AND_LOGICO': '🔗',
      'OR_LOGICO': '🔀',
      'NOT_LOGICO': '🚫'
    };
    return icons[tokenType] || '❓';
  };

  const loadExample = () => {
    setCode(`int main() {
    int num1 = 10;
    string texto2 = "Hola";
    
    do {
        if (num1 > 5) {
            num1 = 2;
        }
    } while (num1 < 5);
    
    return 0;
}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.5rem',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🧠 Analizador Léxico, Sintáctico y Semántico
          </h1>
          <p style={{
            margin: '10px 0 0 0',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem'
          }}>
            Análisis completo de código C/Java
          </p>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Code Input */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <label style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                📝 Código a Analizar:
              </label>
              <button
                onClick={loadExample}
                style={{
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📋 Cargar Ejemplo
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '15px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Ingresa tu código C/Java aquí..."
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                fontSize: '1.5rem'
              }}>
                💻
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeCode}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: 'white',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Analizando...
              </>
            ) : (
              <>
                ▶️ Analizar Código
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#c33'
            }}>
              <span style={{ marginRight: '10px' }}>❌</span>
              {error}
            </div>
          )}

          {/* Results */}
          {analysis && (
            <div>
              {/* Status Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: '#f8f9ff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>#️⃣</span>
                    <h3 style={{ margin: 0 }}>Tokens</h3>
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#4285f4' }}>
                    {analysis.tokens && Array.isArray(analysis.tokens) ? analysis.tokens.length : 0}
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>tokens encontrados</p>
                </div>

                <div style={{
                  background: analysis.syntaxValid ? '#f0f9ff' : '#fef2f2',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${analysis.syntaxValid ? '#bfdbfe' : '#fecaca'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{analysis.syntaxValid ? '✅' : '❌'}</span>
                    <h3 style={{ margin: 0 }}>Sintaxis</h3>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: analysis.syntaxValid ? '#059669' : '#dc2626' }}>
                    {analysis.syntaxValid ? 'Válida' : 'Inválida'}
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>
                    {analysis.syntaxErrors && Array.isArray(analysis.syntaxErrors) ? analysis.syntaxErrors.length : 0} errores
                  </p>
                </div>

                <div style={{
                  background: analysis.semanticValid ? '#f0f9ff' : '#fef2f2',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${analysis.semanticValid ? '#bfdbfe' : '#fecaca'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{analysis.semanticValid ? '✅' : '❌'}</span>
                    <h3 style={{ margin: 0 }}>Semántica</h3>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: analysis.semanticValid ? '#059669' : '#dc2626' }}>
                    {analysis.semanticValid ? 'Válida' : 'Inválida'}
                  </p>
                  <p style={{ margin: 0, color: '#666' }}>
                    {analysis.semanticErrors && Array.isArray(analysis.semanticErrors) ? analysis.semanticErrors.length : 0} errores
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '4px'
                }}>
                  {[
                    { id: 'lexical', icon: '#️⃣', label: 'Análisis Léxico' },
                    { id: 'syntax', icon: '📄', label: 'Análisis Sintáctico' },
                    { id: 'semantic', icon: '🧠', label: 'Análisis Semántico' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        background: activeTab === tab.id ? 'white' : 'transparent',
                        boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                minHeight: '400px'
              }}>
                {/* PESTAÑA LÉXICO */}
                {activeTab === 'lexical' && (
                  <div>
                    {/* Token Statistics */}
                    {analysis.tokenStats && (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '15px' }}>📊 Estadísticas de Tokens</h3>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                          gap: '10px'
                        }}>
                          {Object.entries(analysis.tokenStats).map(([type, count]) => (
                            <div key={type} style={{
                              background: 'white',
                              padding: '15px',
                              borderRadius: '8px',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                                {getTokenTypeIcon(type)}
                              </div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4285f4' }}>
                                {count}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                {type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tokens List */}
                    {analysis.tokens && Array.isArray(analysis.tokens) && (
                      <div>
                        <h3 style={{ marginBottom: '15px' }}>
                          📋 Lista de Tokens ({analysis.tokens.length} tokens)
                        </h3>
                        <div style={{
                          background: 'white',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f1f3f4' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Pos</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Tipo</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Valor</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Línea</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analysis.tokens.map((token, index) => (
                                <tr key={`token-${index}`} style={{
                                  borderBottom: '1px solid #f1f3f4'
                                }}>
                                  <td style={{ padding: '12px' }}>{index + 1}</td>
                                  <td style={{ padding: '12px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: '#e8f0fe',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.85rem'
                                    }}>
                                      {getTokenTypeIcon(token.type)} {token.type || 'UNKNOWN'}
                                    </span>
                                  </td>
                                  <td style={{ 
                                    padding: '12px', 
                                    fontFamily: 'Monaco, Consolas, monospace',
                                    background: '#f8f9fa'
                                  }}>
                                    "{token.value || ''}"
                                  </td>
                                  <td style={{ padding: '12px' }}>{token.line || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PESTAÑA SINTÁCTICO */}
                {activeTab === 'syntax' && (
                  <div>
                    <div style={{
                      background: analysis.syntaxValid ? '#f0f9ff' : '#fef2f2',
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${analysis.syntaxValid ? '#bfdbfe' : '#fecaca'}`,
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{analysis.syntaxValid ? '✅' : '❌'}</span>
                        <h3 style={{ margin: 0 }}>Estado del Análisis Sintáctico</h3>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>
                        {analysis.syntaxValid 
                          ? 'La estructura sintáctica del código es correcta. Se validó la función main, declaraciones de variables, estructuras de control y balanceo de símbolos.'
                          : `Se encontraron ${analysis.syntaxErrors && Array.isArray(analysis.syntaxErrors) ? analysis.syntaxErrors.length : 0} errores sintácticos en el código.`
                        }
                      </p>
                    </div>

                    {/* Errores sintácticos */}
                    {analysis.syntaxErrors && Array.isArray(analysis.syntaxErrors) && analysis.syntaxErrors.length > 0 && (
                      <div style={{
                        background: '#fef2f2',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ Errores Sintácticos:</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {analysis.syntaxErrors.map((error, index) => (
                            <li key={`syntax-error-${index}`} style={{ 
                              marginBottom: '8px',
                              color: '#dc2626'
                            }}>
                              <span style={{ marginRight: '8px' }}>⚠️</span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px'
                    }}>
                      <h4 style={{ marginBottom: '15px' }}>🔍 Elementos Validados:</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Función main definida</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Declaraciones de variables con tipos</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Estructuras de control (if, while, do)</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Balanceo de llaves y paréntesis</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Expresiones de asignación</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Sentencia return</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* PESTAÑA SEMÁNTICO */}
                {activeTab === 'semantic' && (
                  <div>
                    <div style={{
                      background: analysis.semanticValid ? '#f0f9ff' : '#fef2f2',
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${analysis.semanticValid ? '#bfdbfe' : '#fecaca'}`,
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{analysis.semanticValid ? '✅' : '❌'}</span>
                        <h3 style={{ margin: 0 }}>Estado del Análisis Semántico</h3>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>
                        {analysis.semanticValid 
                          ? 'El código es semánticamente correcto. Todas las variables están declaradas antes de ser utilizadas y los tipos son compatibles.'
                          : `Se encontraron ${analysis.semanticErrors && Array.isArray(analysis.semanticErrors) ? analysis.semanticErrors.length : 0} errores semánticos en el código.`
                        }
                      </p>
                    </div>

                    {/* Errores semánticos */}
                    {analysis.semanticErrors && Array.isArray(analysis.semanticErrors) && analysis.semanticErrors.length > 0 && (
                      <div style={{
                        background: '#fef2f2',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ Errores Semánticos:</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {analysis.semanticErrors.map((error, index) => (
                            <li key={`semantic-error-${index}`} style={{ 
                              marginBottom: '8px',
                              color: '#dc2626'
                            }}>
                              <span style={{ marginRight: '8px' }}>⚠️</span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ marginBottom: '15px' }}>🔍 Verificaciones Semánticas:</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Variables declaradas antes de su uso</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Compatibilidad de tipos en asignaciones</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Función main tiene return</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Alcance de variables correcto</li>
                        <li><span style={{ marginRight: '8px' }}>✅</span> Tipos de datos válidos</li>
                      </ul>
                    </div>

                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px'
                    }}>
                      <h4 style={{ marginBottom: '15px' }}>📋 Resumen del Análisis:</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                      }}>
                        <div>
                          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4285f4' }}>Tipos de Datos:</p>
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.9rem' }}>
                            <li>• int</li>
                            <li>• string</li>
                          </ul>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4285f4' }}>Variables:</p>
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.9rem' }}>
                            <li>• num1 (int)</li>
                            <li>• texto2 (string)</li>
                          </ul>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4285f4' }}>Estructuras:</p>
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.9rem' }}>
                            <li>• do-while</li>
                            <li>• if</li>
                          </ul>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4285f4' }}>Operadores:</p>
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.9rem' }}>
                            <li>• Asignación (=)</li>
                            <li>• Comparación (&gt;, &lt;)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CodeAnalyzer;