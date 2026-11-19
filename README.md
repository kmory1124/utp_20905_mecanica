# Simulador de izaje UTP · Sección 20905

## Abrir en tu equipo

Descomprime el ZIP y abre `index.html` en el navegador. Selecciona **Simulador** en el menú. El sitio funciona sin instalar dependencias y sin internet. Para probarlo por HTTP, abre la terminal en la carpeta que contiene `index.html` y ejecuta:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visita [http://localhost:8000](http://localhost:8000). Detén el servidor con Ctrl+C.

## Probar el simulador

- Con 200 kg de carga, 200 kg de capacidad hipotética y 15 s de ascenso, espera 1 962 N de tensión, 88 290 J de trabajo ideal, 5 886 W de potencia ideal media (cálculo complementario) y 3 m/s de velocidad media.
- Con 201 kg de carga y 200 kg de capacidad, espera una alerta de 1 kg de exceso y el botón de izaje deshabilitado.
- Pausa, reanuda o reinicia con los botones correspondientes. Si editas un parámetro, el visor vuelve al suelo.
- La caída libre parte de 45 m en un escenario independiente y dura unos 3,03 s en el modelo.
- El tiempo inicial de 15 s es un valor de demostración editable. La capacidad configurada es hipotética y el resultado carece de valor como certificación de seguridad.

## Personalizar la portada

Consulta [img/LEEME.md](img/LEEME.md) para colocar el logo, la foto del profesor y la imagen del curso. Completa el nombre del grupo y del docente donde aparecen los textos pendientes.

## Publicar en un hosting estático o servidor privado

1. Copia el contenido de esta carpeta a la raíz pública del sitio, conservando las carpetas `css`, `js` e `img`. Configura `index.html` como página inicial.
2. Registra un dominio disponible en el registrador de tu elección o usa un subdominio que ya controles. Para la sección 20905, una idea de nombre es `utpseccion20905mecanicaclasica` más la extensión deseada. La disponibilidad queda por verificar.
3. Configura el DNS con los registros que indique tu hosting. En un servidor propio con IP fija, apunta los registros A y, si corresponde, AAAA al servidor.
4. Asocia el dominio al sitio, emite un certificado TLS desde el hosting o con un cliente ACME en tu servidor, y habilita la redirección de HTTP a HTTPS.
5. Abre la portada por HTTPS y verifica el menú, las imágenes y la animación.

## Publicar en Azure Static Web Apps

1. Sube estos archivos a la raíz de un repositorio de GitHub. Crea un recurso **Static Web Apps** en Azure y conecta el repositorio y la rama.
2. Selecciona el preajuste **Custom**. Usa `/` como ubicación de la aplicación y deja vacías las ubicaciones de API y salida. En el paso `Azure/static-web-apps-deploy` del flujo creado por Azure, comprueba estos valores en `with`:

   ```yaml
   app_location: "/"
   api_location: ""
   output_location: ""
   skip_app_build: true
   ```

3. Cuando termine GitHub Actions, prueba la URL HTTPS generada por Azure.
4. En **Custom domains**, agrega un dominio propio y sigue los pasos de validación DNS. Para un subdominio suele usarse CNAME. Para el dominio raíz, sigue la guía correspondiente al proveedor DNS. Azure emite el certificado TLS. Comprueba el sitio con la URL personalizada una vez validada.

Fuentes oficiales de Microsoft: [creación del recurso](https://learn.microsoft.com/en-us/azure/static-web-apps/get-started-portal), [configuración de compilación](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions), [dominios y certificados](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain).
