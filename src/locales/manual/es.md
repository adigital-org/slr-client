# Manual del Cliente API v.%___PLACEHOLDER_appVersion___%

## 1. El Cliente API

### 1.1 Acerca del Cliente API

El Cliente API es una herramienta de consulta de la Lista Robinson desarrollada por Adigital para las empresas adheridas al Servicio de Lista Robinson. Es una de las tres formas a través de las que una empresa puede consultar la Lista:

1. El Cliente API de Adigital
2. Una herramienta de consulta desarrollada por la propia empresa 
3. Una herramienta de consulta desarrollada por un tercero

El Cliente API te permite comprobar si los ciudadanos a los que tu empresa va a lanzar una acción publicitaria están o no en la Lista Robinson. Está diseñado pensando principalmente en pymes o entidades que no necesiten consultar la Lista Robinson de forma regular y masiva.

### 1.2 Cómo funciona

Para utilizar el Cliente API deberás:

1. Preparar un fichero CSV con los datos que deseas consultar
2. Acceder al Cliente API
2. Seguir los pasos que el Cliente API va marcando
3. Guardar los resultados de la consulta

El fichero CSV con los datos que deseas consultar deberá:
 
- tener los campos separados por comas,
- opcionalmente, con los campos entrecomillados por comillas dobles (" "),
- estar codificado en UTF8,
- utilizar caracteres Unicode compuestos (NFC) válidos (_es el formato más habitual_),
- contener los datos de contacto de los ciudadanos que se quieran consultar en la Lista Robinson, y
- estar estructurado de la forma en la que se especifica más abajo. 

### 1.3 Obtener ayuda del Cliente API

En cada pantalla del Cliente API podrás acceder a la sección de este manual que explica qué debes hacer en ese paso pulsando sobre el botón de ayuda que encontrarás en la parte superior derecha:

![Icono de ayuda](manual-helpicon.39x38.png "Icono de ayuda")

### 1.4 Formas de utilizar el Cliente API

El Cliente API desarrollado por Adigital puede utilizarse de tes maneras:

- **Cliente API para navegador**: directamente desde tu navegador de Internet habitual, sin necesidad de instalar ningún software adicional. **Esta es la versión recomendada para la mayor parte de los usuarios**.
- **Cliente API para escritorio**: descargándola e instalándola en tu equipo. Esta versión es la recomendada para aquellas empresas que necesiten consultar grandes cantidades de datos y que busquen una herramienta sencilla.
- **Cliente API para servidor**: descargando y ejecutando el archivo binario. Esta versión es la recomendada para administradores de IT que deseen automatizar por completo el proceso.

El funcionamiento del Cliente API para escritorio es el mismo que el de la versión para navegador, pero tiene algunas ventajas que pueden ser útiles para algunas empresas:

- es más rápida consultando la Lista Robinson, y
- puede procesar ficheros CSV de cualquier tamaño, no existiendo el límite de 500.000 registros por fichero CSV que tiene la versión para navegador.

Para tu comodidad, **te recomendamos que utilices el Cliente API para navegador**. No obstante, si necesitas procesar ficheros de más de 500.000 registros, puedes descargar e instalar la versión de escritorio.

El Cliente API para servidor está pensada para administradores de IT y permite automatizar el proceso de consulta por completo. Funciona sin interfaz gráfica, a través de línea de comandos (_CLI_), por lo que es la forma más adecuada para utilizar en un servidor. Permite consultar la Lista Robinson de forma más rápida, no tiene el límite de 500.000 registros por fichero CSV, consume menos recursos del sistema y no requiere instalación, se trata de un archivo binario ejecutable con todas las dependencias incluidas. 
 

### 1.5 Requisitos técnicos mínimos para usar el Cliente API

Para utilizar el Cliente API, se recomienda:

Cliente API para navegador:

- Google Chrome versión >71 o Mozilla Firefox >65.
- 4GB de memoria RAM.
- Conexión de red sin interrupciones.

El número máximo de registros por fichero CSV depende de las características técnicas de tu ordenador. Por lo general, no se recomienda procesar ficheros de más de 500.000 registros. Si el Cliente API se queda sin memoria durante el procesamiento del fichero, los resultados obtenidos se perderán y las consultas habrán sido computadas igualmente, pudiendo derivar en costes adicionales.

Cliente API para escritorio:

