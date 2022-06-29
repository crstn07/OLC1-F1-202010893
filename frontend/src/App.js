import Editor from '@monaco-editor/react';
import { useRef } from 'react';
//import { ReactComponent as Logo } from '../backend/AST.svg';
import './App.css';

function App() {
  const PORT = 4000;

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function showValue() {
    console.log(editorRef.current.getValue());
  }

  function abrirArchivo(e) {
    var archivo = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(archivo);
    fileReader.addEventListener('load', (e) => {
      editorRef.current.getModel().setValue(fileReader.result);
    });
  }

  function guardarArchivo() {
    let nombreArchivo = 'LFScript.lf'
    var archivo = new Blob([editorRef.current.getValue()], { type: 'text/plain' });
    if (window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(archivo, nombreArchivo);
    else {
      var a = document.createElement("a"),
        url = URL.createObjectURL(archivo);
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  function ejecutar() {
    var txt = {
      'Contenido': editorRef.current.getValue()
    }
    fetch(`http://localhost:${PORT}/analizar`, {
      method: 'POST',
      body: JSON.stringify(txt),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        console.log(response.Salida);
        document.querySelector('#consola').value = response.Salida;
      })
  }

  function AST() {
    fetch(`http://localhost:${PORT}/AST`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        console.log(response);
        document.querySelector('#AST').innerHTML = "<img src=\"AST.svg\">";
      })

  }

  function Errores() {
    fetch(`http://localhost:${PORT}/Errores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        console.log(response.respuesta);
        let listaErrores = []
        listaErrores = response.respuesta
        var datos = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title> REPORTE ERRORES </title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet"
                integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
        </head>
        <body >        
            <div style="position: absolute; width: 98%; left: 1%; top: 20px;">
            <h1 style="margin-bottom: 20px;"> <center> REPORTE DE ERRORES </center></h1>
                <table class="table table-ligth table-striped table-hover table-bordered border-dark">
                    <thead class="table table-dark">
                        <tr>
                            <th scope="col">TIPO</th>
                            <th scope="col">DESCRIPCION</th>
                            <th scope="col">LINEA</th>
                            <th scope="col">COLUMNA</th>
                        </tr>
                    </thead>
                    <tbody>
`
        listaErrores.forEach(error => {
          datos += ` <tr>
  <td scope="col"> ${error.tipo} </td>
  <td scope="col"> ${error.mensaje}</td>
  <td scope="col"> ${error.linea}</td>
  <td scope="col"> ${error.columna}</td>
</tr>`
        });
        datos += `                    </tbody>
</table>
</div>
</body>
</html>`

        var win = window.open('', '', 'height=700,width=750');
        win.document.write(datos);
        win.document.close();
      })

  }

function TS() {
    fetch(`http://localhost:${PORT}/TS`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
      .then(res => res.json())
      .catch(err => {
        console.error('Error:', err)
        alert("Error")
      })
      .then(response => {
        console.log(response.respuesta);
        let tablas = response.respuesta;
        for (const tabla of tablas) {
          let simbolos = []
          simbolos = tabla._simbolos
          let metodos = []
          metodos = tabla._metodos
          var datos = `
          <!DOCTYPE html>
          <html lang="es">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title> Tabla de Simbolos -  ${tabla.nombre} </title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet"
                  integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
          </head>
          <body >        
              <div style="position: absolute; width: 98%; left: 1%; top: 20px;">
              <h1 style="margin-bottom: 20px;"> <center> TABLA DE SIMBOLOS </center></h1>
                  <table class="table table-ligth table-striped table-hover table-bordered border-dark">
                      <thead class="table table-dark">
                          <tr>
                              <th scope="col">ENTORNO</th>
                              <th scope="col">ID</th>
                              <th scope="col">TIPO</th>
                              <th scope="col">TIPO DATO</th>
                              <th scope="col">VALOR</th>
                          </tr>
                      </thead>
                      <tbody>
  `
          simbolos.forEach(simbolo => {
            datos += ` <tr>
    <td scope="col"> ${tabla.nombre} </td>
    <td scope="col"> ${simbolo.id} </td>
    <td scope="col"> ${simbolo.tipoVar}</td>
    <td scope="col"> ${simbolo.tipo}</td>
    <td scope="col"> ${JSON.stringify(simbolo.valor)}</td>
  </tr>`
          });
          metodos.forEach(metodo => {
            let tipo = ""
            if (metodo.tipoReturn === "VOID") {
              tipo = "MÉTODO"
            } else {
              tipo = "FUNCIÓN"
            }
            datos += ` <tr>
    <td scope="col"> ${tabla.nombre} </td>
    <td scope="col"> ${metodo.id} </td>
    <td scope="col"> ${tipo} </td>
    <td scope="col"> ${metodo.tipoReturn}</td>
    <td scope="col"> </td>
  </tr>`
          });
          datos += `                    </tbody>
  </table>
  </div>
  </body>
  </html>`

          var win = window.open('', '', 'height=700,width=850');
          win.document.write(datos);
          win.document.close();
        }        
      })

  }
  return (
    <><nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand" href="">LFScript </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-dark nav-link" type="button" data-bs-toggle="modal" data-bs-target="#cargar"> Abrir Archivo</button>
            </li>
            <li>
              <button className="btn btn-dark nav-link" onClick={guardarArchivo}> Guardar Archivo </button>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle " href="" id="Reportes" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Reportes
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" role="button" onClick={Errores}> Errores</a></li>
                <li><a className="dropdown-item" role="button" onClick={AST}>Generar AST</a></li>
                <li><a className="dropdown-item" role="button" onClick={TS}>Tabla de Símbolos</a></li>
              </ul>
            </li>
            <li>
              <button className="btn btn-primary" type="button" onClick={ejecutar}> Ejecutar </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
      <div className="modal fade" id="cargar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">Cargar Archivo</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <input type="file" className="form-control" aria-label="Upload" accept=".LF" onChange={abrirArchivo} required />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>

      <form id="formEditor">
        <label htmlFor="Entrada" className="form-label titulos">Editor</label>
        <Editor
          height="73vh"
          defaultLanguage="java"
          defaultValue="//Escribir algo"
          onMount={handleEditorDidMount}
          theme="vs-dark" />
      </form>
      <form id="formConsola">
        <label htmlFor="Salida" className="form-label titulos" > Consola </label>
        <textarea className=" form-control" id="consola" wrap="off" readOnly> </textarea>
        <div style={{ marginBottom: '25px' }} ></div>
      </form>

      <div id="AST">

      </div>
    </>

  );
}

export default App;
