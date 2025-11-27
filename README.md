# My Princess — Proyecto

Este repositorio contiene una página estática simple: `index.html` con una galería y versos para dedicar "A ella".

Qué hice:
- Separé estilos personalizados en `styles.css` para mejorar mantenibilidad.
- Reorganicé la estructura HTML usando semantic tags (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`).
- Añadí clases (p. ej., `responsive-img`) y pequeños helpers de accesibilidad (salto al contenido).

Cómo editar contenido:
- Versos: busca los textos con comillas, p. ej., "Pon aquí un verso..." y cámbialos.
- Fotos: coloca tus imágenes dentro de la carpeta `fotos/` y actualiza los `src` en `index.html`.

Cómo hacer que el contenedor se ajuste al tamaño de la imagen:
- Evita usar clases con altura fija (p.ej., `h-80`, `h-72`). En su lugar usa padding vertical (`py-4`, `py-6`, `py-10`) para que el contenedor crezca según la altura de la imagen.
- Usa clases responsivas en la etiqueta `<img>`, por ejemplo: `class="responsive-img max-w-md h-auto object-contain"`.
- Si quieres que el contenedor tenga exactamente las dimensiones originales de la imagen, elimina `max-w-md` y añade al contenedor un `display` tipo inline: por ejemplo, usa `inline-block` en un contenedor y `class="responsive-img"` en la imagen.
- Para imágenes de fondo (si optas por usar `background-image` en un div) usa `bg-contain bg-center bg-no-repeat` y define una altura mínima o padding para mantener el tamaño.
- Usa `loading="lazy"` para mejorar rendimiento al tener muchas imágenes.

Cómo colocar el verso a la izquierda y la imagen a la derecha:
- Envuelve el `aside` (verso) y el `section` (imagen) en un contenedor `div` con `flex`:
	```html
	<div class="flex flex-col md:flex-row items-start md:items-center gap-6">
		<aside class="md:w-1/2">...verso...</aside>
		<section class="md:w-1/2">...imagen...</section>
	</div>
	```
- Si prefieres mantener la imagen en el DOM primero y sin moverla, puedes usar `md:flex-row-reverse` y mantener el DOM con la imagen primero y el verso segundo (esto inverse el orden en md+).

Cómo aumentar el ancho de un verso en 100px (ejemplo):
- Si usas un layout `flex` con `md:w-1/2` para imagen y verso, puedes hacer que el verso tenga 100px más en pantallas `md+` de esta forma:
	- Añade la clase `md:w-[calc(50%+100px)]` al `aside` del verso para que su ancho sea 50% + 100px en pantallas medianas hacia arriba.
	- Remueve o ajusta cualquier `max-w-*` que limite el ancho (p. ej. `max-w-md`).
	- Ejemplo:
	```html
	<aside class="md:w-[calc(50%+100px)] max-w-[calc(50%+100px)] ...">...</aside>
	```
	- Si prefieres que la imagen siga ocupando el resto del espacio, deja `section` con `md:w-1/2` o ajusta a `md:w-[calc(50%-100px)]` si quieres que la suma sea exactamente 100%.

Notas técnicas:
- Tailwind CSS se carga por CDN en `index.html`. Si quieres quitarlo y usar CSS propio, borra el script y añade tus clases en `styles.css`.
- `styles.css` contiene la importación de fuentes y animaciones.

¡Listo! Puedes abrir `index.html` en un navegador para ver los cambios.