- Windows o Linux
- 2GB de RAM
- 800mb de espacio de almacenamiento libre para la instalación de la aplicación

En la versión para escritorio no hay limitaciones de tamaño del fichero CSV, pero ten en cuenta que para utilizar esta versión tendrás que descargar la herramienta y actualizarla periódicamente. Si deseas utilizar esta versión, consúltalo primero con el departamento técnico de tu empresa.

Cliente API para servidor:

- Windows o Linux (x64)
- 200mb de espacio de almacenamiento libre
- 512MB de RAM

Por lo general, se necesitan aproximadamente 250mb de memoria RAM libre por cada núcleo de la CPU. No obstante, mediante los parámetros de ejecución pueden (_linesPerTask_ y _maxCoresToUse_) limitarse los recursos del sistema a consumir, por lo que puede ejecutarse en sistemas con pocos recursos.

<a name='login-help-placeholder'>

## 2. Cómo iniciar sesión en el Cliente API

Para iniciar sesión y acceder al Cliente API, debes disponer de tus claves de acceso API. Si tu empresa está adherida al Servicio de Lista Robinson, puedes obtener las claves siguiendo estos pasos:

1. Pulsa sobre [este enlace](%___PLACEHOLDER_appSlrHomeUrl___%%___PLACEHOLDER_appSlrGetKeysUrl___%) para acceder a la gestión de la suscripción al Servicio de tu empresa.
2. En la parte inferior, pulsa el botón “GENERAR ACCESO AL API”:

![Panel generación credenciales API](manual-genapi.567x321.png "Panel de generación de credenciales API")

3. Se mostrarán tus nuevas claves de acceso a la API en la pantalla:

![Credenciales API generadas](manual-apicreds.567x153.png "Credenciales API generadas")

Si pierdes tus claves API, tendrás que generar unas nuevas. Si quieres que tu navegador las recuerde para no tener que introducirlas de nuevo la próxima vez, activa la casilla ***%___PLACEHOLDER_login.remember-me___%*** e introduce una contraseña. Esta contraseña servirá para proteger tu sesión en este navegador y puede ser distinta a la que utilices en el Servicio de Lista Robinson.

Si no consigues obtener tus claves de acceso, puedes consultar con el equipo de soporte técnico de Adigital en [%___PLACEHOLDER_appEnterpriseContactEmail___%](mailto:%___PLACEHOLDER_appEnterpriseContactEmail___%).

<a name='config-help-placeholder'>

## 3. Cómo consultar la Lista Robinson

Para realizar una consulta a la Lista Robinson, debes seleccionar un fichero CSV con codificación UTF8 que contenga los datos que deseas consultar estructurado según se indica a continuación. No se recomienda que el fichero tenga más de 500.000 registros. Si tienes que consultar un número de registros superior a esa cifra, es recomendable que lo dividas en varios ficheros CSV.

### 3.1 Cómo estructurar el fichero con los datos a consultar

Los ficheros compatibles con el Cliente API de Lista Robinson deben:

- Estar en formato CSV
- Los campos deben estar separados por comas y en el orden indicado
- Opcionalmente, los campos pueden estar entrecomillados con comillas dobles (" ")

Según el canal a través del que se va a desarrollar la acción publicitaria, el fichero debe contener un tipo de datos u otro, de acuerdo con el Anexo I del [Reglamento del Servicio de Lista Robinson](https://www.listarobinson.es/reglamento) y que te resumimos a continuación.

#### 3.1.1 Campañas publicitarias mediante llamadas telefónicas o SMS/MMS

Si tu empresa va a desarrollar acciones publicitarias a través de llamadas telefónicas o por SMS/MMS, el fichero puede estructurarse de dos maneras distintas:

1. Nombres completos y teléfonos:
    1. “_Nombre_”
    2. “_Primer apellido_”
    3. “_Segundo apellido_”
    4. “_Teléfono_”
2. Sólo teléfonos:
    1. “_Teléfono_”

Por ejemplo:

Nombres, apellidos y teléfonos:

![Ejemplo teléfono nombres y apellidos](manual-phonefull.388x178.png "Ejemplo teléfono nombres y apellidos")

Solo teléfonos:

![Ejemplo solo teléfono](manual-phonesimple.206x163.png "Ejemplo solo teléfono")

#### 3.1.2 Campañas publicitarias mediante correo electrónico

Si tu empresa va a desarrollar acciones publicitarias a través de correo electrónico, el fichero deberá contener sólo direcciones de correo electrónico. Por ejemplo:

![Ejemplo email](manual-email.321x202.png "Ejemplo email")

#### 3.1.3 Campañas publicitarias mediante correo postal

Si tu empresa va a desarrollar acciones publicitarias a través de correo electrónico, el fichero deberá contener los siguientes datos y en el siguiente orden:

1. Nombre
2. Primer apellido
3. Segundo apellido
4. Nombre de la vía
5. Número de portal
6. Código postal
7. Código de provincia según INE

Es importante que el código de provincia se corresponda con la [tabla de códigos de provincia del Instituto Nacional de Estadística](http://www.ine.es/daco/daco42/codmun/cod_provincia.htm), de lo contrario, la consulta arrojará valores erróneos.

Si el domicilio no tiene número de portal, este debe representarse como "sn", en minúsculas. ***No*** serían válidas, por tanto, fórmulas como: "SN", "sin número", "S/N", etc.

Por ejemplo:

![Ejemplo postal](manual-postal.511x180.png "Ejemplo postal")

#### 3.1.4 Campañas publicitarias a destinatarios cuyo DNI/NIF/NIE es conocido por la empresa

Si tu empresa dispone del DNI/NIF/NIE de los destinatarios y estos son mayores de 14 años, podrás consultar la Lista Robinson mediante DNI/NIF/NIE. Para ello, el fichero deberá contener únicamente los DNI/NIF/NIE de los destinatarios. Por ejemplo:

![Ejemplo dni](manual-dninifnie.187x179.png "Ejemplo DNI/NIF/NIE")

Ten en cuenta que los DNI/NIF siempre deberán estar completos, con sus nueve dígitos y su letra final. Los NIE también deberán contener sus ocho dígitos, su letra inicial y su letra final.

Por ejemplo:

- Serían válidos:
    - "12345678A"
    - "00012345A"
    - "Y0001234A"
- ***NO*** serían válidos:
    - "12345A"
    - "Y1234A"

#### 3.1.5 Fichero CSV con registros para distintos canales

Si lo deseas, puedes incluir en un mismo fichero CSV varios canales, siempre y cuando:

1. Se respete la estructura indicada en los apartados anteriores.
2. Cada registro incorpore en la primera columna el indicador de canal correspondiente, pudiendo ser:
    - "PhoneFull": consulta al canal telefónico con nombre, apellidos y número de teléfono.
    - "PhoneSimple": consulta al canal telefónico sólo con número de teléfono.
    - "SmsFull": consulta al canal SMS/MMS con nombre, apellidos y número de teléfono.
    - "SmsSimple": consulta al canal SMS/MMS sólo con número de teléfono.
    - "Postal": consulta al canal postal.
    - "Email": consulta al canal de correo electrónico.
    - "DNI\_NIF\_NIE": consulta por DNI/NIF o NIE.

Por ejemplo:

![Ejemplo fichero_mixto](manual-mixed-file.560x249.png "Ejemplo de fichero con registros para distintos canales")

Opcionalmente pueden rellenarse las columnas vacías de los registros de canales más cortos con campos vacíos. Por ejemplo:

![Ejemplo fichero_mixto](manual-mixed-file-with-empty-fields.557x251.png "Ejemplo de fichero con registros para distintos canales y columnas vacías de relleno")


#### 3.1.6 Opcional: añadir un identificador en cada registro del fichero CSV

Si en tu empresa asignáis internamente identificadores a vuestros clientes, como puede ser un "número de cliente", puedes incluirlo en el fichero CSV a procesar para poder tratar los resultados después de la consulta con mayor facilidad.

Si decides incluirlo en el fichero CSV, el identificador deberá incorporarse en todos los registros del fichero y deberá estar:

 - En la primera columna, si el fichero CSV sólo contiene registros de un único canal.
 - En la segunda columna, si el fichero CSV tiene registros de distintos canales.

Ejemplo de fichero CSV con identificador de empresa y sólo para el canal telefónico con nombre y apellidos:

![Ejemplo Id_Empresa_Un_Canal](manual-phonefull-w-customfield.501x178.png "Ejemplo teléfono nombres y apellidos con identificador personalizado")

Ejemplo de fichero CSV con identificador de empresa y registros mixtos, para canal telefónico con nombre y apellidos y para email:

![Ejemplo Id_Empresa_Mixto](manual-mixed-customfield.601x232.png "Ejemplo fichero con registros para varios canales con  identificador personalizado")

### 3.2 Cómo iniciar el proceso de consulta

Una vez hayas preparado el fichero CSV con los datos que deseas consultar en la Lista Robinson, tendrás que iniciar sesión, tal y como se describe más arriba en el apartado correspondiente y, una vez dentro de la plataforma, deberás seleccionar el fichero en el Cliente API.

A continuación, deberás indicar el tipo de datos que contiene. El Cliente API tratará de determinar el tipo de datos que contiene el fichero CSV mediante un análisis y te propondrá una opción. **Es importante que revises que el análisis refleja el tipo de datos correcto y, si no es así, lo corrijas**.

Si tu fichero contiene registros para realizar consultas a distintos canales, deberás elegir la opción "Mixto".

Si tu fichero contiene como datos “_teléfonos_” o “_nombres, apellidos y teléfonos_”, también deberás indicar el canal de tu campaña, es decir, si la realizarás mediante llamadas telefónicas o SMS/MMS.

![Tipo de datos del fichero](manual-config.899x596.png "Selección del tipo de datos del fichero")

<a name='progress-help-placeholder'>

## 4. Realización y obtención del resultado de la consulta

Una vez hayas seleccionado en el Cliente API el fichero con los datos a consultar y el tipo de datos que contiene, el fichero será procesado y se iniciará la comparación con la Lista Robinson de acuerdo con las reglas establecidas en el Servicio.

Durante este proceso, el Cliente API leerá el fichero, normalizará los datos, generará los identificadores para la comparación, realizará la consulta de forma seudonimizada y cifrada a la Lista Robinson y recibirá los resultados.

Una vez el Cliente API haya finalizado el proceso, podrás guardar los resultados y comprobar a quién puede tu empresa realizar la acción publicitaria y a quién no.

![Guardado resultados](manual-resultsdownload.893x591.png "Guardado de los resultados")

El Cliente API te entregará los resultados como un nuevo fichero CSV que contiene, por cada registro:

1. Los datos de tu fichero CSV original
2. Si el registro está o no en la Lista Robinson
3. Los sectores publicitarios a los que se ha opuesto el ciudadano al inscribirse en la Lista Robinson
4. La prueba de la consulta realizada a la Lista Robinson

![Resultados](manual-results.505x178.png "Guardado de los resultados")

Si el registro pertenece a un ciudadano inscrito en la Lista Robinson, se indicará con un "1" en la columna correspondiente, si no consta en la Lista Robinson, con un "0".

Por su parte, los sectores publicitarios se representan por sus "_códigos de sector_". Puedes consultar el código de referencia de cada sector en [este enlace](https://www.listarobinson.es/sectores-publicitarios-y-sus-codigos-api).

Es importante que conserves tanto los registros como la prueba de consulta si quieres que, en el futuro, Adigital pueda emitir un certificado que confirme que has consultado uno o varios de estos registros. Esto puede serte de utilidad, por ejemplo, en el caso de una reclamación por parte de un tercero.

Puedes solicitar un certificado de consulta a Adigital en [%___PLACEHOLDER_appEnterpriseContactEmail___%](mailto:%___PLACEHOLDER_appEnterpriseContactEmail___%).


## 5. Cliente API para servidor

### 5.1 Funcionamiento

El Cliente API para servidor toma como parámetros:

1. _inputCSV_: ruta relativa o absoluta al archivo con formato CSV con los registros a consultar. La estructura del fichero debe ser la indicada en este manual.
2. _outputFolder_: carpeta donde se guardará el fichero con los resultados y, en su caso, los errores que se produjesen durante el proceso. Debe haber permisos de escritura y debe tener suficiente espacio de almacenamiento disponible.
3. _channel_: canal publicitario que se desea consultar. Para ver las opciones disponibles, puedes ejecutar el Cliente API para servidor sin parámetros.
4. _key_: clave de autenticación API.
5. _secret_: secreto de autenticación API.

Puedes generar la _key_ y el _secret_ de tu empresa desde [este enlace](%___PLACEHOLDER_appSlrHomeUrl___%%___PLACEHOLDER_appSlrGetKeysUrl___%).

### 5.2 Indicador de progreso

El Cliente API para servidor reporta el progreso del proceso de consulta cada segundo a través de la salida estándar (_stdout_) con un JSON con la siguiente estructura:

```
{
	"status": ${string},
	"appNeedUpdate": ${string|boolean},
	"totalRecords": ${number},
	"processed": ${number},
	"found": ${number},
	"notFound": ${number},
	"error": ${number},
	"eta": ${string},
	"avgRps": ${number},
	"progress": ${number}
}
```

El campo "_status_" puede contener los siguientes valores:

- _error-reading-file_: cuando el proceso de consulta no se ha podido iniciar por un error en la lectura del fichero. Este error puede producirse si el fichero no tiene una codificación UTF-8 correcta. En la salida _stderr_ se mostrarán más detalles sobre el error.
- _working_: el proceso de consulta se está ejecutando.
- _user-cancel_: el proceso de consulta ha sido detenido por el usuario (ej.: ctrl+c)
- _fatal-sys-error_: el proceso de consulta se ha detenido por un error del sistema.
- _done_: el proceso de consulta ha finalizado.

Los campos _totalRecords_, _processed_, _found_, _notFound_ y _error_ indican el número de registros del fichero CSV, cuántos se han procesado ya y el resultado obtenido de la consulta.

El campo _eta_ indica el tiempo restante estimado en formato _hh:mm:ss_. El campo _avgRps_ indica la media de registros por segundo procesados y el campo _progress_ indica el porcentaje de registros ya procesados.

El campo _appNeedUpdate_ indica si hay una versión del Cliente API para servidor más reciente disponible para descargar. **Si hay una versión más reciente disponible, es importante actualizar el Cliente API lo antes posible**. Los posibles valores de este campo son:

- _checking_: (_string_) todavía se está comprobando si hay una versión más reciente disponible.
- _check-status-failed_: (_string_) no se ha podido comprobar si hay una versión más reciente disponible. 
- _true_: (_boolean_) hay una versión nueva del Cliente API para servidor.
- _false_: (_boolean_) ya versión en ejecución es la más reciente.
- _check-disabled_: (_string_) la comprobación de nuevas versiones está desactivada.

El Cliente API para servidor reporta los errores producidos durante su ejecución a través de la salida de errores (_stderr_). 

### 5.3 Resultados

El Cliente API para servidor crea en la carpeta de salida (_outputFolder_) dos archivos, uno para los resultados correctamente consultados y otro para los errores. El nombre de estos archivos seguirá el patrón:

`{$NombreArchivoOriginal}_slr-client-{$Tipo}_{$FechaISO}.{$Extensión}`

Por ejemplo, si se consultan los registros del fichero "_campaña-enero.csv_":

- "campaña-enero\_slr-client-success\_20200101T103045.csv"
- "campaña-enero\_slr-client-error\_20200101T103045.csv"

Si no se produjo ningún error, el fichero de errores estará vacío. 

### 5.4 Parámetros avanzados

_NOTA: no se recomienda modificar estos parámetros salvo que sea necesario._

El Cliente API para servidor admite los siguientes parámetros avanzados:

1. _maxRps_: número máximo de registros por segundo consultados. Un mayor número implicará un mayor consumo de recursos, aunque el proceso tardará menos. Por defecto, el Cliente API para servidor tratará de consultar a 2000 registros por segundo y la velocidad máxima configurable es de 6000.
2. _maxCoresToUse_: número máximo de núcleos de la CPU a utilizar. Cuantos más núcleos en uso, más memoria RAM se requerirá. Por defecto, el Cliente API para servidor tratará de utilizar el número máximo de núcleos disponibles.
3. _linesPerTask_: número de registros que se mantendrán en memoria por cada núcleo. Cuanto más alta sea esta cifra, mayor será el consumo de RAM, aunque puede favorecer la velocidad de consulta. Por defecto, este valor es de 40000.
4. _disableCheckUpdates_: desactiva las comprobaciones de actualizaciones del Cliente API para servidor.
5. _customApi_: URL de API del Servicio de Lista Robinson personalizada. Debe indicarse sólo el dominio, sin el protocolo ni la ruta. Puede especificarse un puerto distinto del predeterminado utilizando ":".

Si tu sistema tiene poca memoria RAM o si el sistema operativo corta el proceso del Cliente API para servidor por falta de memoria RAM libre, puedes reducir _linesPerTask_ o _maxCoresToUse_ para reducir el uso de memoria.